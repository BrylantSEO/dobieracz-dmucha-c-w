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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 rounded-full text-violet-700 text-sm font-medium mb-6">
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
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 text-center mb-6">
            Znajdziemy idealnego
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">
              dmuchańca dla Ciebie
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Powiedz nam o swojej imprezie, a nasz inteligentny system dobierze najlepsze atrakcje dmuchane. Szybko, prosto i bez zbędnych formalności.
          </p>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mb-8">
            <Card className="border-2 border-violet-100 shadow-2xl">
              <CardContent className="p-6">
                <div className="relative">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz swoją imprezę... np. 'Urodziny mojego 6-letniego syna, około 15 dzieci, w ogrodzie, szukamy czegoś kolorowego z zjeżdżalnią'"
                    rows={5}
                    className="text-base resize-none pr-14 border-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={!description.trim()}
                    className="absolute bottom-3 right-3 rounded-full w-12 h-12 p-0 bg-violet-600 hover:bg-violet-700 shadow-lg disabled:opacity-50"
                  >
                    <ArrowUp className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                  className="px-4 py-2 text-sm bg-white rounded-full border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors text-slate-600"
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
              <div className="text-3xl md:text-4xl font-bold text-violet-600 mb-2">500+</div>
              <div className="text-sm text-slate-600">Udanych imprez</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-violet-600 mb-2">50+</div>
              <div className="text-sm text-slate-600">Atrakcji w ofercie</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-violet-600 mb-2">100%</div>
              <div className="text-sm text-slate-600">Zadowolonych klientów</div>
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
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Szybkie dopasowanie</h3>
              <p className="text-sm text-slate-600">System AI dobierze idealne dmuchańce w kilka sekund</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Sprawdzona dostępność</h3>
              <p className="text-sm text-slate-600">Od razu widzisz co jest wolne w Twoim terminie</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center p-6"
            >
              <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Doświadczeni</h3>
              <p className="text-sm text-slate-600">Ponad 500 udanych imprez za nami</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
            <div>© 2026 Dobieracz Dmuchańców. Wszystkie prawa zastrzeżone.</div>
            <div className="flex gap-6">
              <a href="tel:+48123456789" className="hover:text-violet-600 flex items-center gap-1">
                <Phone className="w-3 h-3" /> +48 123 456 789
              </a>
              <a href="mailto:kontakt@dmucha.pl" className="hover:text-violet-600">✉️ kontakt@dmucha.pl</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}