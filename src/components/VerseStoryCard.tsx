import React, { useMemo } from 'react';
import { Verse } from '@/data/verses';
import { getEmotionMeta, getVerseEmotion } from '@/lib/shareVerse';

interface VerseStoryCardProps {
  verse: Verse;
  gradient: {
    name: string;
    colors: string[];
  };
  fontStyle?: 'serif' | 'sans' | 'elegant';
  className?: string;
}

// Trunca o texto de forma inteligente, mantendo palavras completas
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '...';
  }
  return truncated + '...';
};

// Retorna configurações de fonte baseadas no tamanho do texto
const getTextConfig = (textLength: number) => {
  if (textLength <= 80) {
    return {
      sizeClass: 'text-base',
      maxChars: 150,
      lineHeight: 'leading-relaxed',
    };
  }
  if (textLength <= 150) {
    return {
      sizeClass: 'text-sm',
      maxChars: 200,
      lineHeight: 'leading-relaxed',
    };
  }
  if (textLength <= 250) {
    return {
      sizeClass: 'text-xs',
      maxChars: 280,
      lineHeight: 'leading-normal',
    };
  }
  return {
    sizeClass: 'text-[10px]',
    maxChars: 320,
    lineHeight: 'leading-normal',
  };
};

/**
 * Preview visual do card em formato Story (9:16).
 * Otimizado para Instagram Stories e WhatsApp Status.
 */
const VerseStoryCard: React.FC<VerseStoryCardProps> = ({
  verse,
  gradient,
  fontStyle = 'serif',
  className,
}) => {
  const emotion = useMemo(() => getVerseEmotion(verse), [verse]);
  const emotionMeta = useMemo(() => getEmotionMeta(emotion), [emotion]);

  const fontFamily = useMemo(() => {
    if (fontStyle === 'sans') return 'Arial, Helvetica, sans-serif';
    if (fontStyle === 'elegant') return '"Palatino Linotype", Palatino, Georgia, serif';
    return 'Georgia, "Times New Roman", Times, serif';
  }, [fontStyle]);

  const fontClass = useMemo(() => {
    if (fontStyle === 'sans') return 'font-sans';
    if (fontStyle === 'elegant') return 'italic';
    return 'font-serif';
  }, [fontStyle]);

  const textConfig = useMemo(() => getTextConfig(verse.text.length), [verse.text.length]);
  const displayText = useMemo(
    () => truncateText(verse.text, textConfig.maxChars),
    [verse.text, textConfig.maxChars]
  );

  return (
    <div
      className={[
        'relative w-full rounded-xl overflow-hidden shadow-lg',
        className ?? '',
      ].join(' ')}
      style={{
        aspectRatio: '9/16',
        background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]}, ${gradient.colors[2]})`,
      }}
    >
      {/* Círculos decorativos - menores para não interferir */}
      <div className="absolute inset-0">
        <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 h-full flex flex-col px-3 pt-6 pb-4 text-white">
        {/* Header emocional */}
        {emotionMeta && (
          <div className="text-center mb-2">
            <div
              className="text-[8px] font-bold tracking-wide drop-shadow"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              {emotionMeta.title} {emotionMeta.emoji}
            </div>
          </div>
        )}

        {/* Aspas decorativas */}
        <div className="relative">
          <div
            className="absolute -left-0.5 -top-1 text-white/15 font-bold leading-none"
            style={{
              fontFamily,
              fontSize: 32,
            }}
          >
            "
          </div>

          <div className="mt-4 flex justify-center">
            <div className="w-8 h-[1px] bg-white/50 rounded" />
          </div>
        </div>

        {/* Texto do versículo - centralizado verticalmente */}
        <div className="flex-1 flex items-center justify-center py-3">
          <div className="w-full text-center px-1">
            <p
              className={[
                fontClass,
                textConfig.sizeClass,
                textConfig.lineHeight,
                'drop-shadow',
              ].join(' ')}
              style={{ fontFamily }}
            >
              "{displayText}"
            </p>

            <p
              className="mt-3 text-[9px] font-semibold opacity-90 drop-shadow"
              style={{ fontFamily }}
            >
              — {verse.reference}
            </p>
          </div>
        </div>

        {/* Linha decorativa inferior */}
        <div className="flex justify-center mb-2">
          <div className="w-6 h-[1px] bg-white/40 rounded" />
        </div>

        {/* Assinatura */}
        <div
          className="text-center text-[7px] opacity-85 drop-shadow mb-1"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          A Palavra deve ser compartilhada.
        </div>

        {/* URL */}
        <div
          className="text-center text-[6px] opacity-50"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          apalavra-ap.com.br
        </div>
      </div>
    </div>
  );
};

export default VerseStoryCard;
