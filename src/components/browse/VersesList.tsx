import React, { useState } from 'react';
import { BookOpen, Lightbulb, ChevronDown, ChevronUp, Heart, Share2 } from 'lucide-react';
import { Verse } from '@/data/verses';
import { getReflectionForVerse } from '@/data/reflections';
import { useFavorites } from '@/contexts/FavoritesContext';

interface VersesListProps {
  verses: Verse[];
  onShareVerse: (verse: Verse) => void;
  title?: string;
}

interface VerseItemProps {
  verse: Verse;
  onShareVerse: (verse: Verse) => void;
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, onShareVerse }) => {
  const [showReflection, setShowReflection] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const reflection = getReflectionForVerse(verse.emotion, verse.id);
  const saved = isFavorite(verse.id);

  const handleToggleFavorite = async () => {
    await toggleFavorite(verse);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-100">
      <p className="text-gray-700 leading-relaxed mb-3 text-lg">"{verse.text}"</p>
      
      {/* Reflexão */}
      <div className="mb-3">
        <button
          onClick={() => setShowReflection(!showReflection)}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors text-sm"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="font-medium">Reflexão</span>
          {showReflection ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
        
        {showReflection && (
          <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-gray-600 text-sm leading-relaxed">
              {reflection}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-cyan-600 font-semibold">{verse.reference}</span>
        <div className="flex items-center gap-2">
          {/* Favoritar */}
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
              saved
                ? 'bg-rose-100 text-rose-600'
                : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
            }`}
            title={saved ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
          </button>
          
          {/* Botão de compartilhar (abre modal) */}
          <button
            onClick={() => onShareVerse(verse)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

  );
};

const VersesList: React.FC<VersesListProps> = ({ verses, onShareVerse, title }) => {
  if (verses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Nenhum versículo encontrado</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-500" />
          {title}
          <span className="text-sm font-normal text-gray-500">({verses.length} versículos)</span>
        </h2>
      )}
      <div className="grid gap-4">
        {verses.map(verse => (
          <VerseItem key={verse.id} verse={verse} onShareVerse={onShareVerse} />
        ))}
      </div>
    </div>
  );
};

export default VersesList;
