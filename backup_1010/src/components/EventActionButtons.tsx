'use client';

import { Heart } from 'lucide-react';

export default function EventActionButtons() {
  const handleSelectTickets = () => {
    const ticketCalculator = document.getElementById('ticket-calculator');
    if (ticketCalculator) {
      ticketCalculator.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <button 
        onClick={handleSelectTickets}
        className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-unbounded"
      >
        Выбрать билеты
      </button>
      <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300 font-unbounded">
        <Heart className="w-6 h-6 inline mr-3" />
        В избранное
      </button>
    </div>
  );
}
