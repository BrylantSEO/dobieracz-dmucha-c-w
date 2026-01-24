import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { PartyPopper, ArrowUp, Calendar, Users, Zap, Phone } from 'lucide-react';

const exampleQueries = [
  'Urodziny mojego 6-letniego syna, około 15 dzieci, ogród',
  'Piknik firmowy na 50 osób, potrzebujemy czegoś większego',
  'Komunia w domu, dla dzieci 8-12 lat, sala z parkietem',
];

export default function Home() {
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim()) {
      sessionStorage.setItem('eventDescription', description);
      navigate(createPageUrl('Wizard'));
    }
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

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div 
              className="rounded-2xl shadow-2xl overflow-hidden border-2 relative"
              style={{ 
                borderColor: 'var(--accent-pink)',
                backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6974b6e1386b50e2b18613df/2b36acb97_FestiwaldmuchancowwTwoimmiescie1.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/35"></div>

              {/* Content */}
              <div className="relative z-10 p-6">
                <div className="relative">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz swoją imprezę... np. 'Urodziny mojego 6-letniego syna, około 15 dzieci, w ogrodzie, szukamy czegoś kolorowego z zjeżdżalnią'"
                    rows={5}
                    className="text-base resize-none pr-16 border-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400 bg-white/95"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={!description.trim()}
                    className="absolute bottom-3 right-3 rounded-full w-14 h-14 p-0 shadow-lg disabled:opacity-50 text-white hover:scale-110 transition-transform"
                    style={{ backgroundColor: 'var(--accent-pink)' }}
                  >
                    <ArrowUp className="w-8 h-8" />
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Example Queries */}
          <div className="text-center mb-16">
            <p className="text-sm text-slate-500 mb-3">
              Nie wiesz co napisać? Spróbuj:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleQueries.map((query, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setDescription(query)}
                  className="px-4 py-2 text-sm bg-white rounded-full border transition-colors"
                  style={{ borderColor: 'var(--text-muted)', color: 'var(--text-dark)' }}
                  onMouseEnter={(e) => e.target.style.borderColor = 'var(--accent-pink)'}
                  onMouseLeave={(e) => e.target.style.borderColor = 'var(--text-muted)'}
                >
                  {query}
                </button>
              ))}
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