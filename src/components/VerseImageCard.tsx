import React, { useMemo } from 'react';
import { Verse } from '@/data/verses';
import { getEmotionMeta, getVerseEmotion } from '@/lib/shareVerse';

interface VerseImageCardProps {
  verse: Verse;
  gradient: {
    name: string;
    colors: string[];
  };
  fontStyle?: 'serif' | 'sans' | 'elegant';
  className?: string;
}

/**
 * Preview visual do card.
 * Objetivo: bater 1:1 com o canvas gerado no ShareVerseModal/QuickShare.
 */
const VerseImageCard: React.FC<VerseImageCardProps> = ({
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

  return (
    <div
      className={[
        'relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg',
        className ?? '',
      ].join(' ')}
      style={{
        background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]}, ${gradient.colors[2]})`,
      }}
    >
      {/* Círculos decorativos */}
      <div className="absolute inset-0">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-white/5" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 h-full flex flex-col px-6 pt-5 pb-4 text-white">
        {/* Header emocional (SOBRE X + emoji) */}
        {emotionMeta && (
          <div className="text-center mb-2">
            <div
              className="text-[13px] sm:text-sm font-bold tracking-wide drop-shadow"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              {emotionMeta.title} {emotionMeta.emoji}
            </div>
          </div>
        )}

        {/* Aspas + linha */}
        <div className="relative mt-1">
          <div
            className="absolute -left-1 -top-1 text-white/20 font-bold leading-none"
            style={{
              fontFamily,
              fontSize: 64,
            }}
          >
            "
          </div>

          <div className="mt-8 flex justify-center">
            <div className="w-12 h-[2px] bg-white/60 rounded" />
          </div>
        </div>

        {/* Texto (centralizado como no canvas) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full text-center">
            <p
              className={[
                fontClass,
                'leading-relaxed drop-shadow',
                // Ajuste de tamanho parecido com o canvas
                verse.text.length <= 80
                  ? 'text-[20px] sm:text-[22px]'
                  : verse.text.length <= 150
                  ? 'text-[18px] sm:text-[20px]'
                  : 'text-[16px] sm:text-[18px]',
              ].join(' ')}
              style={{ fontFamily }}
            >
              “{verse.text}”
            </p>

            <p
              className="mt-4 text-[15px] sm:text-[16px] font-semibold opacity-90 drop-shadow"
              style={{ fontFamily }}
            >
              — {verse.reference}
            </p>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="flex justify-center mb-2">
          <div className="w-10 h-[2px] bg-white/40 rounded" />
        </div>

        {/* Assinatura (igual ao canvas) */}
        <div
          className="text-center text-[12px] sm:text-[13px] opacity-90 drop-shadow"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          A Palavra deve ser compartilhada.
        </div>

        {/* URL */}
        <div
          className="absolute bottom-2 right-3 text-[10px] opacity-60"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          apalavra-ap.com.br
        </div>
      </div>
    </div>
  );
};

export default VerseImageCard;
