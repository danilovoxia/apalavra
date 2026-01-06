import React from 'react';

export interface GradientConfig {
  name: string;
  className: string;
  cssGradient: string;
  colors: string[];
}

// Using angle-based gradients (135deg = to bottom right) for better html2canvas compatibility
export const gradients: GradientConfig[] = [
  { name: 'Roxo Vibrante', className: 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500', cssGradient: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 50%, #ec4899 100%)', colors: ['#3b82f6', '#a855f7', '#ec4899'] },
  { name: 'Verde Oceano', className: 'bg-gradient-to-br from-green-400 via-teal-500 to-blue-600', cssGradient: 'linear-gradient(135deg, #4ade80 0%, #14b8a6 50%, #2563eb 100%)', colors: ['#4ade80', '#14b8a6', '#2563eb'] },
  { name: 'Pôr do Sol', className: 'bg-gradient-to-br from-orange-400 via-red-500 to-pink-600', cssGradient: 'linear-gradient(135deg, #fb923c 0%, #ef4444 50%, #db2777 100%)', colors: ['#fb923c', '#ef4444', '#db2777'] },
  { name: 'Índigo Rosa', className: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500', cssGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', colors: ['#6366f1', '#a855f7', '#ec4899'] },
  { name: 'Céu Azul', className: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600', cssGradient: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #4f46e5 100%)', colors: ['#22d3ee', '#3b82f6', '#4f46e5'] },
  { name: 'Dourado', className: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500', cssGradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)', colors: ['#fbbf24', '#f97316', '#ef4444'] },
  { name: 'Rosa Fúcsia', className: 'bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500', cssGradient: 'linear-gradient(135deg, #fb7185 0%, #d946ef 50%, #6366f1 100%)', colors: ['#fb7185', '#d946ef', '#6366f1'] },
  { name: 'Esmeralda', className: 'bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500', cssGradient: 'linear-gradient(135deg, #34d399 0%, #06b6d4 50%, #3b82f6 100%)', colors: ['#34d399', '#06b6d4', '#3b82f6'] },
  { name: 'Violeta', className: 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500', cssGradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)', colors: ['#8b5cf6', '#a855f7', '#d946ef'] },
  { name: 'Noturno', className: 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900', cssGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)', colors: ['#334155', '#1e293b', '#0f172a'] },
  { name: 'Amanhecer', className: 'bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-400', cssGradient: 'linear-gradient(135deg, #fde68a 0%, #fde047 50%, #fb923c 100%)', colors: ['#fde68a', '#fde047', '#fb923c'] },
  { name: 'Água Viva', className: 'bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400', cssGradient: 'linear-gradient(135deg, #38bdf8 0%, #22d3ee 50%, #2dd4bf 100%)', colors: ['#38bdf8', '#22d3ee', '#2dd4bf'] },
];

interface GradientPickerProps {
  selected: number;
  onSelect: (index: number) => void;
}

const GradientPicker: React.FC<GradientPickerProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {gradients.map((gradient, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-8 h-8 rounded-full ${gradient.className} transition-all duration-200 hover:scale-110 ${
            selected === i ? 'ring-4 ring-cyan-400 ring-offset-2 scale-110' : ''
          }`}
          aria-label={gradient.name}
          title={gradient.name}
        />
      ))}
    </div>
  );
};

export default GradientPicker;
