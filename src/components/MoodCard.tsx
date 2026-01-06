import React from 'react';

interface MoodCardProps {
  id: string;
  label: string;
  emoji: string;
  onClick: () => void;
}

const MoodCard: React.FC<MoodCardProps> = ({ label, emoji, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:bg-white border border-white/50"
    >
      <span className="text-4xl md:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
        {emoji}
      </span>
      <h3 className="text-cyan-800 font-semibold text-sm md:text-base text-center">
        {label}
      </h3>
    </button>
  );
};

export default MoodCard;
