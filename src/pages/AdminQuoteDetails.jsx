import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { 
  ArrowLeft, Calendar, MapPin, Users, Ruler, Zap,
  Phone, Mail, Star, CheckCircle2, XCircle, Loader2,
  CalendarPlus, Send, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-slate-100 text-slate-800',
};

const statusLabels = {
  new: 'Nowe',
  in_progress: 'W trakcie',
  quoted: 'Wycenione',
  confirmed: 'Potwierdzone',
  rejected: 'Odrzucone',
  cancelled: 'Anulowane',
};

const eventTypeLabels = {
  birthday: 'Urodziny',
  corporate_picnic: 'Piknik firmowy',
  festival: 'Festyn',
  communion: 'Komunia',
  wedding: 'Wesele',
  school_event: 'Impreza szkolna',
  other: 'Inne',
};

export default function AdminQuoteDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  const { data: request, isLoading } = useQuery({
    queryKey: ['quoteRequest', requestId],
    queryFn: () => base44.entities.QuoteRequest.filter({ id: requestId }).then(r => r[0]),
    enabled: !!requestId,
    onSuccess: (data) => setNotes(data?.admin_notes || ''),
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['recommendations', requestId],
    queryFn: () => base44.entities.QuoteRecommendation.filter({ quote_request_id: requestId }),
    enabled: !!requestId,
  });

  const { data: inflatables = [] } = useQuery({
    queryKey: ['inflatables'],
    queryFn: () => base44.entities.Inflatable.list(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.QuoteRequest.update(requestId, data),
    onSuccess: () => queryClient.invalidateQueries(['quoteRequest', requestId]),
  });

  const createBookingMutation = useMutation({
    mutationFn: async (inflatableId) => {
      const bookingNumber = `REZ-${Date.now().toString(36).toUpperCase()}`;
      const bookingData = {
        booking_number: bookingNumber,
        inflatable_id: inflatableId,
        quote_request_id: requestId,
        status: 'confirmed',
        start_date: request.event_date,
        end_date: request.event_date,
        start_time: request.event_start_time || '09:00',
        end_time: request.event_end_time || '18:00',
        client_name: request.contact_name,
        client_phone: request.contact_phone,
        client_email: request.contact_email,
        delivery_address: `${request.address || ''}, ${request.city}`,
        total_price: request.quoted_price || 0,
      };
      
      const response = await base44.functions.invoke('createBookingWithCalendar', { bookingData });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      alert('Rezerwacja utworzona, dodana do kalendarza i zablokowana w systemie!');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Zgłoszenie nie znalezione</p>
        <Link to={createPageUrl('AdminQuotes')}>
          <Button variant="outline" className="mt-4">Wróć do listy</Button>
        </Link>
      </div>
    );
  }

  const selectedRecs = recommendations.filter(r => r.was_selected);
  const availableRecs = recommendations.filter(r => r.is_available);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to={createPageUrl('AdminQuotes')}>
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Wróć do listy
        </Button>
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Info */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{request.request_number}</p>
                  <CardTitle className="text-xl">{request.contact_name}</CardTitle>
                </div>
                <Select 
                  value={request.status}
                  onValueChange={(v) => updateMutation.mutate({ status: v })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Telefon</p>
                    <a href={`tel:${request.contact_phone}`} className="font-medium text-violet-600">
                      {request.contact_phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <a href={`mailto:${request.contact_email}`} className="font-medium text-violet-600">
                      {request.contact_email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="font-medium">
                      {request.event_date ? format(new Date(request.event_date), 'EEEE, d MMMM yyyy', { locale: pl }) : '-'}
                    </p>
                    {request.event_start_time && (
                      <p className="text-sm text-slate-500">
                        {request.event_start_time} - {request.event_end_time || '?'}
                        {request.is_full_day && ' (cały dzień)'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-violet-500" />
                  <div>
                    <p className="font-medium">{request.city}</p>
                    {request.address && <p className="text-sm text-slate-500">{request.address}</p>}
                  </div>
                </div>
              </div>

              {/* Event Type & Participants */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Typ imprezy</p>
                  <Badge variant="outline" className="text-sm">
                    {eventTypeLabels[request.event_type] || request.event_type_other || request.event_type}
                  </Badge>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Uczestnicy</p>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">
                      {request.children_count || '?'} dzieci
                      {request.total_participants && ` / ${request.total_participants} łącznie`}
                    </span>
                  </div>
                  {(request.participants_age_min || request.participants_age_max) && (
                    <p className="text-sm text-slate-500 mt-1">
                      Wiek: {request.participants_age_min || '?'} - {request.participants_age_max || '?'} lat
                    </p>
                  )}
                </div>
              </div>

              {/* Space & Requirements */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Przestrzeń</p>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">
                      {request.space_length || '?'} × {request.space_width || '?'} m
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {request.is_outdoor ? 'Na zewnątrz' : 'Wewnątrz'} • 
                    {request.surface_type === 'grass' ? ' Trawa' : 
                     request.surface_type === 'asphalt' ? ' Asfalt' :
                     request.surface_type === 'indoor' ? ' Sala' : ' Inne'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Prąd</p>
                  <div className="flex items-center gap-2">
                    {request.has_power ? (
                      <><Zap className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600 font-medium">Dostępny</span></>
                    ) : (
                      <><XCircle className="w-4 h-4 text-red-500" /><span className="text-red-600 font-medium">Brak</span></>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              {(request.preferences?.length > 0 || request.other_requirements) && (
                <div className="p-4 bg-violet-50 rounded-xl">
                  <p className="text-sm text-violet-600 font-medium mb-2">Preferencje</p>
                  {request.preferences?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {request.preferences.map(p => (
                        <Badge key={p} className="bg-violet-100 text-violet-800">{p}</Badge>
                      ))}
                    </div>
                  )}
                  {request.other_requirements && (
                    <p className="text-sm text-slate-600">{request.other_requirements}</p>
                  )}
                </div>
              )}

              {/* Budget */}
              {(request.budget_min || request.budget_max) && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-600 font-medium mb-1">Budżet</p>
                  <p className="font-medium">
                    {request.budget_min || '?'} - {request.budget_max || '?'} PLN
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notatki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dodaj notatki wewnętrzne..."
                rows={4}
              />
              <Button
                className="mt-3"
                variant="outline"
                onClick={() => updateMutation.mutate({ admin_notes: notes })}
                disabled={updateMutation.isPending}
              >
                Zapisz notatkę
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="lg:w-96 space-y-6">
          {selectedRecs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Wybrane przez klienta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedRecs.map(rec => {
                  const inf = inflatables.find(i => i.id === rec.inflatable_id);
                  if (!inf) return null;
                  return (
                    <div key={rec.id} className="p-3 bg-amber-50 rounded-xl flex items-center gap-3">
                      <img
                        src={inf.main_image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop'}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{inf.name}</p>
                        <p className="text-xs text-slate-500">{inf.base_price} zł</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => createBookingMutation.mutate(inf.id)}
                        disabled={createBookingMutation.isPending}
                      >
                        <CalendarPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rekomendacje systemu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableRecs.slice(0, 6).map(rec => {
                const inf = inflatables.find(i => i.id === rec.inflatable_id);
                if (!inf) return null;
                return (
                  <div 
                    key={rec.id} 
                    className={cn(
                      "p-3 rounded-xl flex items-center gap-3",
                      rec.was_selected ? "bg-violet-50" : "bg-slate-50"
                    )}
                  >
                    <img
                      src={inf.main_image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop'}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{inf.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {rec.score}%
                        </Badge>
                        <span className="text-xs text-slate-500">{inf.base_price} zł</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => createBookingMutation.mutate(inf.id)}
                      disabled={createBookingMutation.isPending}
                      title="Utwórz rezerwację"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              {recommendations.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  Brak rekomendacji
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}