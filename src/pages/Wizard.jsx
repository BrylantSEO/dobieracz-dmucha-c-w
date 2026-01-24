import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import WizardProgress from '@/components/wizard/WizardProgress';
import StepDateTime from '@/components/wizard/StepDateTime';
import StepEvent from '@/components/wizard/StepEvent';
import StepLocation from '@/components/wizard/StepLocation';
import StepPreferences from '@/components/wizard/StepPreferences';
import StepContact from '@/components/wizard/StepContact';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import ConfirmationView from '@/components/results/ConfirmationView';

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    is_full_day: false,
    has_power: true,
    is_outdoor: true,
    preferences: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
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

  const validateStep = () => {
    switch (step) {
      case 1:
        return !!formData.event_date;
      case 2:
        return !!formData.event_type;
      case 3:
        return !!formData.city;
      case 4:
        return true;
      case 5:
        return formData.contact_name && formData.contact_phone && formData.contact_email;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevStep = () => {
    if (showResults) {
      setShowResults(false);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const checkAvailability = async (inflatableId, eventDate) => {
    // Check bookings
    const bookings = await base44.entities.Booking.filter({
      inflatable_id: inflatableId,
    });
    
    const conflictingBooking = bookings.find(b => 
      b.status !== 'cancelled' &&
      eventDate >= b.start_date && eventDate <= b.end_date
    );
    
    if (conflictingBooking) return false;

    // Check availability blocks
    const blocks = await base44.entities.AvailabilityBlock.filter({
      inflatable_id: inflatableId,
      is_active: true,
    });
    
    const conflictingBlock = blocks.find(b => 
      eventDate >= b.start_date && eventDate <= b.end_date
    );
    
    return !conflictingBlock;
  };

  const calculateScore = (inflatable) => {
    let score = 50;
    const reasons = [];

    // Age match
    const minAge = formData.participants_age_min || 3;
    const maxAge = formData.participants_age_max || 99;
    
    if (inflatable.age_min && inflatable.age_max) {
      if (minAge >= inflatable.age_min && maxAge <= inflatable.age_max) {
        score += 15;
        reasons.push('Idealny dla podanego przedziału wiekowego');
      } else if (minAge >= inflatable.age_min - 2 && maxAge <= inflatable.age_max + 5) {
        score += 8;
        reasons.push('Pasuje do wieku uczestników');
      }
    }

    // Space match (jeśli podane)
    if (requestData.space_length && requestData.space_width) {
      if (inflatable.min_space_length && inflatable.min_space_width) {
        if (formData.space_length >= inflatable.min_space_length && 
            formData.space_width >= inflatable.min_space_width) {
          score += 10;
          reasons.push('Zmieści się w dostępnej przestrzeni');
        }
      }
    }

    // Capacity match
    if (formData.children_count && inflatable.max_capacity) {
      if (inflatable.max_capacity >= formData.children_count / 3) {
        score += 10;
        reasons.push('Odpowiednia pojemność');
      }
    }

    // Preference matches
    const prefs = formData.preferences || [];
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
    if (formData.is_outdoor === false && inflatable.indoor_suitable) {
      score += 10;
      reasons.push('Nadaje się do wnętrz');
    }
    if (formData.is_outdoor && inflatable.outdoor_suitable) {
      score += 5;
    }

    // Surface match
    if (formData.surface_type && inflatable.surface_types?.includes(formData.surface_type)) {
      score += 5;
      reasons.push('Pasuje do nawierzchni');
    }

    // Budget match
    if (formData.budget_max && inflatable.base_price) {
      if (inflatable.base_price <= formData.budget_max) {
        score += 10;
        reasons.push('Mieści się w budżecie');
      }
    }

    return { score: Math.min(score, 100), reasons };
  };

  const generateRecommendations = async () => {
    setIsLoadingResults(true);
    setShowResults(true);

    const recs = [];

    for (const inflatable of inflatables) {
      // Hard filters
      if (formData.has_power === false && inflatable.requires_power) continue;
      if (formData.is_outdoor === false && !inflatable.indoor_suitable) continue;
      if (formData.is_outdoor && !inflatable.outdoor_suitable) continue;
      
      // Space filter
      if (formData.space_length && formData.space_width && 
          inflatable.min_space_length && inflatable.min_space_width) {
        if (formData.space_length < inflatable.min_space_length || 
            formData.space_width < inflatable.min_space_width) {
          continue;
        }
      }

      const isAvailable = await checkAvailability(inflatable.id, formData.event_date);
      const { score, reasons } = calculateScore(inflatable);

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

    // AI re-rank for top candidates
    if (recs.length > 3) {
      try {
        const topCandidates = recs.slice(0, 12);
        const candidateNames = topCandidates.map(r => {
          const inf = inflatables.find(i => i.id === r.inflatable_id);
          return { id: r.inflatable_id, name: inf?.name, type: inf?.type, score: r.score };
        });

        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Jesteś ekspertem od doboru atrakcji dmuchanych na imprezy.
          
Dane imprezy:
- Typ: ${formData.event_type}
- Wiek uczestników: ${formData.participants_age_min || '?'} - ${formData.participants_age_max || '?'} lat
- Liczba dzieci: ${formData.children_count || '?'}
- Preferencje: ${formData.preferences?.join(', ') || 'brak'}
- Inne wymagania: ${formData.other_requirements || 'brak'}

Kandydaci (id, nazwa, typ, obecny wynik):
${JSON.stringify(candidateNames)}

Ułóż ranking TOP 6 najlepszych dopasowań. Dla każdego podaj krótkie uzasadnienie po polsku (1-2 zdania).`,
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

  const submitRequest = async (selectedIds) => {
    setSubmitting(true);

    const reqNumber = `ZAP-${Date.now().toString(36).toUpperCase()}`;

    const quoteRequest = await base44.entities.QuoteRequest.create({
      ...formData,
      request_number: reqNumber,
      status: 'new',
      selected_inflatable_ids: selectedIds,
    });

    // Save recommendations
    for (const rec of recommendations) {
      await base44.entities.QuoteRecommendation.create({
        quote_request_id: quoteRequest.id,
        inflatable_id: rec.inflatable_id,
        rank: recommendations.indexOf(rec) + 1,
        score: rec.score,
        reasons: rec.reasons,
        is_available: rec.is_available,
        calculated_price: rec.calculated_price,
        was_selected: selectedIds.includes(rec.inflatable_id),
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
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {!showResults && <WizardProgress currentStep={step} />}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-10 mt-8">
          {!showResults ? (
            <>
              {step === 1 && <StepDateTime data={formData} onChange={updateFormData} />}
              {step === 2 && <StepEvent data={formData} onChange={updateFormData} />}
              {step === 3 && <StepLocation data={formData} onChange={updateFormData} />}
              {step === 4 && <StepPreferences data={formData} onChange={updateFormData} />}
              {step === 5 && <StepContact data={formData} onChange={updateFormData} />}

              <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Wstecz
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!validateStep()}
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-8"
                >
                  {step === 5 ? (
                    <>Zobacz propozycje</>
                  ) : (
                    <>Dalej <ArrowRight className="w-4 h-4" /></>
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
                onSubmitRequest={submitRequest}
                submitting={submitting}
                noResults={recommendations.filter(r => r.is_available).length === 0}
              />
              {!isLoadingResults && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <Button variant="ghost" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Wróć do formularza
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