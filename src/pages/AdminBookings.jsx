import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { 
  Plus, Search, Calendar, MapPin, Phone, Edit2,
  Trash2, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors = {
  tentative: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  tentative: 'Wstępna',
  confirmed: 'Potwierdzona',
  completed: 'Zrealizowana',
  cancelled: 'Anulowana',
};

export default function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const queryClient = useQueryClient();

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-start_date'),
  });

  const { data: inflatables = [] } = useQuery({
    queryKey: ['inflatables'],
    queryFn: () => base44.entities.Inflatable.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Booking.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['bookings']),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['bookings']),
  });

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inf = inflatables.find(i => i.id === b.inflatable_id);
      return b.client_name?.toLowerCase().includes(q) ||
             b.booking_number?.toLowerCase().includes(q) ||
             inf?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingBooking(null);
    setShowForm(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Rezerwacje</h1>
          <p className="text-slate-500">Zarządzaj rezerwacjami dmuchańców</p>
        </div>
        <Button onClick={handleAdd} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Nowa rezerwacja
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Szukaj..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="tentative">Wstępne</SelectItem>
            <SelectItem value="confirmed">Potwierdzone</SelectItem>
            <SelectItem value="completed">Zrealizowane</SelectItem>
            <SelectItem value="cancelled">Anulowane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map(booking => {
          const inflatable = inflatables.find(i => i.id === booking.inflatable_id);
          const isPast = new Date(booking.end_date) < new Date();
          const isUpcoming = new Date(booking.start_date) > new Date();

          return (
            <Card key={booking.id} className={cn(booking.status === 'cancelled' && "opacity-60")}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={inflatable?.main_image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop'}
                    alt={inflatable?.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {inflatable?.name || 'Nieznany dmuchaniec'}
                        </h3>
                        <p className="text-sm text-slate-500">{booking.booking_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={booking.status}
                          onValueChange={(v) => updateStatusMutation.mutate({ id: booking.id, status: v })}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <Badge className={statusColors[booking.status]}>
                              {statusLabels[booking.status]}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(booking)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm('Usunąć rezerwację?')) deleteMutation.mutate(booking.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-violet-500" />
                        <span>
                          {format(new Date(booking.start_date), 'd MMM', { locale: pl })}
                          {booking.end_date !== booking.start_date && 
                            ` - ${format(new Date(booking.end_date), 'd MMM', { locale: pl })}`}
                        </span>
                      </div>
                      {booking.start_time && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{booking.start_time} - {booking.end_time || '?'}</span>
                        </div>
                      )}
                      {booking.client_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{booking.client_name}</span>
                        </div>
                      )}
                      {booking.client_phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Phone className="w-4 h-4" />
                          <span>{booking.client_phone}</span>
                        </div>
                      )}
                    </div>

                    {booking.delivery_address && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span>{booking.delivery_address}</span>
                      </div>
                    )}

                    {booking.total_price && (
                      <div className="mt-2">
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {booking.total_price.toLocaleString('pl-PL')} zł
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Brak rezerwacji</p>
          </div>
        )}
      </div>

      <BookingFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        booking={editingBooking}
        inflatables={inflatables}
      />
    </div>
  );
}

function BookingFormDialog({ open, onOpenChange, booking, inflatables }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    inflatable_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '',
    end_time: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    delivery_address: '',
    total_price: null,
    notes: '',
    status: 'tentative',
  });

  React.useEffect(() => {
    if (booking) {
      setFormData({
        inflatable_id: booking.inflatable_id || '',
        start_date: booking.start_date || '',
        end_date: booking.end_date || '',
        start_time: booking.start_time || '',
        end_time: booking.end_time || '',
        client_name: booking.client_name || '',
        client_phone: booking.client_phone || '',
        client_email: booking.client_email || '',
        delivery_address: booking.delivery_address || '',
        total_price: booking.total_price || null,
        notes: booking.notes || '',
        status: booking.status || 'tentative',
      });
    } else {
      setFormData({
        inflatable_id: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: '',
        end_time: '',
        client_name: '',
        client_phone: '',
        client_email: '',
        delivery_address: '',
        total_price: null,
        notes: '',
        status: 'tentative',
      });
    }
  }, [booking, open]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const bookingData = {
        ...data,
        booking_number: booking?.booking_number || `REZ-${Date.now().toString(36).toUpperCase()}`,
      };
      if (booking?.id) {
        return base44.entities.Booking.update(booking.id, bookingData);
      }
      return base44.entities.Booking.create(bookingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      onOpenChange(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edytuj rezerwację' : 'Nowa rezerwacja'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Dmuchaniec *</Label>
            <Select
              value={formData.inflatable_id}
              onValueChange={(v) => setFormData(prev => ({ ...prev, inflatable_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz..." />
              </SelectTrigger>
              <SelectContent>
                {inflatables.map(inf => (
                  <SelectItem key={inf.id} value={inf.id}>{inf.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data od *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Data do *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Godzina od</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div>
              <Label>Godzina do</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Klient</Label>
            <Input
              value={formData.client_name}
              onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
              placeholder="Imię i nazwisko"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefon</Label>
              <Input
                value={formData.client_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, client_phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>Adres dostawy</Label>
            <Input
              value={formData.delivery_address}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
            />
          </div>

          <div>
            <Label>Cena (zł)</Label>
            <Input
              type="number"
              value={formData.total_price || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, total_price: parseFloat(e.target.value) || null }))}
            />
          </div>

          <div>
            <Label>Notatki</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Anuluj
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="bg-violet-600 hover:bg-violet-700">
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {booking ? 'Zapisz' : 'Utwórz'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}