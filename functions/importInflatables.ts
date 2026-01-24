import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.business_role !== 'admin')) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length < 2) {
      return Response.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          // Parse different field types
          if (header === 'requires_power' || header === 'indoor_suitable' || 
              header === 'outdoor_suitable' || header === 'is_active' || 
              header === 'requires_operator') {
            row[header] = value?.toLowerCase() === 'true' || value === '1';
          } else if (header === 'age_min' || header === 'age_max' || 
                     header === 'max_capacity' || header === 'length_m' || 
                     header === 'width_m' || header === 'height_m' || 
                     header === 'min_space_length' || header === 'min_space_width' ||
                     header === 'setup_time_minutes' || header === 'base_price' ||
                     header === 'price_per_hour' || header === 'delivery_price' ||
                     header === 'setup_price' || header === 'power_outlets_needed' ||
                     header === 'blower_count' || header === 'sort_order') {
            row[header] = value ? parseFloat(value) : undefined;
          } else if (header === 'surface_types') {
            row[header] = value ? value.split(';').map(s => s.trim()) : [];
          } else {
            row[header] = value || undefined;
          }
        });

        // Validate required fields
        if (!row.name || !row.type || !row.base_price) {
          results.errors.push(`Wiersz ${i + 1}: Brakuje wymaganych pól (name, type, base_price)`);
          results.failed++;
          continue;
        }

        await base44.asServiceRole.entities.Inflatable.create(row);
        results.success++;
      } catch (error) {
        results.errors.push(`Wiersz ${i + 1}: ${error.message}`);
        results.failed++;
      }
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});