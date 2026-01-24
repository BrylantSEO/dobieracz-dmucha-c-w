import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Shield } from 'lucide-react';

export default function StepContact({ data, onChange }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Gdzie wysłać propozycje?
        </h2>
        <p className="text-slate-500">
          Podaj dane kontaktowe, abyśmy mogli przygotować ofertę
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-5">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Imię i nazwisko *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={data.contact_name || ''}
              onChange={(e) => onChange({ contact_name: e.target.value })}
              placeholder="Jan Kowalski"
              className="h-12 pl-10"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Telefon *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="tel"
              value={data.contact_phone || ''}
              onChange={(e) => onChange({ contact_phone: e.target.value })}
              placeholder="123 456 789"
              className="h-12 pl-10"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Email *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="email"
              value={data.contact_email || ''}
              onChange={(e) => onChange({ contact_email: e.target.value })}
              placeholder="jan@email.pl"
              className="h-12 pl-10"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100 mt-6">
          <Shield className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-600">
            Twoje dane są bezpieczne. Używamy ich wyłącznie do przygotowania oferty i kontaktu w sprawie zamówienia.
          </p>
        </div>
      </div>
    </div>
  );
}