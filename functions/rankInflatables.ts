import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Konfiguracja wag dla scoringu tagowego
const RANKING_CONFIG = {
  // Wagi dla PRZEDSZKOLE lub wiek < 6
  PRESCHOOL: {
    boosts: {
      'EVENT:przedszkole': 40,
      'AGE:dla maluchów (2-4)': 35,
      'AGE:przedszkole (3-6)': 35,
      'INTENT:spokojne': 15,
      'MECHANIC:zamek': 10,
      'THEME:kolorowy': 5
    },
    penalties: {
      'MECHANIC:tor przeszkód': -25,
      'AGE:starszaki (10-14)': -35,
      'AGE:młodzież/dorośli': -35,
      'INTENT:hardcore/rywalizacja': -20,
      'INTENT:rywalizacja': -15
    }
  },

  // Wagi dla SZKOŁA / półkolonie (6-10)
  SCHOOL: {
    boosts: {
      'EVENT:szkoła/półkolonie': 30,
      'AGE:szkoła (6-10)': 25,
      'MECHANIC:tor przeszkód': 20,
      'MECHANIC:duel': 15,
      'MECHANIC:zjeżdżalnia': 8,
      'INTENT:średnie': 10,
      'INTENT:rywalizacja': 5
    },
    penalties: {
      'AGE:dla maluchów (2-4)': -10,
      'INTENT:spokojne': -10,
      'MECHANIC:zjeżdżalnia': -10
    }
  },

  // Wagi dla URODZINY (różne wieki)
  BIRTHDAY: {
    boosts: {
      'EVENT:urodziny': 25,
      'MECHANIC:zjeżdżalnia': 10,
      'MECHANIC:zamek': 8,
      'INTENT:wow/premium': 8,
      'MECHANIC:2w1': 7,
      'MECHANIC:multi-atrakcja': 7
    },
    penalties: {}
  },

  // Wagi dla FESTYN/PIKNIK (mix wieku)
  FESTIVAL: {
    boosts: {
      'EVENT:festyn/piknik': 30,
      'MECHANIC:multi-atrakcja': 15,
      'INTENT:wow/premium': 10,
      'MECHANIC:tor przeszkód': 8,
      'MECHANIC:zjeżdżalnia': 8
    },
    penalties: {}
  },

  // Wagi dla EVENT FIRMOWY
  CORPORATE: {
    boosts: {
      'EVENT:event firmowy': 35,
      'MECHANIC:multi-atrakcja': 12,
      'MECHANIC:tor przeszkód': 10,
      'INTENT:rywalizacja': 10,
      'INTENT:wow/premium': 8
    },
    penalties: {
      'AGE:dla maluchów (2-4)': -20
    }
  }
};

// Oblicza overlap między dwoma zakresami [a1, a2] i [b1, b2]
function calculateAgeOverlap(userMin: number, userMax: number, infMin: number, infMax: number): number {
  if (!infMin || !infMax) return 0.5;

  const overlapStart = Math.max(userMin, infMin);
  const overlapEnd = Math.min(userMax, infMax);

  if (overlapStart > overlapEnd) return 0;

  const overlapSize = overlapEnd - overlapStart;
  const userRange = userMax - userMin;
  const infRange = infMax - infMin;
  const avgRange = (userRange + infRange) / 2;

  return Math.min(overlapSize / (avgRange || 1), 1);
}

// Określa profil wyszukiwania na podstawie wieku i typu wydarzenia
function determineSearchProfile(eventType: string, ageMin: number, ageMax: number): string {
  const avgAge = (ageMin + ageMax) / 2;

  if (eventType === 'przedszkole' || avgAge < 6) return 'PRESCHOOL';
  if (eventType === 'school_event' || (avgAge >= 6 && avgAge <= 10)) return 'SCHOOL';
  if (eventType === 'festival' || eventType === 'corporate_picnic') return 'FESTIVAL';
  if (eventType === 'corporate_event') return 'CORPORATE';

  return 'BIRTHDAY';
}

// Ekstrakcja informacji z opisu użytkownika przez LLM
async function extractInfoFromDescription(
  description: string,
  base44Client: Record<string, unknown>
): Promise<{ is_outdoor?: boolean; ageMin?: number; ageMax?: number }> {
  try {
    const response = await (base44Client as { integrations: { Core: { InvokeLLM: (opts: unknown) => Promise<unknown> } } })
      .integrations.Core.InvokeLLM({
        prompt: `Wyciągnij kluczowe informacje z opisu imprezy. Jeśli czegoś brak, pozostaw null.

Opis: "${description}"

Wyciągnij:
- ageMin: minimalny wiek uczestników (liczba lub null)
- ageMax: maksymalny wiek uczestników (liczba lub null)
- is_outdoor: czy na zewnątrz (boolean lub null, null = nieznane)`,
        response_json_schema: {
          type: 'object',
          properties: {
            ageMin: { type: 'number' },
            ageMax: { type: 'number' },
            is_outdoor: { type: 'boolean' },
          }
        }
      });
    return (response as Record<string, unknown>) || {};
  } catch {
    return {};
  }
}

// Generuje embedding przez OpenRouter
async function generateEmbedding(text: string, openrouterKey: string): Promise<number[]> {
  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter embedding error: ${await response.text()}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Wyszukiwanie semantyczne w Supabase pgvector
async function semanticSearch(
  embedding: number[],
  supabaseUrl: string,
  supabaseKey: string,
  matchCount = 20
): Promise<Array<{ inflatable_id: string; similarity: number }>> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_inflatables`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: matchCount,
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase semantic search error: ${await response.text()}`);
  }

  return response.json();
}

// Generuje spersonalizowane uzasadnienia dla top-6 przez LLM
async function generatePersonalizedReasons(
  candidates: Array<{ id: string; name: string; description: string; tags: string[]; intensity: string; is_competitive: boolean }>,
  userDescription: string,
  eventContext: { eventType: string; ageMin: number; ageMax: number; intensity: string },
  base44Client: Record<string, unknown>
): Promise<Record<string, string[]>> {
  try {
    const response = await (base44Client as { integrations: { Core: { InvokeLLM: (opts: unknown) => Promise<unknown> } } })
      .integrations.Core.InvokeLLM({
        prompt: `Jesteś asystentem doboru dmuchańców.

Zapytanie klienta: "${userDescription}"
Typ imprezy: ${eventContext.eventType || 'nieokreślony'}, Wiek: ${eventContext.ageMin}-${eventContext.ageMax} lat, Intensywność: ${eventContext.intensity}

Dla każdego dmuchańca napisz 2 KONKRETNE zdania dlaczego jest idealny dla TEGO klienta.
Odpowiedz na co konkretnie napisał klient. Nie używaj ogólników.

Kandydaci:
${JSON.stringify(candidates, null, 2)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  inflatable_id: { type: 'string' },
                  reasons: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

    const result = response as { results?: Array<{ inflatable_id: string; reasons: string[] }> };
    const reasonsMap: Record<string, string[]> = {};
    (result?.results || []).forEach(r => {
      reasonsMap[r.inflatable_id] = r.reasons;
    });
    return reasonsMap;
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      userDescription,
      eventType,
      ageMin,
      ageMax,
      spaceLength,
      spaceWidth,
      eventDate,
      isCompetitive,
      intensity
    } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');

    const hasSemanticSearch = !!(supabaseUrl && supabaseKey && openrouterKey);

    // Krok 1: Pobranie wszystkich aktywnych dmuchańców i tagów
    const inflatables = await base44.asServiceRole.entities.Inflatable.filter({ is_active: true });
    const tags = await base44.asServiceRole.entities.Tag.filter({ is_active: true });
    const tagsById: Record<string, { id: string; name: string; group?: string; category?: string }> = {};
    tags.forEach((t: { id: string; name: string; group?: string; category?: string }) => { tagsById[t.id] = t; });

    // Krok 2: Ekstrakcja info z opisu + semantic search (jeśli dostępne)
    let extractedInfo: { is_outdoor?: boolean; ageMin?: number; ageMax?: number } = {};
    let semanticScores: Record<string, number> = {};

    if (userDescription && hasSemanticSearch) {
      // Równolegle: ekstrakcja info i generowanie embeddingu
      const [extracted, embedding] = await Promise.all([
        extractInfoFromDescription(userDescription, base44),
        generateEmbedding(userDescription, openrouterKey!),
      ]);

      extractedInfo = extracted;

      const semanticResults = await semanticSearch(embedding, supabaseUrl!, supabaseKey!);
      semanticResults.forEach(r => {
        semanticScores[r.inflatable_id] = r.similarity;
      });
    } else if (userDescription) {
      extractedInfo = await extractInfoFromDescription(userDescription, base44);
    }

    // Efektywny outdoor: z formularza lub z ekstrakcji z opisu
    const effectiveIsOutdoor = extractedInfo.is_outdoor;

    // Efektywny wiek: z formularza lub z ekstrakcji
    const effectiveAgeMin = ageMin ?? extractedInfo.ageMin;
    const effectiveAgeMax = ageMax ?? extractedInfo.ageMax ?? effectiveAgeMin;

    // Krok 3: Twarde filtrowanie
    const candidates = inflatables.filter((inf: Record<string, unknown>) => {
      // Filtr wiek
      if (effectiveAgeMin !== undefined && effectiveAgeMax !== undefined) {
        if (inf.age_min && inf.age_max) {
          const overlap = calculateAgeOverlap(
            effectiveAgeMin, effectiveAgeMax,
            inf.age_min as number, inf.age_max as number
          );
          if (overlap === 0) return false;
        }
      }

      // Filtr wymiary przestrzeni
      if (spaceLength && spaceWidth) {
        if (inf.min_space_length && (inf.min_space_length as number) > spaceLength) return false;
        if (inf.min_space_width && (inf.min_space_width as number) > spaceWidth) return false;
      }

      // Filtr wewnątrz/zewnątrz (tylko jeśli wiemy z opisu lub formularza)
      if (effectiveIsOutdoor === false && !inf.indoor_suitable) return false;
      if (effectiveIsOutdoor === true && !inf.outdoor_suitable) return false;

      // Jeśli semantic search — weź tylko kandydatów ze scoringiem (lub tych bez danych jeśli brak wyników)
      if (hasSemanticSearch && Object.keys(semanticScores).length > 0) {
        if (!(inf.id as string in semanticScores)) return false;
      }

      return true;
    });

    // Krok 4: Batch sprawdzenie dostępności (1 fetch wszystkich bookingów dla daty)
    let bookedIds = new Set<string>();
    let blockedIds = new Set<string>();

    if (eventDate) {
      const [allBookings, allBlocks] = await Promise.all([
        base44.asServiceRole.entities.Booking.filter({}),
        base44.asServiceRole.entities.AvailabilityBlock.filter({ is_active: true }),
      ]);

      allBookings.forEach((b: Record<string, unknown>) => {
        if (
          b.status !== 'cancelled' &&
          eventDate >= (b.start_date as string) &&
          eventDate <= (b.end_date as string)
        ) {
          bookedIds.add(b.inflatable_id as string);
        }
      });

      allBlocks.forEach((b: Record<string, unknown>) => {
        if (
          eventDate >= (b.start_date as string) &&
          eventDate <= (b.end_date as string)
        ) {
          blockedIds.add(b.inflatable_id as string);
        }
      });
    }

    // Krok 5: Scoring
    const profile = determineSearchProfile(
      eventType || '',
      effectiveAgeMin || 0,
      effectiveAgeMax || 99
    );
    const config = RANKING_CONFIG[profile as keyof typeof RANKING_CONFIG];

    const rankedResults = candidates.map((inf: Record<string, unknown>) => {
      const infId = inf.id as string;
      const isAvailable = eventDate
        ? !bookedIds.has(infId) && !blockedIds.has(infId)
        : true;

      let score = 0;
      const reasons: string[] = [];

      // Semantic score (0-50 pkt)
      if (hasSemanticSearch && semanticScores[infId] !== undefined) {
        score += semanticScores[infId] * 50;
      } else {
        score += 25; // Neutralny punkt startowy bez semantic
      }

      // Tag scoring (0-40 pkt z RANKING_CONFIG)
      const inflatableTags = ((inf.tag_ids as string[]) || [])
        .map((tagId: string) => tagsById[tagId])
        .filter(Boolean);

      const eventTypeLabels: Record<string, string> = {
        'birthday': 'urodziny',
        'przedszkole': 'przedszkole',
        'school_event': 'wydarzenie szkolne',
        'festival': 'festyn',
        'corporate_event': 'imprezę firmową',
        'communion': 'komunię',
        'wedding': 'wesele'
      };

      let tagScore = 0;
      inflatableTags.forEach((tag: { name: string; group?: string; category?: string }) => {
        const tagGroup = tag.group || tag.category || '';
        const tagKey = `${tagGroup}:${tag.name}`;

        if (config.boosts[tagKey as keyof typeof config.boosts]) {
          tagScore += config.boosts[tagKey as keyof typeof config.boosts] as number;

          if (!userDescription) {
            // Tylko dodaj generic reasons jeśli nie mamy LLM personalizacji
            if (tagGroup === 'EVENT') {
              const eventLabel = eventTypeLabels[eventType] || 'to wydarzenie';
              reasons.push(`Doskonały wybór na ${eventLabel}`);
            } else if (tagGroup === 'AGE') {
              reasons.push('Idealny dla tej grupy wiekowej');
            } else if (tagGroup === 'MECHANIC') {
              if (tag.name === 'tor przeszkód') reasons.push('Świetny tor przeszkód - pełen wyzwań');
              else if (tag.name === 'zjeżdżalnia') reasons.push('Ekscytująca zjeżdżalnia - gwarantowana frajda');
              else reasons.push(`${tag.name} - świetna mechanika`);
            } else if (tagGroup === 'INTENT') {
              if (tag.name === 'rywalizacja') reasons.push('Wspaniała zabawa rywalizacyjna');
              else reasons.push('Odpowiedni charakter zabawy');
            }
          }
        }

        if (config.penalties[tagKey as keyof typeof config.penalties]) {
          tagScore += config.penalties[tagKey as keyof typeof config.penalties] as number;
        }
      });

      // Clamp tag score to 0-40
      score += Math.max(0, Math.min(tagScore, 40));

      // Age overlap (0-20 pkt)
      if (effectiveAgeMin !== undefined && effectiveAgeMax !== undefined && inf.age_min && inf.age_max) {
        const overlap = calculateAgeOverlap(
          effectiveAgeMin, effectiveAgeMax,
          inf.age_min as number, inf.age_max as number
        );
        score += overlap * 20;
      }

      // Intensity match (0 lub 15 pkt)
      if (intensity && inf.intensity) {
        const intensityMap: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 };
        const userLevel = intensityMap[intensity];
        const infLevel = intensityMap[inf.intensity as string];

        if (userLevel === infLevel) {
          score += 15;
        } else if (Math.abs(userLevel - infLevel) === 1) {
          score += 5;
        } else {
          score -= 10;
        }
      }

      // Competitive match (0 lub 15 pkt)
      if (isCompetitive !== undefined) {
        if (isCompetitive && inf.is_competitive) {
          score += 15;
        } else if (isCompetitive && !inf.is_competitive) {
          score -= 10;
        }
      }

      // event_types_fit match (+20 pkt)
      if (eventType && Array.isArray(inf.event_types_fit)) {
        const eventTypesMap: Record<string, string[]> = {
          'birthday': ['birthday'],
          'przedszkole': ['preschool'],
          'school_event': ['school'],
          'festival': ['festival'],
          'corporate_event': ['corporate'],
          'corporate_picnic': ['corporate', 'festival'],
          'communion': ['communion'],
          'wedding': ['wedding'],
        };
        const matchKeys = eventTypesMap[eventType] || [];
        const fits = inf.event_types_fit as string[];
        if (matchKeys.some(k => fits.includes(k))) {
          score += 20;
        }
      }

      // wow_factor boost (+10 pkt przy FESTIVAL/CORPORATE jeśli ≥4)
      if (inf.wow_factor && (inf.wow_factor as number) >= 4) {
        if (profile === 'FESTIVAL' || profile === 'CORPORATE') {
          score += 10;
        }
      }

      // simultaneous_capacity bonus (+5 przy FESTIVAL z dużą grupą)
      if (profile === 'FESTIVAL' && inf.simultaneous_capacity && (inf.simultaneous_capacity as number) > 8) {
        score += 5;
      }

      return {
        inflatable_id: infId,
        inflatable: inf,
        score: Math.max(0, Math.min(Math.round(score), 100)),
        reasons,
        is_available: isAvailable,
        rank: 0,
      };
    });

    // Sortowanie: dostępne na górze, potem po score
    rankedResults.sort((a: { is_available: boolean; score: number }, b: { is_available: boolean; score: number }) => {
      if (a.is_available !== b.is_available) return b.is_available ? 1 : -1;
      return b.score - a.score;
    });

    rankedResults.forEach((r: { rank: number }, idx: number) => { r.rank = idx + 1; });

    // Krok 6: Spersonalizowane uzasadnienia dla top-6 (jeśli mamy opis)
    if (userDescription && rankedResults.length > 0) {
      const top6 = rankedResults.slice(0, 6);
      const candidatesForLLM = top6.map((r: { inflatable_id: string; inflatable: Record<string, unknown> }) => {
        const inf = r.inflatable;
        const tagNames = ((inf.tag_ids as string[]) || [])
          .map((id: string) => tagsById[id]?.name)
          .filter(Boolean);
        return {
          id: r.inflatable_id,
          name: inf.name as string,
          description: (inf.description as string) || '',
          tags: tagNames,
          intensity: (inf.intensity as string) || '',
          is_competitive: (inf.is_competitive as boolean) || false,
        };
      });

      const personalizedReasons = await generatePersonalizedReasons(
        candidatesForLLM,
        userDescription,
        {
          eventType: eventType || '',
          ageMin: effectiveAgeMin || 0,
          ageMax: effectiveAgeMax || 99,
          intensity: intensity || '',
        },
        base44
      );

      // Nadpisz reasons spersonalizowanymi
      top6.forEach((r: { inflatable_id: string; reasons: string[] }) => {
        if (personalizedReasons[r.inflatable_id]) {
          r.reasons = personalizedReasons[r.inflatable_id];
        }
      });
    }

    return Response.json({
      results: rankedResults,
      profile,
      totalCount: rankedResults.length,
      availableCount: rankedResults.filter((r: { is_available: boolean }) => r.is_available).length,
      semanticEnabled: hasSemanticSearch,
    });

  } catch (error) {
    console.error('Ranking error:', error);
    return Response.json({
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
});
