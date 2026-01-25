import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Users, Ruler } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PopularInflatables() {
  const [inflatables, setInflatables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await base44.entities.Inflatable.filter({ is_active: true });
      
      // Znajdź jeden tor przeszkód, jedną zjeżdżalnię, jeden zamek
      const obstacle = all.find(i => i.type === 'obstacle_course');
      const slide = all.find(i => i.type === 'slide');
      const castle = all.find(i => i.type === 'castle');
      
      setInflatables([obstacle, slide, castle].filter(Boolean));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  return (
    <div className="py-16 bg-slate-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Najczęściej wybierane
        </h2>
        <p className="text-center text-slate-600 mb-12">
          Te dmuchańce pokochały setki rodzin
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {inflatables.map((inflatable) => (
            <Card key={inflatable.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-200">
                {inflatable.main_image && (
                  <img
                    src={inflatable.main_image}
                    alt={inflatable.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 mb-2">{inflatable.name}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {inflatable.short_description || inflatable.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    max {inflatable.max_capacity || '?'} osób
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler className="w-4 h-4" />
                    {inflatable.length_m}×{inflatable.width_m}m
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Cena od</p>
                    <p className="text-xl font-bold text-slate-900">
                      {inflatable.base_price?.toLocaleString('pl-PL')} zł
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}