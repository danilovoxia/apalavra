import { Verse } from '@/data/verses';
import { getReflectionForVerse } from '@/data/reflections';

export type EmotionKey =
  | 'medo'
  | 'ansiedade'
  | 'tristeza'
  | 'raiva'
  | 'culpa'
  | 'solidao'
  | 'estresse'
  | 'gratidao'
  | 'alegria'
  | 'paz'
  | 'esperanca'
  | 'amor'
  | 'forca'
  | 'proposito';

export const EMOTION_META: Record<EmotionKey, { title: string; emoji: string }> = {
  medo: { title: 'SOBRE MEDO', emoji: '😰' },
  ansiedade: { title: 'SOBRE ANSIEDADE', emoji: '😟' },
  tristeza: { title: 'SOBRE TRISTEZA', emoji: '😢' },
  raiva: { title: 'SOBRE RAIVA', emoji: '😠' },
  culpa: { title: 'SOBRE CULPA', emoji: '😔' },
  solidao: { title: 'SOBRE SOLIDÃO', emoji: '🥺' },
  estresse: { title: 'SOBRE ESTRESSE', emoji: '😮‍💨' },
  gratidao: { title: 'SOBRE GRATIDÃO', emoji: '🙏' },
  alegria: { title: 'SOBRE ALEGRIA', emoji: '😄' },
  paz: { title: 'SOBRE PAZ', emoji: '🕊️' },
  esperanca: { title: 'SOBRE ESPERANÇA', emoji: '✨' },
  amor: { title: 'SOBRE AMOR', emoji: '❤️' },
  forca: { title: 'SOBRE FORÇA', emoji: '💪' },
  proposito: { title: 'SOBRE PROPÓSITO', emoji: '🎯' },
};

export const normalizeEmotion = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // acentos
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // remove emoji/pontuação (unicode)
    .replace(/\s+/g, ' ')
    .trim();
};

export const getVerseEmotion = (verse?: Verse | null): string => {
  if (!verse) return '';
  const raw =
    (verse as any).emotion
    ?? (verse as any).mood
    ?? (verse as any).feeling
    ?? (verse as any).categoria
    ?? '';
  return normalizeEmotion(String(raw));
};

export const getEmotionMeta = (emotion?: string) => {
  if (!emotion) return null;

  const key = normalizeEmotion(emotion);

  const aliases: Record<string, EmotionKey> = {
    gratidao: 'gratidao',
    solidao: 'solidao',
    proposito: 'proposito',
    esperanca: 'esperanca',
  };

  const resolved = (aliases[key] ?? key) as EmotionKey;
  return EMOTION_META[resolved] ?? null;
};

export const getVerseReflection = (verse?: Verse | null): string => {
  if (!verse) return '';

  const explicit =
    (verse as any).reflection
    || (verse as any).reflexao
    || (verse as any).devotional
    || (verse as any).message
    || '';

  if (explicit) return String(explicit);

  const emotion = getVerseEmotion(verse);
  return getReflectionForVerse(emotion, verse.id) || '';
};

export const buildHeaderLine = (verse?: Verse | null): string => {
  const meta = getEmotionMeta(getVerseEmotion(verse));
  return meta ? `${meta.title} ${meta.emoji}\n\n` : '';
};

const PLATFORM_URL = 'https://apalavra-ap.com.br/';
const SIGNATURE_LINE = '✝️ A Palavra deve ser compartilhada.';
const CTA_LINE = '📖 Receba versículos personalizados:';

/**
 * Constrói o texto de compartilhamento
 * 
 * @param verse - O versículo a ser compartilhado
 * @param withImage - Se true, NÃO inclui o versículo (pois está na imagem)
 * @returns Texto formatado para compartilhamento
 */
export const buildShareText = ({
  verse,
  withImage,
}: {
  verse: Verse;
  withImage: boolean;
}): string => {
  const header = buildHeaderLine(verse).trim();
  const reflection = getVerseReflection(verse);

  const parts: string[] = [];
  
  // Header emocional (se houver)
  if (header) parts.push(header);

  // Versículo completo (apenas quando NÃO tem imagem - desktop)
  if (!withImage) {
    parts.push(`"${verse.text}"\n\n— ${verse.reference}`);
  }

  // Reflexão (se houver)
  if (reflection) {
    parts.push(`💭 ${reflection}`);
  }

  // Assinatura e CTA
  parts.push(SIGNATURE_LINE);
  parts.push(`${CTA_LINE}\n${PLATFORM_URL}`);

  return parts.join('\n\n');
};

/**
 * Texto para MOBILE com card (imagem)
 * - NÃO repete o versículo (já está na imagem)
 * - Inclui: reflexão + CTA + link
 */
export const buildMobileShareText = (verse: Verse): string => {
  return buildShareText({ verse, withImage: true });
};

/**
 * Texto para DESKTOP sem card
 * - Inclui: versículo completo + reflexão + CTA + link
 */
export const buildDesktopShareText = (verse: Verse): string => {
  return buildShareText({ verse, withImage: false });
};
