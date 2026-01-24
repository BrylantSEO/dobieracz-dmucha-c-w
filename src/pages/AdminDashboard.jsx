import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, startOfMonth, endOfMonth, eachWeekOfInterval, addMonths } from 'date-fns';
import { pl } from 'date-fns/locale';
import { 
  ClipboardList, Calendar, Package, TrendingUp,
  ChevronLeft, ChevronRight, Eye, Search, Filter
} from 'lucide-react';
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

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('week');

  const { data: quoteRequests = [] } = useQuery({
    queryKey: ['quoteRequests'],
    queryFn: () => base44.entities.QuoteRequest.list('-created_date'),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-start_date'),
  });

  const { data: inflatables = [] } = useQuery({
    queryKey: ['inflatables'],
    queryFn: () => base44.entities.Inflatable.list(),
  });

  const filteredRequests = quoteRequests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return req.contact_name?.toLowerCase().includes(query) ||
             req.contact_email?.toLowerCase().includes(query) ||
             req.request_number?.toLowerCase().includes(query) ||
             req.city?.toLowerCase().includes(query);
    }
    return true;
  });

  const stats = {
    newRequests: quoteRequests.filter(r => r.status === 'new').length,
    totalBookings: bookings.filter(b => b.status !== 'cancelled').length,
    upcomingEvents: bookings.filter(b => new Date(b.start_date) >= new Date() && b.status === 'confirmed').length,
    activeInflatables: inflatables.filter(i => i.is_active).length,
  };

  // Calendar rendering
  const renderWeekView = () => {
    const weekStart = startOfWeek(calendarDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(calendarDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayBookings = bookings.filter(b => b.start_date <= dayStr && b.end_date >= dayStr);
          const dayRequests = quoteRequests.filter(r => r.event_date === dayStr);
          const isToday = format(new Date(), 'yyyy-MM-dd') === dayStr;

          return (
            <div 
              key={dayStr} 
              className={cn(
                "min-h-[120px] rounded-lg border p-2",
                isToday ? "border-violet-300 bg-violet-50" : "border-slate-200"
              )}
            >
              <div className="text-xs font-medium text-slate-500 mb-1">
                {format(day, 'EEE', { locale: pl })}
              </div>
              <div className={cn(
                "text-lg font-bold mb-2",
                isToday ? "text-violet-600" : "text-slate-800"
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayBookings.slice(0, 2).map(b => {
                  const inf = inflatables.find(i => i.id === b.inflatable_id);
                  return (
                    <div key={b.id} className="text-xs p-1 rounded bg-emerald-100 text-emerald-800 truncate">
                      {inf?.name || 'Rezerwacja'}
                    </div>
                  );
                })}
                {dayRequests.slice(0, 2).map(r => (
                  <div key={r.id} className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate">
                    📋 {r.contact_name}
                  </div>
                ))}
                {(dayBookings.length > 2 || dayRequests.length > 2) && (
                  <div className="text-xs text-slate-500">
                    +{dayBookings.length + dayRequests.length - 4} więcej
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

    return (
      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-1 text-xs font-medium text-slate-500 mb-2">
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map(d => (
            <div key={d} className="text-center py-1">{d}</div>
          ))}
        </div>
        {weeks.map((weekStart, idx) => {
          const days = eachDayOfInterval({ 
            start: weekStart, 
            end: endOfWeek(weekStart, { weekStartsOn: 1 }) 
          });
          return (
            <div key={idx} className="grid grid-cols-7 gap-1">
              {days.map(day => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const hasBooking = bookings.some(b => b.start_date <= dayStr && b.end_date >= dayStr);
                const hasRequest = quoteRequests.some(r => r.event_date === dayStr);
                const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                const isToday = format(new Date(), 'yyyy-MM-dd') === dayStr;

                return (
                  <div 
                    key={dayStr}
                    className={cn(
                      "h-10 rounded flex flex-col items-center justify-center text-sm",
                      !isCurrentMonth && "text-slate-300",
                      isToday && "ring-2 ring-violet-500 font-bold",
                      hasBooking && "bg-emerald-100",
                      hasRequest && !hasBooking && "bg-blue-100"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-500">Przegląd zgłoszeń i rezerwacji</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.newRequests}</p>
                <p className="text-sm text-slate-500">Nowych zgłoszeń</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                <p className="text-sm text-slate-500">Nadchodzące imprezy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeInflatables}</p>
                <p className="text-sm text-slate-500">Aktywnych atrakcji</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
                <p className="text-sm text-slate-500">Wszystkich rezerwacji</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quote Requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg">Zgłoszenia</CardTitle>
              <Link to={createPageUrl('AdminQuotes')}>
                <Button variant="outline" size="sm">Zobacz wszystkie</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-4">
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
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="new">Nowe</SelectItem>
                    <SelectItem value="in_progress">W trakcie</SelectItem>
                    <SelectItem value="quoted">Wycenione</SelectItem>
                    <SelectItem value="confirmed">Potwierdzone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredRequests.slice(0, 5).map(req => (
                  <Link 
                    key={req.id} 
                    to={createPageUrl('AdminQuoteDetails') + '?id=' + req.id}
                    className="block"
                  >
                    <div className="p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-800">{req.contact_name}</p>
                          <p className="text-sm text-slate-500">{req.request_number}</p>
                        </div>
                        <Badge className={statusColors[req.status]}>
                          {statusLabels[req.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>📅 {req.event_date ? format(new Date(req.event_date), 'd MMM yyyy', { locale: pl }) : '-'}</span>
                        <span>📍 {req.city}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredRequests.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Brak zgłoszeń</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Kalendarz</CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCalendarDate(d => calendarView === 'week' ? addWeeks(d, -1) : addMonths(d, -1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[100px] text-center">
                  {calendarView === 'week' 
                    ? `${format(startOfWeek(calendarDate, { weekStartsOn: 1 }), 'd MMM', { locale: pl })} - ${format(endOfWeek(calendarDate, { weekStartsOn: 1 }), 'd MMM', { locale: pl })}`
                    : format(calendarDate, 'LLLL yyyy', { locale: pl })}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCalendarDate(d => calendarView === 'week' ? addWeeks(d, 1) : addMonths(d, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Tabs value={calendarView} onValueChange={setCalendarView} className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="week">Tydzień</TabsTrigger>
                <TabsTrigger value="month">Miesiąc</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {calendarView === 'week' ? renderWeekView() : renderMonthView()}
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" />
                <span className="text-slate-600">Rezerwacja</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
                <span className="text-slate-600">Zgłoszenie</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}