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
import { PartyPopper, Sparkles, Calendar as CalendarIcon, Users, Zap, Phone, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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
  });
  const [inflatables, setInflatables] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (!formData.event_date || !formData.description.trim() || !formData.city.trim()) {
      return;
    }
    setLoading(true);
    navigate(createPageUrl('Wizard'));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ backgroundColor: '#F5E6E9', color: 'var(--accent-pink)' }}>
            <PartyPopper className="w-4 h-4" />
            Wynajmem dmuchańców na każdą okazję
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6" style={{ color: 'var(--text-dark)' }}>
            Znajdziemy idealnego
            <br />
            <span style={{ color: 'var(--accent-pink)' }}>dmuchańca dla Ciebie</span>
          </h1>
          
          <p className="text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Powiedz nam o swojej imprezie, a nasz inteligentny system dobierze najlepsze atrakcje dmuchane. Szybko, prosto i bez zbędnych formalności.
          </p>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                  <span>💬</span>
                  Opisz swoją imprezę *
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Napisz o swojej imprezie... np: 'Urodziny 6-latka, około 15 dzieci, w ogrodzie. Szukamy czegoś kolorowego z zjeżdżalnią.'"
                  rows={4}
                  className="text-base"
                />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Im więcej szczegółów, tym lepsze dopasowanie 🎯
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
                    <span>📅</span>
                    Data imprezy *
                  </Label>
                  <Card className="border-2 border-slate-100">
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
                    <Label className="text-base font-semibold mb-3 block" style={{ color: 'var(--text-dark)' }}>
                      📍 Miasto *
                    </Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      placeholder="np. Warszawa"
                      className="text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold mb-3 block" style={{ color: 'var(--text-dark)' }}>
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
                    <Label className="text-base font-semibold mb-3 block" style={{ color: 'var(--text-dark)' }}>
                      ⏰ Godziny wynajmu (opcjonalnie)
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={formData.event_start_time}
                        onChange={(e) => updateFormData({ event_start_time: e.target.value })}
                        className="text-base"
                      />
                      <span className="flex items-center text-slate-500">-</span>
                      <Input
                        type="time"
                        value={formData.event_end_time}
                        onChange={(e) => updateFormData({ event_end_time: e.target.value })}
                        className="text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!formData.event_date || !formData.description.trim() || !formData.city.trim()}
                className="w-full text-white gap-2 px-8 py-6 text-lg"
                style={{ backgroundColor: 'var(--accent-pink)' }}
              >
                <Wand2 className="w-5 h-5" />
                Znajdź idealne dmuchańce
              </Button>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-6 md:gap-12 py-12 border-y border-slate-200"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--accent-pink)' }}>500+</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Udanych imprez</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--accent-pink)' }}>50+</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Atrakcji w ofercie</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--accent-pink)' }}>100%</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Zadowolonych klientów</div>
            </div>
          </motion.div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5E6E9' }}>
                <Zap className="w-7 h-7" style={{ color: 'var(--accent-pink)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>Szybkie dopasowanie</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>System AI dobierze idealne dmuchańce w kilka sekund</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5E6E9' }}>
                <Calendar className="w-7 h-7" style={{ color: 'var(--accent-pink)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>Sprawdzona dostępność</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Od razu widzisz co jest wolne w Twoim terminie</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5E6E9' }}>
                <Users className="w-7 h-7" style={{ color: 'var(--accent-pink)' }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>Doświadczeni</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ponad 500 udanych imprez za nami</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20" style={{ borderColor: 'var(--text-muted)', backgroundColor: '#FFFFFF' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <div>© 2026 Dobieracz Dmuchańców. Wszystkie prawa zastrzeżone.</div>
            <div className="flex gap-6">
              <a href="tel:+48123456789" className="flex items-center gap-1 transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-pink)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                <Phone className="w-3 h-3" /> +48 123 456 789
              </a>
              <a href="mailto:kontakt@dmucha.pl" className="transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-pink)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>✉️ kontakt@dmucha.pl</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}