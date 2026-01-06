import React from 'react';
import EmotionalStateCard from './EmotionalStateCard';

interface EmotionalStateSelectorProps {
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
}

const EmotionalStateSelector: React.FC<EmotionalStateSelectorProps> = ({ 
  selectedEmotion, 
  onSelectEmotion 
}) => {
  const emotions = [
    { id: 'paz', label: 'Paz', icon: '🕊️' },
    { id: 'ansiedade', label: 'Ansiedade', icon: '😰' },
    { id: 'gratidao', label: 'Gratidão', icon: '🙏' },
    { id: 'tristeza', label: 'Tristeza', icon: '😔' },
    { id: 'esperanca', label: 'Esperança', icon: '🌟' },
    { id: 'amor', label: 'Amor', icon: '💙' },
    { id: 'medo', label: 'Medo', icon: '😨' },
    { id: 'alegria', label: 'Alegria', icon: '😊' },
    { id: 'forca', label: 'Força', icon: '💪' },
    { id: 'proposito', label: 'Propósito', icon: '🎯' },
  ];


  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
        Como você está se sentindo hoje?
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Selecione seu estado emocional para receber o versículo do dia
      </p>

      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">

        {emotions.map((emotion) => (
          <EmotionalStateCard
            key={emotion.id}
            emotion={emotion.id}
            label={emotion.label}
            icon={emotion.icon}
            selected={selectedEmotion === emotion.id}
            onClick={() => onSelectEmotion(emotion.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default EmotionalStateSelector;
