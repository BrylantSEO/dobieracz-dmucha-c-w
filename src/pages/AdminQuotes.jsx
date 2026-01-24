import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Search, Filter, Eye, Calendar, MapPin, Phone } from 'lucide-react';

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

export default function AdminQuotes() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: quoteRequests = [], isLoading } = useQuery({
    queryKey: ['quoteRequests'],
    queryFn: () => base44.entities.QuoteRequest.list('-created_date'),
  });

  const filtered = quoteRequests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return req.contact_name?.toLowerCase().includes(q) ||
             req.contact_email?.toLowerCase().includes(q) ||
             req.request_number?.toLowerCase().includes(q) ||
             req.city?.toLowerCase().includes(q) ||
             req.contact_phone?.includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Zgłoszenia</h1>
        <p className="text-slate-500">Lista wszystkich zapytań o wycenę</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Szukaj po nazwisku, emailu, numerze, mieście..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="new">Nowe</SelectItem>
            <SelectItem value="in_progress">W trakcie</SelectItem>
            <SelectItem value="quoted">Wycenione</SelectItem>
            <SelectItem value="confirmed">Potwierdzone</SelectItem>
            <SelectItem value="rejected">Odrzucone</SelectItem>
            <SelectItem value="cancelled">Anulowane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">Numer / Klient</TableHead>
              <TableHead className="font-semibold">Data imprezy</TableHead>
              <TableHead className="font-semibold">Typ</TableHead>
              <TableHead className="font-semibold">Lokalizacja</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Utworzono</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(req => (
              <TableRow key={req.id} className="hover:bg-slate-50">
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-800">{req.contact_name}</p>
                    <p className="text-sm text-slate-500">{req.request_number}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Phone className="w-3 h-3" />
                      {req.contact_phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    {req.event_date 
                      ? format(new Date(req.event_date), 'd MMM yyyy', { locale: pl })
                      : '-'}
                  </div>
                  {req.event_start_time && (
                    <p className="text-sm text-slate-500 mt-1">
                      {req.event_start_time} - {req.event_end_time || '?'}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {eventTypeLabels[req.event_type] || req.event_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    {req.city}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[req.status]}>
                    {statusLabels[req.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {req.created_date 
                    ? format(new Date(req.created_date), 'd MMM, HH:mm', { locale: pl })
                    : '-'}
                </TableCell>
                <TableCell>
                  <Link to={createPageUrl('AdminQuoteDetails') + '?id=' + req.id}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Szczegóły
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                  Brak zgłoszeń do wyświetlenia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}