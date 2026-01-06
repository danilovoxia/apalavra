import React from 'react';

interface EmotionalStateCardProps {
  emotion: string;
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

const EmotionalStateCard: React.FC<EmotionalStateCardProps> = ({ 
  emotion, 
  label, 
  icon, 
  selected, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
        selected 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-700 shadow-md hover:shadow-xl'
      }`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-lg">{label}</h3>
    </button>
  );
};

export default EmotionalStateCard;
