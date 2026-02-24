import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    const err = await response.text();
    throw new Error(`OpenRouter embedding error: ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

function buildContent(inf: Record<string, unknown>, tagNames: string[]): string {
  const eventTypesFit = Array.isArray(inf.event_types_fit)
    ? (inf.event_types_fit as string[]).join(', ')
    : '';

  const parts = [
    `Nazwa: ${inf.name || ''}`,
    `Typ: ${inf.type || ''}`,
    `Opis: ${inf.description || ''}`,
    `Dla wieku: ${inf.age_min ?? '?'}-${inf.age_max ?? '?'} lat`,
    `Tagi: ${tagNames.join(', ') || 'brak'}`,
    `Intensywność: ${inf.intensity || ''}`,
    `Pojemność: ${inf.max_capacity ?? '?'} osób, jednocześnie: ${inf.simultaneous_capacity ?? '?'}`,
    eventTypesFit ? `Najlepszy dla eventów: ${eventTypesFit}` : '',
    inf.color_theme ? `Motyw: ${inf.color_theme}` : '',
    inf.best_for_notes ? `Notatki: ${inf.best_for_notes}` : '',
    inf.wow_factor ? `Wow factor: ${inf.wow_factor}/5` : '',
  ];
  return parts.filter(p => p && !p.endsWith(': ')).join('\n');
}

Deno.serve(async (req) => {
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openrouterKey) {
      return Response.json({
        error: 'Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY required',
      }, { status: 500 });
    }

    // Fetch all active inflatables and tags
    const inflatables = await client.asServiceRole.entities.Inflatable.filter({ is_active: true });
    const tags = await client.asServiceRole.entities.Tag.filter({ is_active: true });
    const tagsById: Record<string, { name: string }> = {};
    tags.forEach((t: { id: string; name: string }) => { tagsById[t.id] = t; });

    const errors: string[] = [];
    let synced = 0;

    // Process in batches of 20 to avoid rate limits
    const BATCH_SIZE = 20;
    for (let i = 0; i < inflatables.length; i += BATCH_SIZE) {
      const batch = inflatables.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (inf: Record<string, unknown>) => {
        try {
          const tagNames = ((inf.tag_ids as string[]) || [])
            .map((id: string) => tagsById[id]?.name)
            .filter(Boolean);

          const content = buildContent(inf, tagNames);
          const embedding = await generateEmbedding(content, openrouterKey);

          const upsertBody = {
            inflatable_id: inf.id,
            content,
            embedding,
            metadata: {
              name: inf.name,
              type: inf.type,
              age_min: inf.age_min,
              age_max: inf.age_max,
              intensity: inf.intensity,
              is_competitive: inf.is_competitive,
              max_capacity: inf.max_capacity,
              simultaneous_capacity: inf.simultaneous_capacity,
              event_types_fit: inf.event_types_fit,
              wow_factor: inf.wow_factor,
              color_theme: inf.color_theme,
              tag_ids: inf.tag_ids,
            },
            updated_at: new Date().toISOString(),
          };

          const upsertRes = await fetch(
            `${supabaseUrl}/rest/v1/inflatable_search?on_conflict=inflatable_id`,
            {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates',
              },
              body: JSON.stringify(upsertBody),
            }
          );

          if (!upsertRes.ok) {
            const errText = await upsertRes.text();
            throw new Error(`Supabase upsert failed for ${inf.id}: ${errText}`);
          }

          synced++;
        } catch (e) {
          errors.push(`${inf.id}: ${(e as Error).message}`);
        }
      }));

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < inflatables.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    return Response.json({ synced, errors, total: inflatables.length });

  } catch (error) {
    console.error('syncInflatablesToSupabase error:', error);
    return Response.json({
      error: (error as Error).message,
    }, { status: 500 });
  }
});
