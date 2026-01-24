import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { MapPin, Zap, Ruler, TreeDeciduous, Square, Home, Umbrella } from 'lucide-react';

const surfaceTypes = [
  { id: 'grass', label: 'Trawa', icon: TreeDeciduous },
  { id: 'asphalt', label: 'Asfalt/Kostka', icon: Square },
  { id: 'indoor', label: 'Sala/Hala', icon: Home },
  { id: 'sand', label: 'Piasek', icon: Umbrella },
];

export default function StepLocation({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Gdzie odbędzie się impreza?
        </h2>
        <p className="text-slate-500">
          Sprawdzimy czy dmuchaniec zmieści się na miejscu
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Miasto *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={data.city || ''}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="np. Warszawa"
                className="h-12 pl-10"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Kod pocztowy
            </Label>
            <Input
              value={data.postal_code || ''}
              onChange={(e) => onChange({ postal_code: e.target.value })}
              placeholder="00-000"
              className="h-12"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Adres (opcjonalnie)
          </Label>
          <Input
            value={data.address || ''}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="ul. Przykładowa 123"
            className="h-12"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-violet-500" />
            <div>
              <span className="font-medium text-slate-700">Na zewnątrz</span>
              <p className="text-xs text-slate-500">Ogród, park, plac</p>
            </div>
          </div>
          <Switch
            checked={data.is_outdoor !== false}
            onCheckedChange={(checked) => onChange({ is_outdoor: checked })}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">
            Nawierzchnia
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {surfaceTypes.map((surface) => {
              const Icon = surface.icon;
              const isSelected = data.surface_type === surface.id;
              return (
                <button
                  key={surface.id}
                  type="button"
                  onClick={() => onChange({ surface_type: surface.id })}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    isSelected
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isSelected ? "text-violet-600" : "text-slate-400")} />
                  <span className={cn("text-sm", isSelected ? "text-violet-700 font-medium" : "text-slate-600")}>
                    {surface.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
            <Ruler className="w-4 h-4 text-violet-500" />
            Dostępna przestrzeń (metry)
          </Label>
          <div className="flex gap-3 items-center">
            <Input
              type="number"
              min="1"
              value={data.space_length || ''}
              onChange={(e) => onChange({ space_length: parseFloat(e.target.value) || null })}
              placeholder="Długość"
              className="h-12"
            />
            <span className="text-slate-400">×</span>
            <Input
              type="number"
              min="1"
              value={data.space_width || ''}
              onChange={(e) => onChange({ space_width: parseFloat(e.target.value) || null })}
              placeholder="Szerokość"
              className="h-12"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Możesz pominąć - dopytamy o szczegóły
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-medium text-slate-700">Dostęp do prądu</span>
              <p className="text-xs text-slate-500">Gniazdko 230V w pobliżu</p>
            </div>
          </div>
          <Switch
            checked={data.has_power !== false}
            onCheckedChange={(checked) => onChange({ has_power: checked })}
          />
        </div>
      </div>
    </div>
  );
}