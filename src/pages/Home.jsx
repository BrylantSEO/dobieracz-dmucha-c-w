import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { base44 } from '@/api/base44Client';
import { PartyPopper, Sparkles, Calendar as CalendarIcon, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import ConfirmationView from '@/components/results/ConfirmationView';
import StepContact from '@/components/wizard/StepContact';

export default function Home() {
  const [formData, setFormData] = useState({
    event_date: null,
    description: '',
    is_full_day: true,
    city: '',
    event_start_time: '',
    event_end_time: '',
    event_type: '',
  });
  const [showResults, setShowResults] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedInflatableIds, setSelectedInflatableIds] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isExtractingInfo, setIsExtractingInfo] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [inflatables, setInflatables] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');

  useEffect(() => {
    loadInflatables();
  }, []);

  const loadInflatables = async () => {
    const data = await base44.entities.Inflatable.filter({ is_active: true });
    setInflatables(data);
  };

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
- event_type: typ imprezy (birthday, corporate_picnic, festival, communion, wedding, school_event, other)
- participants_age_min: minimalny wiek uczestników (liczba)
- participants_age_max: maksymalny wiek uczestników (liczba)
- children_count: szacowana liczba dzieci (liczba)
- is_outdoor: czy na zewnątrz (boolean)
- preferences: preferencje (array stringów: slide, castle, obstacle, toddlers)
- city: miasto (string)`,
        response_json_schema: {
          type: 'object',
          properties: {
            event_type: { type: 'string' },
            participants_age_min: { type: 'number' },
            participants_age_max: { type: 'number' },
            children_count: { type: 'number' },
            is_outdoor: { type: 'boolean' },
            preferences: { type: 'array', items: { type: 'string' } },
            city: { type: 'string' }
          }
        }
      });
      return response;
    } catch (e) {
      console.error('Failed to extract info:', e);
      return {};
    }
  };

  const calculateScore = (inflatable, extractedInfo) => {
    let score = 50;
    const reasons = [];

    // Age match
    if (extractedInfo.participants_age_min && extractedInfo.participants_age_max && 
        inflatable.age_min && inflatable.age_max) {
      if (extractedInfo.participants_age_min >= inflatable.age_min && 
          extractedInfo.participants_age_max <= inflatable.age_max) {
        score += 15;
        reasons.push('Idealny dla podanego przedziału wiekowego');
      }
    }

    // Capacity match
    if (extractedInfo.children_count && inflatable.max_capacity) {
      if (inflatable.max_capacity >= extractedInfo.children_count / 3) {
        score += 10;
        reasons.push('Odpowiednia pojemność');
      }
    }

    // Preference matches
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

    // Indoor/outdoor match
    if (extractedInfo.is_outdoor === false && inflatable.indoor_suitable) {
      score += 10;
      reasons.push('Nadaje się do wnętrz');
    }
    if (extractedInfo.is_outdoor && inflatable.outdoor_suitable) {
      score += 5;
    }

    return { score: Math.min(score, 100), reasons };
  };

  const generateRecommendations = async () => {
    if (!formData.event_date || !formData.description) return;

    setIsExtractingInfo(true);
    setIsLoadingResults(true);
    setShowResults(true);

    // Extract info from description
    const extractedInfo = await extractEventInfo(formData.description);
    
    // Update form data with extracted info
    updateFormData({
      ...extractedInfo,
      other_requirements: formData.description
    });

    setIsExtractingInfo(false);

    const recs = [];

    for (const inflatable of inflatables) {
      // Basic filters
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

    // Sort by availability and score
    recs.sort((a, b) => {
      if (a.is_available !== b.is_available) return b.is_available ? 1 : -1;
      return b.score - a.score;
    });

    // AI re-rank
    if (recs.length > 3) {
      try {
        const topCandidates = recs.slice(0, 12);
        const candidateNames = topCandidates.map(r => {
          const inf = inflatables.find(i => i.id === r.inflatable_id);
          return { id: r.inflatable_id, name: inf?.name, type: inf?.type, score: r.score };
        });

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Jesteś ekspertem od doboru dmuchańców. 

Potrzeby klienta: ${formData.description}

Wiek: ${extractedInfo.participants_age_min || '?'} - ${extractedInfo.participants_age_max || '?'} lat
Liczba dzieci: ${extractedInfo.children_count || '?'}

Kandydaci: ${JSON.stringify(candidateNames)}

Ułóż ranking TOP 6. Dla każdego podaj krótkie uzasadnienie (1-2 zdania po polsku).`,
          response_json_schema: {
            type: 'object',
            properties: {
              rankings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    inflatable_id: { type: 'string' },
                    reason: { type: 'string' }
                  }
                }
              }
            }
          }
        });

        if (aiResponse?.rankings) {
          aiResponse.rankings.forEach((r, idx) => {
            const rec = recs.find(rec => rec.inflatable_id === r.inflatable_id);
            if (rec) {
              rec.score = 100 - idx * 5;
              rec.reasons = [r.reason, ...rec.reasons];
            }
          });
          recs.sort((a, b) => {
            if (a.is_available !== b.is_available) return b.is_available ? 1 : -1;
            return b.score - a.score;
          });
        }
      } catch (e) {
        console.log('AI re-rank skipped');
      }
    }

    setRecommendations(recs.slice(0, 10));
    setIsLoadingResults(false);
  };

  const handleSelectInflatables = (selectedIds) => {
    setSelectedInflatableIds(selectedIds);
    setShowContact(true);
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
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ConfirmationView 
            requestNumber={requestNumber} 
            contactName={formData.contact_name} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl shadow-xl border-2 p-6 sm:p-10" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--accent-coral)' }}>
          {!showResults ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-5xl font-black uppercase mb-2" style={{ color: 'var(--accent-cyan)', letterSpacing: '2px' }}>
                  Znajdź idealnego dmuchańca
                </h1>
                <p className="text-lg" style={{ color: 'var(--text-dark)' }}>
                  Wybierz datę i opisz swoją imprezę - AI dobierze najlepsze opcje
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-bold mb-3 block uppercase" style={{ color: 'var(--text-dark)' }}>
                    💬 Opisz swoją imprezę *
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    placeholder="Napisz o swojej imprezie... np: 'Urodziny 6-latka, około 15 dzieci, w ogrodzie. Szukamy czegoś kolorowego z zjeżdżalnią.'"
                    rows={4}
                    className="text-base border-2"
                    style={{ borderColor: 'var(--text-muted)', color: 'var(--text-dark)' }}
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Im więcej szczegółów, tym lepsze dopasowanie 🎯
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-bold mb-3 block uppercase" style={{ color: 'var(--text-dark)' }}>
                      📅 Data imprezy *
                    </Label>
                    <Card className="border-2" style={{ borderColor: 'var(--accent-purple)', backgroundColor: 'white' }}>
                      <CardContent className="p-4">
                        <Calendar
                          mode="single"
                          selected={formData.event_date ? new Date(formData.event_date) : undefined}
                          onSelect={(date) => updateFormData({ event_date: date?.toISOString().split('T')[0] })}
                          disabled={(date) => date < new Date()}
                          className="rounded-md"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-bold mb-3 block uppercase" style={{ color: 'var(--text-dark)' }}>
                        📍 Miasto *
                      </Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => updateFormData({ city: e.target.value })}
                        placeholder="np. Warszawa"
                        className="text-base border-2"
                        style={{ borderColor: 'var(--text-muted)', color: 'var(--text-dark)' }}
                      />
                    </div>

                    <div>
                      <Label className="text-base font-bold mb-3 block uppercase" style={{ color: 'var(--text-dark)' }}>
                        🎉 Typ imprezy (opcjonalnie)
                      </Label>
                      <Select value={formData.event_type} onValueChange={(v) => updateFormData({ event_type: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz typ..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="birthday">Urodziny</SelectItem>
                          <SelectItem value="corporate_picnic">Piknik firmowy</SelectItem>
                          <SelectItem value="festival">Festiwal</SelectItem>
                          <SelectItem value="communion">Komunia</SelectItem>
                          <SelectItem value="wedding">Wesele</SelectItem>
                          <SelectItem value="school_event">Impreza szkolna</SelectItem>
                          <SelectItem value="other">Inne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-bold mb-3 block uppercase" style={{ color: 'var(--text-dark)' }}>
                        ⏰ Godziny wynajmu (opcjonalnie)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={formData.event_start_time}
                          onChange={(e) => updateFormData({ event_start_time: e.target.value })}
                          className="text-base border-2"
                          style={{ borderColor: 'var(--text-muted)', color: 'var(--text-dark)' }}
                        />
                        <span className="flex items-center font-bold" style={{ color: 'var(--text-dark)' }}>-</span>
                        <Input
                          type="time"
                          value={formData.event_end_time}
                          onChange={(e) => updateFormData({ event_end_time: e.target.value })}
                          className="text-base border-2"
                          style={{ borderColor: 'var(--text-muted)', color: 'var(--text-dark)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-slate-100">
                <Button
                  onClick={generateRecommendations}
                  disabled={!formData.event_date || !formData.description.trim() || !formData.city.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-8"
                  size="lg"
                >
                  {isExtractingInfo ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analizuję...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Zobacz propozycje
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : showContact ? (
            <>
              <StepContact data={formData} onChange={updateFormData} />
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={() => setShowContact(false)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Wstecz
                </Button>
                <Button
                  onClick={() => submitRequest(formData)}
                  disabled={!formData.contact_name || !formData.contact_phone || !formData.contact_email || submitting}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8"
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
            </>
          ) : (
            <>
              <ResultsDisplay
                recommendations={recommendations}
                inflatables={inflatables}
                isLoading={isLoadingResults}
                onSubmitRequest={handleSelectInflatables}
                submitting={submitting}
                noResults={recommendations.filter(r => r.is_available).length === 0}
              />
              {!isLoadingResults && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setShowResults(false)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Zmień datę lub opis
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}