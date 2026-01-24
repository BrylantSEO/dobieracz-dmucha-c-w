import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function StepDateTime({ data, onChange }) {
  const selectedDate = data.event_date ? new Date(data.event_date) : undefined;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Kiedy planujesz imprezę?
        </h2>
        <p className="text-slate-500">
          Wybierz datę i godziny, abyśmy mogli sprawdzić dostępność
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Data imprezy *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !selectedDate && "text-slate-400"
                )}
              >
                <CalendarDays className="mr-3 h-5 w-5 text-violet-500" />
                {selectedDate
                  ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: pl })
                  : 'Wybierz datę'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) =>
                  onChange({ event_date: date ? format(date, 'yyyy-MM-dd') : '' })
                }
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-violet-500" />
            <span className="font-medium text-slate-700">Cały dzień</span>
          </div>
          <Switch
            checked={data.is_full_day || false}
            onCheckedChange={(checked) => onChange({ is_full_day: checked })}
          />
        </div>

        {!data.is_full_day && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Godzina rozpoczęcia
              </Label>
              <Input
                type="time"
                value={data.event_start_time || ''}
                onChange={(e) => onChange({ event_start_time: e.target.value })}
                className="h-12"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Godzina zakończenia
              </Label>
              <Input
                type="time"
                value={data.event_end_time || ''}
                onChange={(e) => onChange({ event_end_time: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}