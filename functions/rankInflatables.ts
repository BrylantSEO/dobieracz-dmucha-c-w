import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Konfiguracja wag dla scoringu
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
      'MECHANIC:tor przeszkód': 10,
      'MECHANIC:zjeżdżalnia': 8,
      'INTENT:średnie': 10,
      'INTENT:rywalizacja': 5
    },
    penalties: {
      'AGE:dla maluchów (2-4)': -10,
      'INTENT:spokojne': -5
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
function calculateAgeOverlap(userMin, userMax, infMin, infMax) {
  if (!infMin || !infMax) return 0.5; // Brak danych o wieku = neutralne
  
  const overlapStart = Math.max(userMin, infMin);
  const overlapEnd = Math.min(userMax, infMax);
  
  if (overlapStart > overlapEnd) return 0; // Brak przecięcia
  
  const overlapSize = overlapEnd - overlapStart;
  const userRange = userMax - userMin;
  const infRange = infMax - infMin;
  const avgRange = (userRange + infRange) / 2;
  
  return Math.min(overlapSize / avgRange, 1);
}

// Określa profil wyszukiwania na podstawie wieku i typu wydarzenia
function determineSearchProfile(eventType, ageMin, ageMax) {
  const avgAge = (ageMin + ageMax) / 2;
  
  // Przedszkole
  if (eventType === 'przedszkole' || avgAge < 6) {
    return 'PRESCHOOL';
  }
  
  // Szkoła
  if (eventType === 'school_event' || (avgAge >= 6 && avgAge <= 10)) {
    return 'SCHOOL';
  }
  
  // Festyn/piknik
  if (eventType === 'festival' || eventType === 'corporate_picnic') {
    return 'FESTIVAL';
  }
  
  // Event firmowy
  if (eventType === 'corporate_event') {
    return 'CORPORATE';
  }
  
  // Urodziny (domyślnie)
  return 'BIRTHDAY';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      eventType, 
      ageMin, 
      ageMax, 
      isOutdoor, 
      spaceLength, 
      spaceWidth,
      eventDate 
    } = await req.json();

    // Krok 1: Pobranie wszystkich aktywnych dmuchańców
    const inflatables = await base44.asServiceRole.entities.Inflatable.filter({ 
      is_active: true 
    });

    // Krok 2: Pobranie wszystkich tagów
    const tags = await base44.asServiceRole.entities.Tag.filter({ is_active: true });
    const tagsById = {};
    tags.forEach(t => { tagsById[t.id] = t; });

    // Krok 3: Twarde filtrowanie
    const candidates = inflatables.filter(inf => {
      // Filtr wiek
      if (ageMin !== undefined && ageMax !== undefined) {
        if (inf.age_min && inf.age_max) {
          const overlap = calculateAgeOverlap(ageMin, ageMax, inf.age_min, inf.age_max);
          if (overlap === 0) return false;
        }
      }
      
      // Filtr wymiary przestrzeni
      if (spaceLength && spaceWidth) {
        if (inf.min_space_length && inf.min_space_length > spaceLength) return false;
        if (inf.min_space_width && inf.min_space_width > spaceWidth) return false;
      }
      
      // Filtr wewnątrz/zewnątrz
      if (isOutdoor === false && !inf.indoor_suitable) return false;
      if (isOutdoor === true && !inf.outdoor_suitable) return false;
      
      return true;
    });

    // Krok 4: Sprawdzenie dostępności (jeśli podano datę)
    const candidatesWithAvailability = await Promise.all(
      candidates.map(async (inf) => {
        let isAvailable = true;
        
        if (eventDate) {
          const bookings = await base44.asServiceRole.entities.Booking.filter({
            inflatable_id: inf.id,
          });
          
          const conflictingBooking = bookings.find(b => 
            b.status !== 'cancelled' &&
            eventDate >= b.start_date && eventDate <= b.end_date
          );
          
          if (conflictingBooking) {
            isAvailable = false;
          } else {
            const blocks = await base44.asServiceRole.entities.AvailabilityBlock.filter({
              inflatable_id: inf.id,
              is_active: true,
            });
            
            const conflictingBlock = blocks.find(b => 
              eventDate >= b.start_date && eventDate <= b.end_date
            );
            
            if (conflictingBlock) isAvailable = false;
          }
        }
        
        return { ...inf, isAvailable };
      })
    );

    // Krok 5: Scoring
    const profile = determineSearchProfile(eventType, ageMin || 0, ageMax || 99);
    const config = RANKING_CONFIG[profile];
    
    const rankedResults = candidatesWithAvailability.map(inf => {
      let score = 50; // Bazowy score
      const reasons = [];
      const penalties = [];
      
      // Tagi dmuchańca
      const inflatableTags = (inf.tag_ids || [])
        .map(tagId => tagsById[tagId])
        .filter(Boolean);
      
      // Scoring po tagach
      inflatableTags.forEach(tag => {
        const tagKey = `${tag.group}:${tag.name}`;
        
        // Boosty
        if (config.boosts[tagKey]) {
          score += config.boosts[tagKey];
          reasons.push(`${tag.name} (+${config.boosts[tagKey]})`);
        }
        
        // Kary
        if (config.penalties[tagKey]) {
          score += config.penalties[tagKey]; // Już ujemne
          penalties.push(`${tag.name} (${config.penalties[tagKey]})`);
        }
      });
      
      // Bonus za overlap wieku
      if (ageMin !== undefined && ageMax !== undefined && inf.age_min && inf.age_max) {
        const overlap = calculateAgeOverlap(ageMin, ageMax, inf.age_min, inf.age_max);
        const ageBonus = Math.round(overlap * 20);
        if (ageBonus > 0) {
          score += ageBonus;
          reasons.push(`Idealny wiek (+${ageBonus})`);
        }
      }
      
      // Bonus za wysoką przepustowość (przy festynach)
      if (profile === 'FESTIVAL' && inf.max_capacity && inf.max_capacity > 10) {
        score += 5;
        reasons.push('Wysoka pojemność (+5)');
      }
      
      return {
        inflatable_id: inf.id,
        inflatable: inf,
        score: Math.max(score, 0),
        reasons: reasons.slice(0, 4), // Max 4 powody
        penalties: penalties.slice(0, 2),
        is_available: inf.isAvailable,
        rank: 0 // Ustawi się później
      };
    });
    
    // Sortowanie: dostępne na górze, potem po score
    rankedResults.sort((a, b) => {
      if (a.is_available !== b.is_available) {
        return b.is_available ? 1 : -1;
      }
      return b.score - a.score;
    });
    
    // Przypisanie rankingu
    rankedResults.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    return Response.json({
      results: rankedResults,
      profile,
      totalCount: rankedResults.length,
      availableCount: rankedResults.filter(r => r.is_available).length
    });

  } catch (error) {
    console.error('Ranking error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});