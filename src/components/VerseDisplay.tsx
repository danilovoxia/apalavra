import React from 'react';
import VerseCard from './VerseCard';
import { Verse } from '@/data/verses';

interface VerseDisplayProps {
  verses: Verse[];
  onSaveVerse: (verse: Verse) => void;
  savedVerseIds: string[];
  userPlan: string;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({ 
  verses, 
  onSaveVerse, 
  savedVerseIds,
  userPlan
}) => {
  const displayVerses = verses;
  const isDailyVerse = verses.length === 1;

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
        {isDailyVerse ? 'Versículo do Dia' : 'Versículos para você'}
      </h2>
      {isDailyVerse && (
        <p className="text-center text-gray-600 mb-8">
          Um novo versículo especial para refletir hoje
        </p>
      )}
      
      <div className="space-y-6 max-w-3xl mx-auto">
        {displayVerses.map((verse) => (
          <VerseCard
            key={verse.id}
            verse={verse}
            onSave={() => onSaveVerse(verse)}
            saved={savedVerseIds.includes(verse.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default VerseDisplay;
