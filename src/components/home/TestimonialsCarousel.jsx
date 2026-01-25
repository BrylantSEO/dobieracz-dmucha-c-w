import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  { name: 'Anna Kowalska', text: 'Urodziny syna były niesamowite! Dmuchańce doskonałej jakości, obsługa super!' },
  { name: 'Piotr Nowak', text: 'Świetna organizacja festynu szkolnego. Wszystko działało bez zarzutu. Polecam!' },
  { name: 'Karolina Wiśniewska', text: 'Profesjonalna obsługa i rewelacyjne dmuchańce. Dzieci były zachwycone!' },
  { name: 'Tomasz Zieliński', text: 'Najlepsza firma wynajmu dmuchańców! Zawsze terminowo i bez problemów.' },
  { name: 'Magdalena Dąbrowska', text: 'Cudowne urodziny dla córki! Dmuchańce czyste, bezpieczne. Dziękujemy!' },
  { name: 'Michał Lewandowski', text: 'Event firmowy udany dzięki wam! Wszyscy pracownicy byli zachwyceni.' },
];

export default function TestimonialsCarousel() {
  return (
    <div className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
          Zaufały nam setki rodzin
        </h2>
        <p className="text-center text-slate-600">
          Zobacz, co mówią o nas nasi klienci
        </p>
      </div>

      <div className="relative">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-96 bg-slate-50 rounded-2xl p-6 border border-slate-200"
            >
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-4 italic">"{testimonial.text}"</p>
              <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}