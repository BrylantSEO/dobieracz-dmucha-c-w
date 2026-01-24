import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { X, Bell, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

export default function NotificationModal({ inflatable, eventDate, onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setError('Wypełnij wszystkie pola');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await base44.entities.UnavailabilityNotification.create({
        inflatable_id: inflatable.id,
        event_date: eventDate,
        client_email: email,
        client_name: name,
        status: 'active'
      });

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError('Błąd przy zapisywaniu. Spróbuj ponownie.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-pink)' }}>
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-dark)' }}>Sukces!</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Powiadomimy Cię gdy <strong>{inflatable.name}</strong> będzie dostępny na {format(new Date(eventDate), 'd MMMM', { locale: pl })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-pink)' }}>
              <Bell className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold" style={{ color: 'var(--text-dark)' }}>Powiadomienie</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Zostaniesz powiadomiony gdy <strong>{inflatable.name}</strong> będzie dostępny na {format(new Date(eventDate), 'd MMMM yyyy', { locale: pl })}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" style={{ color: 'var(--text-dark)' }}>Imię</Label>
            <Input
              id="name"
              placeholder="Twoje imię"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" style={{ color: 'var(--text-dark)' }}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Twój email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 text-white"
              style={{ backgroundColor: 'var(--accent-pink)' }}
            >
              {loading ? 'Zapisywanie...' : 'Zapisz się'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}