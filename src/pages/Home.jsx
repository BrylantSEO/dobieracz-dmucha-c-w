import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  PartyPopper, Sparkles, Shield, Clock, 
  ArrowRight, Star, Users, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Sparkles,
    title: 'Inteligentny dobór',
    description: 'Dopasowujemy atrakcje do Twojej imprezy na podstawie wieku uczestników, przestrzeni i preferencji'
  },
  {
    icon: Shield,
    title: 'Bezpieczeństwo',
    description: 'Wszystkie dmuchańce są certyfikowane i regularnie serwisowane'
  },
  {
    icon: Clock,
    title: 'Pełna obsługa',
    description: 'Dostarczamy, montujemy i odbieramy - Ty tylko się bawisz'
  }
];

const stats = [
  { value: '500+', label: 'Udanych imprez' },
  { value: '50+', label: 'Atrakcji w ofercie' },
  { value: '100%', label: 'Zadowolonych klientów' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 to-purple-100/50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-violet-200 shadow-sm mb-8">
              <PartyPopper className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">Wynajem dmuchańców na każdą okazję</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Znajdziemy idealnego
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                dmuchańca dla Ciebie
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Powiedz nam o swojej imprezie, a nasz inteligentny system dobierze 
              najlepsze atrakcje dmuchane. Szybko, prosto i bez zbędnych formalności.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Wizard')}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl shadow-violet-200 hover:shadow-violet-300 transition-all"
                >
                  Dobierz dmuchańca
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg border-2 hover:bg-slate-50"
              >
                <Phone className="w-5 h-5 mr-2" />
                Zadzwoń do nas
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Dlaczego my?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Łączymy technologię z doświadczeniem, aby zapewnić Ci najlepszą obsługę
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-slate-50 rounded-2xl p-8 hover:bg-violet-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">
                Gotowy na niezapomnianą imprezę?
              </h2>
              <p className="text-lg text-violet-100 mb-8 max-w-xl mx-auto">
                Wypełnij krótki formularz, a my dobierzemy idealne atrakcje 
                i skontaktujemy się z ofertą w ciągu 24h
              </p>
              <Link to={createPageUrl('Wizard')}>
                <Button 
                  size="lg"
                  className="bg-white text-violet-600 hover:bg-violet-50 px-8 py-6 text-lg font-semibold shadow-xl"
                >
                  Rozpocznij dobór
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                <PartyPopper className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Dobieracz Dmuchańców</span>
            </div>
            <div className="flex items-center gap-8 text-slate-400">
              <a href="tel:+48123456789" className="hover:text-white transition-colors flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +48 123 456 789
              </a>
              <span>kontakt@dmuchance.pl</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
            © 2024 Dobieracz Dmuchańców. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}