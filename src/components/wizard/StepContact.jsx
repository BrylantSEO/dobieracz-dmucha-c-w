import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Shield, AlertCircle } from 'lucide-react';

export default function StepContact({ data, onChange }) {
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    const re = /^(\+48)?[0-9]{9}$/;
    return re.test(cleaned);
  };

  const handleChange = (field, value) => {
    onChange({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field, value) => {
    if (field === 'contact_email' && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, contact_email: 'Podaj prawidłowy adres email' }));
      }
    }
    
    if (field === 'contact_phone' && value) {
      if (!validatePhone(value)) {
        setErrors(prev => ({ ...prev, contact_phone: 'Podaj prawidłowy numer telefonu (9 cyfr)' }));
      }
    }

    if (field === 'contact_name' && value && value.length < 2) {
      setErrors(prev => ({ ...prev, contact_name: 'Imię musi mieć co najmniej 2 znaki' }));
    }
  };

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
              onChange={(e) => handleChange('contact_name', e.target.value)}
              onBlur={(e) => handleBlur('contact_name', e.target.value)}
              placeholder="Jan Kowalski"
              className={`h-12 pl-10 ${errors.contact_name ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.contact_name && (
            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.contact_name}
            </div>
          )}
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
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              onBlur={(e) => handleBlur('contact_phone', e.target.value)}
              placeholder="123 456 789"
              className={`h-12 pl-10 ${errors.contact_phone ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.contact_phone && (
            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.contact_phone}
            </div>
          )}
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
              onChange={(e) => handleChange('contact_email', e.target.value)}
              onBlur={(e) => handleBlur('contact_email', e.target.value)}
              placeholder="jan@email.pl"
              className={`h-12 pl-10 ${errors.contact_email ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.contact_email && (
            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errors.contact_email}
            </div>
          )}
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