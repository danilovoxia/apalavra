import React, { useCallback, useMemo, useState } from 'react';
import { Verse } from '@/data/verses';
import { Loader2, Share2, Instagram } from 'lucide-react';
import { toast } from 'sonner';

import { buildMobileShareText, buildDesktopShareText, getEmotionMeta, getVerseEmotion } from '@/lib/shareVerse';
import { useShareAnalytics } from '@/contexts/ShareAnalyticsContext';
import { useGamification } from '@/contexts/GamificationContext';

interface QuickShareButtonProps {
  verse: Verse | null;
  className?: string;
  variant?: 'default' | 'icon' | 'story';
}

// Detecta se é mobile
const isMobileDevice = () =>
  typeof navigator !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Verifica se pode compartilhar arquivos via Web Share API
const canShareFiles = (file: File) => {
  try {
    return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
  } catch {
    return false;
  }
};

// Copia texto para clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Abre WhatsApp com texto
const openWhatsApp = (text: string) => {
  const encoded = encodeURIComponent(text);
  if (isMobileDevice()) {
    window.open(`whatsapp://send?text=${encoded}`, '_blank');
  } else {
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
  }
};

// Trunca texto mantendo palavras inteiras
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated)
    .trim()
    .concat('...');
};

// Extrai livro da referência
const extractBook = (reference: string): string => {
  const match = reference.match(/^(\d?\s*[A-Za-zÀ-ÿ]+)/);
  return match ? match[1].trim() : reference.split(' ')[0];
};

// Ícone do WhatsApp
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const QuickShareButton: React.FC<QuickShareButtonProps> = ({ verse, className, variant = 'default' }) => {
  const [loading, setLoading] = useState(false);
  const { trackShare } = useShareAnalytics();
  
  // Safely try to use gamification context
  let checkAndUnlockBadges: (() => void) | null = null;
  try {
    const gamification = useGamification();
    checkAndUnlockBadges = gamification.checkAndUnlockBadges;
  } catch (e) {
    // Gamification context not available
  }

  const emotion = useMemo(() => getVerseEmotion(verse), [verse]);
  const emotionMeta = useMemo(() => getEmotionMeta(emotion), [emotion]);

  // Gera imagem do card no canvas (quadrado 1:1)
  const generateCardImage = useCallback(async (): Promise<File | null> => {
    if (!verse?.text || !verse?.reference) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const size = 540;
    canvas.width = size;
    canvas.height = size;

    // Gradiente de fundo
    const colors = ['#3b82f6', '#a855f7', '#ec4899'];
    const grd = ctx.createLinearGradient(0, 0, size, size);
    grd.addColorStop(0, colors[0]);
    grd.addColorStop(0.5, colors[1]);
    grd.addColorStop(1, colors[2]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);

    // Decoração
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(size - 50, 50, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(50, size - 50, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 100, 0, Math.PI * 2);
    ctx.fill();

    const hasHeader = Boolean(emotionMeta);
    const headerOffset = hasHeader ? 34 : 0;

    // Header emocional
    if (emotionMeta) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(`${emotionMeta.title} ${emotionMeta.emoji}`, size / 2, 44);
      ctx.restore();
    }

    // Aspas decorativas
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = 'bold 70px Georgia, "Times New Roman", Times, serif';
    ctx.fillText('"', 27, 75 + headerOffset);

    // Linha decorativa
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(size / 2 - 25, 108 + headerOffset, 50, 2);

    // Texto do versículo
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    const textLength = verse.text.length;
    let fontSizeMain = 20;
    let maxChars = 220;

    if (textLength <= 80) {
      fontSizeMain = 26;
      maxChars = 150;
    } else if (textLength <= 150) {
      fontSizeMain = 23;
      maxChars = 180;
    }

    ctx.font = `${fontSizeMain}px Georgia, "Times New Roman", Times, serif`;

    const text = truncateText(verse.text, maxChars);
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    const maxWidth = size - 70;
    const maxLines = 8;

    for (const word of words) {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line.trim());
        line = `${word} `;
        if (lines.length >= maxLines) break;
      } else {
        line = test;
      }
    }
    if (line && lines.length < maxLines) lines.push(line.trim());

    const lineHeight = fontSizeMain + 10;
    const totalTextHeight = lines.length * lineHeight;

    const contentAreaTop = 135 + headerOffset;
    const contentAreaBottom = size - 100;
    const contentAreaHeight = contentAreaBottom - contentAreaTop;

    let startY = contentAreaTop + (contentAreaHeight - totalTextHeight) / 2 + fontSizeMain;
    if (startY < contentAreaTop + fontSizeMain) startY = contentAreaTop + fontSizeMain;

    for (let i = 0; i < lines.length; i++) {
      let lineText = lines[i];
      if (i === 0) lineText = `"${lineText}`;
      if (i === lines.length - 1) lineText = `${lineText}"`;
      ctx.fillText(lineText, size / 2, startY + i * lineHeight);
    }

    // Referência
    ctx.shadowBlur = 3;
    ctx.font = 'bold 20px Georgia, "Times New Roman", Times, serif';
    const refY = Math.min(startY + lines.length * lineHeight + 24, size - 88);
    ctx.fillText(`— ${verse.reference}`, size / 2, refY);

    // Linha inferior
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(size / 2 - 20, size - 68, 40, 2);

    // Assinatura
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.textAlign = 'center';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('A Palavra deve ser compartilhada.', size / 2, size - 34);

    // URL
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'right';
    ctx.fillText('apalavra-ap.com.br', size - 12, size - 8);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });

    if (!blob) return null;

    return new File([blob], `versiculo-${verse.reference.replace(/\s/g, '-')}.jpg`, {
      type: 'image/jpeg',
    });
  }, [emotionMeta, verse]);

  // Gera imagem para Stories (9:16)
  const generateStoryImage = useCallback(async (): Promise<File | null> => {
    if (!verse?.text || !verse?.reference) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Formato 9:16 (1080x1920)
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;

    // Gradiente de fundo
    const colors = ['#3b82f6', '#a855f7', '#ec4899'];
    const grd = ctx.createLinearGradient(0, 0, width, height);
    grd.addColorStop(0, colors[0]);
    grd.addColorStop(0.5, colors[1]);
    grd.addColorStop(1, colors[2]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Decorações maiores
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(width - 80, 120, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(80, height - 120, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 3, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width - 50, height * 0.6, 80, 0, Math.PI * 2);
    ctx.fill();

    const hasHeader = Boolean(emotionMeta);
    const headerOffset = hasHeader ? 80 : 0;

    // Header emocional
    if (emotionMeta) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.fillText(`${emotionMeta.title} ${emotionMeta.emoji}`, width / 2, 200);
      ctx.restore();
    }

    // Aspas grandes
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = 'bold 160px Georgia, "Times New Roman", Times, serif';
    ctx.fillText('"', 60, 280 + headerOffset);

    // Linha decorativa superior
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(width / 2 - 60, 350 + headerOffset, 120, 4);

    // Texto do versículo
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    const textLength = verse.text.length;
    let fontSize = 44;
    let maxChars = 300;

    if (textLength <= 80) {
      fontSize = 56;
      maxChars = 200;
    } else if (textLength <= 150) {
      fontSize = 50;
      maxChars = 250;
    }

    ctx.font = `${fontSize}px Georgia, "Times New Roman", Times, serif`;

    const text = truncateText(verse.text, maxChars);
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    const maxWidth = width - 120;

    for (const word of words) {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line.trim());
        line = `${word} `;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line.trim());

    const lineHeight = fontSize + 20;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + 50;

    for (let i = 0; i < lines.length; i++) {
      let lineText = lines[i];
      if (i === 0) lineText = `"${lineText}`;
      if (i === lines.length - 1) lineText = `${lineText}"`;
      ctx.fillText(lineText, width / 2, startY + i * lineHeight);
    }

    // Referência
    ctx.font = 'bold 42px Georgia, "Times New Roman", Times, serif';
    ctx.fillText(`— ${verse.reference}`, width / 2, startY + lines.length * lineHeight + 60);

    // Linha decorativa inferior
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(width / 2 - 40, height - 220, 80, 4);

    // Assinatura
    ctx.font = '32px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText('A Palavra deve ser compartilhada.', width / 2, height - 140);

    // URL
    ctx.font = '24px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('apalavra-ap.com.br', width / 2, height - 80);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });

    if (!blob) return null;

    return new File([blob], `versiculo-story-${verse.reference.replace(/\s/g, '-')}.jpg`, {
      type: 'image/jpeg',
    });
  }, [emotionMeta, verse]);

  // Handler para compartilhar Stories
  const handleShareStory = useCallback(async () => {
    if (!verse?.reference || !verse?.text) {
      toast.error('Versículo indisponível.');
      return;
    }

    setLoading(true);

    try {
      const file = await generateStoryImage();
      
      if (!file) {
        toast.error('Erro ao gerar imagem para Stories.');
        return;
      }

      if (canShareFiles(file)) {
        await navigator.share({ files: [file] });
        
        await trackShare({
          verse_reference: verse.reference,
          verse_book: extractBook(verse.reference),
          channel: 'instagram',
          device_type: 'mobile',
          with_image: true
        });

        if (checkAndUnlockBadges) {
          setTimeout(() => checkAndUnlockBadges!(), 500);
        }

        toast.custom(() => (
          <div className="flex items-start gap-3 p-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex-shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-gray-900 text-sm">Poste nos Stories!</p>
              <p className="text-xs text-gray-600">
                Escolha Instagram ou WhatsApp Status
              </p>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'bottom-center',
        });
      } else {
        // Fallback: baixar
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Imagem salva! Poste nos Stories.');
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return;
      toast.error('Erro ao compartilhar.');
    } finally {
      setLoading(false);
    }
  }, [verse, generateStoryImage, trackShare, checkAndUnlockBadges]);

  // Handler principal de compartilhamento (Feed/Chat)
  const handleShare = useCallback(async () => {
    if (!verse?.reference || !verse?.text) {
      toast.error('Versículo indisponível. Tente novamente.');
      return;
    }

    setLoading(true);

    try {
      const isMobile = isMobileDevice();
      const deviceType = isMobile ? 'mobile' : 'desktop';
      const verseBook = extractBook(verse.reference);

      // Textos para compartilhamento
      const mobileText = buildMobileShareText(verse);
      const desktopText = buildDesktopShareText(verse);

      // Desktop: Apenas texto completo
      if (!isMobile) {
        openWhatsApp(desktopText);
        
        await trackShare({
          verse_reference: verse.reference,
          verse_book: verseBook,
          channel: 'whatsapp',
          device_type: deviceType,
          with_image: false
        });
        
        if (checkAndUnlockBadges) {
          setTimeout(() => checkAndUnlockBadges!(), 500);
        }
        
        toast.success('Abrindo WhatsApp Web...');
        return;
      }

      // Mobile: Copia texto e compartilha imagem
      await copyToClipboard(mobileText);

      const cardFile = await generateCardImage();
      
      if (!cardFile) {
        toast.info('Não foi possível gerar o card. Abrindo WhatsApp...');
        openWhatsApp(mobileText);
        
        await trackShare({
          verse_reference: verse.reference,
          verse_book: verseBook,
          channel: 'whatsapp',
          device_type: deviceType,
          with_image: false
        });
        
        if (checkAndUnlockBadges) {
          setTimeout(() => checkAndUnlockBadges!(), 500);
        }
        return;
      }

      if (canShareFiles(cardFile)) {
        try {
          await navigator.share({ files: [cardFile] });
          
          await trackShare({
            verse_reference: verse.reference,
            verse_book: verseBook,
            channel: 'whatsapp',
            device_type: deviceType,
            with_image: true
          });
          
          if (checkAndUnlockBadges) {
            setTimeout(() => checkAndUnlockBadges!(), 500);
          }
          
          toast.success('Agora cole o texto no WhatsApp!', { duration: 4000 });
          return;
        } catch (shareError) {
          if ((shareError as Error)?.name === 'AbortError') {
            return;
          }
          console.warn('Web Share API falhou:', shareError);
        }
      }

      // Fallback: baixa e abre WhatsApp
      const url = URL.createObjectURL(cardFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `versiculo-${verse.reference.replace(/\s/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        openWhatsApp(mobileText);
      }, 300);
      
      await trackShare({
        verse_reference: verse.reference,
        verse_book: verseBook,
        channel: 'whatsapp',
        device_type: deviceType,
        with_image: true
      });
      
      if (checkAndUnlockBadges) {
        setTimeout(() => checkAndUnlockBadges!(), 500);
      }

      toast.info('Card salvo! Anexe a imagem e cole o texto.', { duration: 5000 });

    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      
      const desktopText = buildDesktopShareText(verse);
      openWhatsApp(desktopText);
      
      await trackShare({
        verse_reference: verse.reference,
        verse_book: extractBook(verse.reference),
        channel: 'whatsapp',
        device_type: isMobileDevice() ? 'mobile' : 'desktop',
        with_image: false
      });
      
      if (checkAndUnlockBadges) {
        setTimeout(() => checkAndUnlockBadges!(), 500);
      }
      
      toast.info('Abrindo WhatsApp...');
    } finally {
      setLoading(false);
    }
  }, [generateCardImage, verse, trackShare, checkAndUnlockBadges]);

  const disabled = loading || !verse?.reference;
  const isMobile = isMobileDevice();

  // Variante story (para Stories)
  if (variant === 'story') {
    return (
      <button
        onClick={handleShareStory}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-70 shadow-lg ${className || ''}`}
        title="Compartilhar nos Stories"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Instagram className="w-5 h-5" />
        )}
        <span className="font-medium">Stories</span>
      </button>
    );
  }

  // Variante icon-only (compacta)
  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={disabled}
        className={`flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white p-2.5 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70 ${className || ''}`}
        title={isMobile ? "Compartilhar card no WhatsApp" : "Enviar no WhatsApp"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <WhatsAppIcon className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Variante default (com texto)
  return (
    <button
      onClick={handleShare}
      disabled={disabled}
      className={
        className
          ? `flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-70 ${className}`
          : 'flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-70'
      }
      title={isMobile ? "Compartilhar card no WhatsApp" : "Enviar texto no WhatsApp Web"}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isMobile ? (
        <Share2 className="w-5 h-5" />
      ) : (
        <WhatsAppIcon className="w-5 h-5" />
      )}
      <span className="font-medium">
        {loading ? 'Preparando...' : (isMobile ? 'Compartilhar' : 'WhatsApp')}
      </span>
    </button>
  );
};

export default QuickShareButton;
