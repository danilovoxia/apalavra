import React, { useState } from 'react';
import { Verse } from '@/data/verses';
import { getReflectionForVerse } from '@/data/reflections';
import {
  Heart,
  RefreshCw,
  ArrowLeft,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';
import ShareVerseModal from './ShareVerseModal';
import { useFavorites } from '@/contexts/FavoritesContext';

interface PersonalizedVerseScreenProps {
  verse: Verse;
  mood: string;
  onBack: () => void;
  onGenerateNew: () => void;
  isSaved: boolean;
  canGenerateNew: boolean;
  generationsLeft: number;
  onShowPaywall: () => void;
}

const moodColors: Record<
  string,
  { bg: string; text: string; accent: string; reflectionBg: string }
> = {
  paz: {
    bg: 'from-cyan-50 via-white to-cyan-50',
    text: 'text-cyan-800',
    accent: 'bg-cyan-500',
    reflectionBg: 'bg-cyan-50/80',
  },
  ansiedade: {
    bg: 'from-amber-50 via-white to-amber-50',
    text: 'text-amber-800',
    accent: 'bg-amber-500',
    reflectionBg: 'bg-amber-50/80',
  },
  gratidao: {
    bg: 'from-yellow-50 via-white to-yellow-50',
    text: 'text-yellow-800',
    accent: 'bg-yellow-500',
    reflectionBg: 'bg-yellow-50/80',
  },
  tristeza: {
    bg: 'from-slate-100 via-white to-slate-100',
    text: 'text-slate-700',
    accent: 'bg-slate-500',
    reflectionBg: 'bg-slate-100/80',
  },
  esperanca: {
    bg: 'from-orange-50 via-white to-orange-50',
    text: 'text-orange-800',
    accent: 'bg-orange-500',
    reflectionBg: 'bg-orange-50/80',
  },
  amor: {
    bg: 'from-red-50 via-white to-red-50',
    text: 'text-red-800',
    accent: 'bg-red-500',
    reflectionBg: 'bg-red-50/80',
  },
  medo: {
    bg: 'from-teal-50 via-white to-teal-50',
    text: 'text-teal-800',
    accent: 'bg-teal-500',
    reflectionBg: 'bg-teal-50/80',
  },
  alegria: {
    bg: 'from-amber-50 via-white to-amber-50',
    text: 'text-amber-800',
    accent: 'bg-amber-500',
    reflectionBg: 'bg-amber-50/80',
  },
  forca: {
    bg: 'from-cyan-50 via-white to-cyan-50',
    text: 'text-cyan-800',
    accent: 'bg-cyan-500',
    reflectionBg: 'bg-cyan-50/80',
  },
  proposito: {
    bg: 'from-teal-50 via-white to-teal-50',
    text: 'text-teal-800',
    accent: 'bg-teal-500',
    reflectionBg: 'bg-teal-50/80',
  },
};

const PersonalizedVerseScreen: React.FC<PersonalizedVerseScreenProps> = ({
  verse,
  mood,
  onBack,
  onGenerateNew,
  canGenerateNew,
  generationsLeft,
  onShowPaywall,
}) => {
  const [showShare, setShowShare] = useState(false);
  const [showReflection, setShowReflection] = useState(true);

  const { toggleFavorite, isFavorite } = useFavorites();
  const colors = moodColors[mood] || moodColors.paz;

  // Fonte única de verdade para o emocional
  const verseWithEmotion: Verse = {
    ...verse,
    emotion: mood,
  };

  const reflection = getReflectionForVerse(
    verseWithEmotion.emotion,
    verseWithEmotion.id
  );

  const saved = isFavorite(verse.id);

  const handleGenerateNew = () => {
    if (canGenerateNew) onGenerateNew();
    else onShowPaywall();
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(verseWithEmotion);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.bg} flex flex-col`}>
      {/* Header */}
      <div className="p-4">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 ${colors.text} hover:opacity-70 transition-opacity`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar</span>
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full text-center mb-6">
          <p
            className={`text-2xl md:text-4xl font-serif leading-relaxed ${colors.text} mb-8`}
          >
            "{verse.text}"
          </p>
          <p
            className={`text-lg md:text-xl font-medium ${colors.text} opacity-70`}
          >
            — {verse.reference}
          </p>
        </div>

        {/* Reflexão */}
        <div className="max-w-xl w-full mt-6">
          <button
            onClick={() => setShowReflection(!showReflection)}
            className={`w-full flex items-center justify-center gap-3 px-5 py-3 ${colors.reflectionBg} backdrop-blur-sm rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all`}
          >
            <Lightbulb className={`w-5 h-5 ${colors.text}`} />
            <span className={`font-semibold ${colors.text}`}>
              Reflexão
            </span>
            {showReflection ? (
              <ChevronUp className={`w-4 h-4 ${colors.text} opacity-60`} />
            ) : (
              <ChevronDown className={`w-4 h-4 ${colors.text} opacity-60`} />
            )}
          </button>

          {showReflection && (
            <div
              className={`mt-3 p-5 ${colors.reflectionBg} backdrop-blur-sm rounded-xl border border-white/50 shadow-inner`}
            >
              <p
                className={`${colors.text} opacity-90 leading-relaxed text-center`}
              >
                {reflection}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="p-6 pb-12">
        <div className="max-w-md mx-auto space-y-4">
          {/* Botão principal de compartilhar - DESTAQUE */}
          <button
            onClick={() => setShowShare(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-semibold text-base">Compartilhar</span>
          </button>

          {/* Ações secundárias */}
          <div className="flex gap-3">
            {/* Favoritar */}
            <button
              onClick={handleToggleFavorite}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl shadow transition-all ${
                saved
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                  : 'bg-white/90 backdrop-blur hover:bg-white border border-cyan-100'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${saved ? 'fill-current' : 'text-rose-500'}`}
              />
              <span className={`font-medium ${saved ? '' : 'text-gray-800'}`}>
                {saved ? 'Salvo' : 'Salvar'}
              </span>
            </button>

            {/* Gerar outro */}
            <button
              onClick={handleGenerateNew}
              className="flex-1 flex items-center justify-center gap-2 bg-white/90 backdrop-blur px-4 py-2.5 rounded-xl shadow hover:bg-white transition-colors border border-cyan-100"
            >
              <RefreshCw className="w-5 h-5 text-cyan-600" />
              <span className="text-cyan-800 font-medium">Outro verso</span>
              {!canGenerateNew && (
                <span className="text-xs text-cyan-600/60">
                  ({generationsLeft})
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de compartilhamento */}
      <ShareVerseModal
        verse={verseWithEmotion}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
};

export default PersonalizedVerseScreen;
