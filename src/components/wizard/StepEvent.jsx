import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Cake, Building2, Flag, Church, Heart, 
  GraduationCap, HelpCircle 
} from 'lucide-react';

const eventTypes = [
  { id: 'birthday', label: 'Urodziny', icon: Cake, color: 'bg-pink-500' },
  { id: 'corporate_picnic', label: 'Piknik firmowy', icon: Building2, color: 'bg-blue-500' },
  { id: 'festival', label: 'Festyn', icon: Flag, color: 'bg-orange-500' },
  { id: 'communion', label: 'Komunia', icon: Church, color: 'bg-purple-500' },
  { id: 'wedding', label: 'Wesele', icon: Heart, color: 'bg-red-500' },
  { id: 'school_event', label: 'Impreza szkolna', icon: GraduationCap, color: 'bg-green-500' },
  { id: 'other', label: 'Inne', icon: HelpCircle, color: 'bg-slate-500' },
];

export default function StepEvent({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Jaka to impreza?
        </h2>
        <p className="text-slate-500">
          Pomoże nam to dobrać odpowiednie atrakcje
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Label className="text-sm font-medium text-slate-700 mb-3 block">
          Typ imprezy *
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = data.event_type === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onChange({ event_type: type.id })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                  isSelected
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                )}
              >
                <div className={cn("p-2 rounded-lg", type.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-violet-700" : "text-slate-600"
                )}>
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        {data.event_type === 'other' && (
          <div className="mb-6">
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Opisz rodzaj imprezy
            </Label>
            <Input
              value={data.event_type_other || ''}
              onChange={(e) => onChange({ event_type_other: e.target.value })}
              placeholder="np. piknik rodzinny, dzień dziecka..."
              className="h-12"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Wiek uczestników (od - do)
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                type="number"
                min="1"
                max="99"
                value={data.participants_age_min || ''}
                onChange={(e) => onChange({ participants_age_min: parseInt(e.target.value) || null })}
                placeholder="od"
                className="h-12"
              />
              <span className="text-slate-400">—</span>
              <Input
                type="number"
                min="1"
                max="99"
                value={data.participants_age_max || ''}
                onChange={(e) => onChange({ participants_age_max: parseInt(e.target.value) || null })}
                placeholder="do"
                className="h-12"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Liczba dzieci / osób
            </Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={data.children_count || ''}
                  onChange={(e) => onChange({ children_count: parseInt(e.target.value) || null })}
                  placeholder="Dzieci"
                  className="h-12"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={data.total_participants || ''}
                  onChange={(e) => onChange({ total_participants: parseInt(e.target.value) || null })}
                  placeholder="Łącznie"
                  className="h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}