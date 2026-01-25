import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { PartyPopper, Sparkles, Calendar as CalendarIcon, Users, Zap, Phone, Wand2, Loader2, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import ConfirmationView from '@/components/results/ConfirmationView';
import StepContact from '@/components/wizard/StepContact';
import AdvancedOptions from '@/components/home/AdvancedOptions';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import PopularInflatables from '@/components/home/PopularInflatables';

export default function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    event_date: null,
    description: '',
    is_full_day: true,
    city: '',
    event_start_time: '',
    event_end_time: '',
    event_type: '',
    age_min: '',
    age_max: '',
    is_competitive: false,
    intensity: 'MEDIUM',
  });
  const [inflatables, setInflatables] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedInflatableIds, setSelectedInflatableIds] = useState([]);
  const [showContact, setShowContact] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');

  useEffect(() => {
    const loadInflatables = async () => {
      const data = await base44.entities.Inflatable.filter({ is_active: true });
      setInflatables(data);
    };
    loadInflatables();
  }, []);

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const checkAvailability = async (inflatableId, eventDate) => {
    const bookings = await base44.entities.Booking.filter({
      inflatable_id: inflatableId,
    });
    
    const conflictingBooking = bookings.find(b => 
      b.status !== 'cancelled' &&
      eventDate >= b.start_date && eventDate <= b.end_date
    );
    
    if (conflictingBooking) return false;

    const blocks = await base44.entities.AvailabilityBlock.filter({
      inflatable_id: inflatableId,
      is_active: true,
    });
    
    const conflictingBlock = blocks.find(b => 
      eventDate >= b.start_date && eventDate <= b.end_date
    );
    
    return !conflictingBlock;
  };

  const extractEventInfo = async (description) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Wyciągnij kluczowe informacje z opisu imprezy. Jeśli czegoś brak, pozostaw null.

Opis: "${description}"

Wyciągnij:
- participants_age_min: minimalny wiek uczestników (liczba)
- participants_age_max: maksymalny wiek uczestników (liczba)
- children_count: szacowana liczba dzieci (liczba)
- is_outdoor: czy na zewnątrz (boolean)
- preferences: preferencje (array stringów: slide, castle, obstacle, toddlers)`,
        response_json_schema: {
          type: 'object',
          properties: {
            participants_age_min: { type: 'number' },
            participants_age_max: { type: 'number' },
            children_count: { type: 'number' },
            is_outdoor: { type: 'boolean' },
            preferences: { type: 'array', items: { type: 'string' } },
          }
        }
      });
      return response;
    } catch (e) {
      return {};
    }
  };

  const calculateScore = (inflatable, extractedInfo) => {
    let score = 50;
    const reasons = [];

    if (extractedInfo.participants_age_min && extractedInfo.participants_age_max && 
        inflatable.age_min && inflatable.age_max) {
      if (extractedInfo.participants_age_min >= inflatable.age_min && 
          extractedInfo.participants_age_max <= inflatable.age_max) {
        score += 15;
        reasons.push('Idealny dla podanego przedziału wiekowego');
      }
    }

    if (extractedInfo.children_count && inflatable.max_capacity) {
      if (inflatable.max_capacity >= extractedInfo.children_count / 3) {
        score += 10;
        reasons.push('Odpowiednia pojemność');
      }
    }

    const prefs = extractedInfo.preferences || [];
    if (prefs.includes('slide') && inflatable.type === 'slide') {
      score += 15;
      reasons.push('Zjeżdżalnia - zgodnie z preferencjami');
    }
    if (prefs.includes('castle') && inflatable.type === 'castle') {
      score += 15;
      reasons.push('Zamek - zgodnie z preferencjami');
    }
    if (prefs.includes('obstacle') && inflatable.type === 'obstacle_course') {
      score += 15;
      reasons.push('Tor przeszkód - zgodnie z preferencjami');
    }
    if (prefs.includes('toddlers') && inflatable.type === 'for_toddlers') {
      score += 15;
      reasons.push('Idealny dla maluchów');
    }

    if (extractedInfo.is_outdoor === false && inflatable.indoor_suitable) {
      score += 10;
      reasons.push('Nadaje się do wnętrz');
    }
    if (extractedInfo.is_outdoor && inflatable.outdoor_suitable) {
      score += 5;
    }

    return { score: Math.min(score, 100), reasons };
  };

  const handleSubmit = async () => {
    if (!formData.event_date || !formData.city.trim()) {
      return;
    }
    setLoading(true);
    setShowResults(true);

    try {
      // Użyj nowej funkcji rankingowej
      const ageMin = formData.age_min ? parseInt(formData.age_min) : undefined;
      const ageMax = formData.age_max ? parseInt(formData.age_max) : (ageMin ? ageMin : undefined);
      
      const response = await base44.functions.invoke('rankInflatables', {
        eventType: formData.event_type,
        ageMin: ageMin,
        ageMax: ageMax || ageMin,
        isOutdoor: true,
        eventDate: formData.event_date,
        isCompetitive: formData.is_competitive,
        intensity: formData.intensity
      });

      setRecommendations(response.data.results || []);
    } catch (error) {
      console.error('Ranking error:', error);
      // Fallback do starego systemu jeśli backend function nie działa
      const extractedInfo = await extractEventInfo(formData.description);
      
      const recs = [];
      for (const inflatable of inflatables) {
        if (extractedInfo.is_outdoor === false && !inflatable.indoor_suitable) continue;
        if (extractedInfo.is_outdoor && !inflatable.outdoor_suitable) continue;

        const isAvailable = await checkAvailability(inflatable.id, formData.event_date);
        const { score, reasons } = calculateScore(inflatable, extractedInfo);

        recs.push({
          inflatable_id: inflatable.id,
          is_available: isAvailable,
          score,
          reasons,
          calculated_price: inflatable.base_price,
        });
      }

      recs.sort((a, b) => {
        if (a.is_available !== b.is_available) return b.is_available ? 1 : -1;
        return b.score - a.score;
      });

      setRecommendations(recs.slice(0, 10));
    }
    
    setLoading(false);
  };

  const submitRequest = async (contactData) => {
    setSubmitting(true);
    const reqNumber = `ZAP-${Date.now().toString(36).toUpperCase()}`;

    const quoteRequest = await base44.entities.QuoteRequest.create({
      ...formData,
      ...contactData,
      request_number: reqNumber,
      status: 'new',
      selected_inflatable_ids: selectedInflatableIds,
    });

    for (const rec of recommendations) {
      await base44.entities.QuoteRecommendation.create({
        quote_request_id: quoteRequest.id,
        inflatable_id: rec.inflatable_id,
        rank: recommendations.indexOf(rec) + 1,
        score: rec.score,
        reasons: rec.reasons,
        is_available: rec.is_available,
        calculated_price: rec.calculated_price,
        was_selected: selectedInflatableIds.includes(rec.inflatable_id),
      });
    }

    setRequestNumber(reqNumber);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container mx-auto px-4 py-12">
          <ConfirmationView 
            requestNumber={requestNumber} 
            contactName={formData.contact_name} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Dmucha.</div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900 transition">Strona główna</a>
              <a href="#" className="hover:text-slate-900 transition">Oferta</a>
              <a href="#" className="hover:text-slate-900 transition">O nas</a>
              <a href="#" className="hover:text-slate-900 transition">Blog</a>
            </nav>
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-medium">
              Kontakt
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 md:py-24">
        {!showResults ? (
          <>
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto text-center mb-16"
            >
              <div className="relative inline-block mb-8">
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight">
                  Najlepsze
                  <br />
                  Dmuchańce
                  <br />
                  Na Twoje
                  <br />
                  Wydarzenie
                </h1>
                <div className="absolute -top-4 -right-4 md:-right-12 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg rotate-3">
                  ⭐ PROFESJONALNA OBSŁUGA
                  <br />
                  ⭐ 4.9 (500+ opinii)
                </div>
              </div>

              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12">
                Jesteśmy agencją wynajmu dmuchańców, która pomoże Ci stworzyć nowoczesną
                i niezapomnianą imprezę. Porozmawiajmy.
              </p>

              {/* Quick Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Opisz swoją imprezę... np: Urodziny synka w ogrodzie, będzie 15 dzieciaków z przedszkola"
                    rows={2}
                    className="flex-1 text-base"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Input
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="Miasto *"
                    className="text-base h-12"
                  />
                  <Input
                    type="date"
                    value={formData.event_date || ''}
                    onChange={(e) => updateFormData({ event_date: e.target.value })}
                    className="text-base h-12"
                  />
                </div>

                <AdvancedOptions formData={formData} updateFormData={updateFormData} />

                <Button
                  onClick={handleSubmit}
                  disabled={!formData.event_date || !formData.description.trim() || !formData.city.trim() || loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold h-14 text-lg mt-4"
                >
                  {loading ? 'Szukam...' : '✨ Pokaż najlepsze propozycje'}
                </Button>
              </div>
            </motion.div>

            {/* Testimonials */}
            <TestimonialsCarousel />

            {/* Popular Inflatables */}
            <PopularInflatables />
            </>
            ) : showContact ? (
          <div className="max-w-4xl mx-auto">
            <StepContact data={formData} onChange={updateFormData} />
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 bg-white rounded-2xl p-6 shadow-lg">
              <Button
                variant="ghost"
                onClick={() => setShowContact(false)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Wstecz
              </Button>
              <Button
                onClick={() => {
                  // Walidacja przed wysłaniem
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const phoneRegex = /^(\+48)?[0-9]{9}$/;

                  if (!formData.contact_name || formData.contact_name.length < 2) {
                    alert('Podaj prawidłowe imię i nazwisko');
                    return;
                  }

                  if (!emailRegex.test(formData.contact_email)) {
                    alert('Podaj prawidłowy adres email');
                    return;
                  }

                  const cleanedPhone = formData.contact_phone.replace(/\s/g, '');
                  if (!phoneRegex.test(cleanedPhone)) {
                    alert('Podaj prawidłowy numer telefonu (9 cyfr)');
                    return;
                  }

                  submitRequest(formData);
                }}
                disabled={!formData.contact_name || !formData.contact_phone || !formData.contact_email || submitting}
                className="text-white px-8"
                style={{ backgroundColor: 'var(--accent-pink)' }}
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Wysyłam...
                  </>
                ) : (
                  'Wyślij zgłoszenie'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <ResultsDisplay
              recommendations={recommendations}
              inflatables={inflatables}
              isLoading={loading}
              onSubmitRequest={(selectedIds) => {
                setSelectedInflatableIds(selectedIds);
                setShowContact(true);
              }}
              submitting={submitting}
              noResults={recommendations.filter(r => r.is_available).length === 0}
            />
            {!loading && (
              <div className="mt-6">
                <Button variant="ghost" onClick={() => { setShowResults(false); setRecommendations([]); }} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Zmień datę lub opis
                </Button>
              </div>
            )}
          </div>
          )}
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 mt-24">
            <div className="container mx-auto px-6 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                <div>© 2026 Dmucha. Wszystkie prawa zastrzeżone.</div>
                <div className="flex gap-6">
                  <a href="tel:+48123456789" className="flex items-center gap-1 hover:text-slate-900 transition">
                    <Phone className="w-3 h-3" /> +48 123 456 789
                  </a>
                  <a href="mailto:kontakt@dmucha.pl" className="hover:text-slate-900 transition">✉️ kontakt@dmucha.pl</a>
                </div>
              </div>
            </div>
          </footer>
          </div>
  );
}