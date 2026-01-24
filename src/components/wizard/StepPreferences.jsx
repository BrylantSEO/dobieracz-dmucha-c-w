import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  Waves, Mountain, Castle, Baby, 
  Palette, Sparkles, Coins
} from 'lucide-react';

const preferenceOptions = [
  { id: 'slide', label: 'Zjeżdżalnia', icon: Waves },
  { id: 'obstacle', label: 'Tor przeszkód', icon: Mountain },
  { id: 'castle', label: 'Zamek', icon: Castle },
  { id: 'toddlers', label: 'Dla maluchów', icon: Baby },
  { id: 'colorful', label: 'Kolorowy', icon: Palette },
  { id: 'themed', label: 'Tematyczny', icon: Sparkles },
];

export default function StepPreferences({ data, onChange }) {
  const preferences = data.preferences || [];

  const togglePreference = (id) => {
    const newPrefs = preferences.includes(id)
      ? preferences.filter(p => p !== id)
      : [...preferences, id];
    onChange({ preferences: newPrefs });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Jakie masz preferencje?
        </h2>
        <p className="text-slate-500">
          Wybierz co Cię interesuje - pomoże nam to dobrać najlepsze atrakcje
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-3 block">
            Co Cię interesuje? (możesz wybrać wiele)
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {preferenceOptions.map((pref) => {
              const Icon = pref.icon;
              const isSelected = preferences.includes(pref.id);
              return (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => togglePreference(pref.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    isSelected
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <Icon className={cn("w-6 h-6", isSelected ? "text-violet-600" : "text-slate-400")} />
                  <span className={cn("text-sm", isSelected ? "text-violet-700 font-medium" : "text-slate-600")}>
                    {pref.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Inne wymagania lub uwagi
          </Label>
          <Textarea
            value={data.other_requirements || ''}
            onChange={(e) => onChange({ other_requirements: e.target.value })}
            placeholder="np. dmuchaniec z motywem dinozaurów, bez zbyt stromych elementów..."
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl">
          <Label className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            Budżet (opcjonalnie)
          </Label>
          <div className="flex gap-3 items-center">
            <Input
              type="number"
              min="0"
              step="50"
              value={data.budget_min || ''}
              onChange={(e) => onChange({ budget_min: parseInt(e.target.value) || null })}
              placeholder="od"
              className="h-12"
            />
            <span className="text-slate-400">—</span>
            <Input
              type="number"
              min="0"
              step="50"
              value={data.budget_max || ''}
              onChange={(e) => onChange({ budget_max: parseInt(e.target.value) || null })}
              placeholder="do"
              className="h-12"
            />
            <span className="text-slate-500 font-medium">PLN</span>
          </div>
        </div>
      </div>
    </div>
  );
}