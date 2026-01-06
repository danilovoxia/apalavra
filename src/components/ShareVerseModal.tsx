import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, RefreshCw, Share, Instagram, MessageCircle } from 'lucide-react';
import { Verse } from '@/data/verses';
import VerseImageCard from './VerseImageCard';
import VerseStoryCard from './VerseStoryCard';
import ShareButtons from './share/ShareButtons';
import { toast } from 'sonner';
import {
  getVerseEmotion,
  getEmotionMeta,
  buildMobileShareText,
  buildDesktopShareText,
} from '@/lib/shareVerse';
import { gradients } from './share/GradientPicker';

interface ShareVerseModalProps {
  verse: Verse | null;
  isOpen: boolean;
  onClose: () => void;
}

const SIGNATURE_LINE = 'A Palavra deve ser compartilhada.';
const DEFAULT_GRADIENT_INDEX = 0;
const DEFAULT_FONT_STYLE: 'serif' = 'serif';

const isMobileDevice = () =>
  typeof navigator !== 'undefined'
  && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

type ShareMode = 'feed' | 'story';

const ShareVerseModal: React.FC<ShareVerseModalProps> = ({ verse, isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>('feed');

  const isMobile = isMobileDevice();
  const emotionMeta = useMemo(
    () => getEmotionMeta(getVerseEmotion(verse)),
    [verse],
  );

  // Gera imagem quadrada (1:1) para feed
  const generateCanvasImage = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!verse) return resolve(null);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      const size = 540;
      canvas.width = size;
      canvas.height = size;

      const gradient = gradients[DEFAULT_GRADIENT_INDEX];
      const colors = gradient?.colors || ['#3b82f6', '#a855f7', '#ec4899'];

      const grd = ctx.createLinearGradient(0, 0, size, size);
      grd.addColorStop(0, colors[0]);
      grd.addColorStop(0.5, colors[1]);
      grd.addColorStop(1, colors[2]);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);

      // Decorações
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

      // Aspas
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = 'bold 70px Georgia, "Times New Roman", Times, serif';
      ctx.fillText('"', 27, 75 + headerOffset);

      // Linha
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(size / 2 - 25, 108 + headerOffset, 50, 2);

      // Texto do versículo
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      const textLength = verse.text.length;
      let fontSize = 20;
      let maxChars = 220;

      if (textLength <= 80) {
        fontSize = 26;
        maxChars = 150;
      } else if (textLength <= 150) {
        fontSize = 23;
        maxChars = 180;
      }

      ctx.font = `${fontSize}px Georgia, "Times New Roman", Times, serif`;

      const text = verse.text.slice(0, maxChars);
      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';
      const maxWidth = size - 70;

      words.forEach((word) => {
        const test = `${line}${word} `;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line.trim());
          line = `${word} `;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line.trim());

      const lineHeight = fontSize + 10;
      const startY = 200;

      lines.forEach((l, i) => {
        let textLine = l;
        if (i === 0) textLine = `"${textLine}`;
        if (i === lines.length - 1) textLine = `${textLine}"`;
        ctx.fillText(textLine, size / 2, startY + i * lineHeight);
      });

      // Referência
      ctx.font = 'bold 20px Georgia, "Times New Roman", Times, serif';
      ctx.fillText(`— ${verse.reference}`, size / 2, startY + lines.length * lineHeight + 24);

      // Assinatura
      ctx.font = '16px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.fillText(SIGNATURE_LINE, size / 2, size - 34);

      ctx.font = '10px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.textAlign = 'right';
      ctx.fillText('apalavra-ap.com.br', size - 12, size - 8);

      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
  }, [verse, emotionMeta]);

  // Gera imagem vertical (9:16) para Stories
  const generateStoryImage = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!verse) return resolve(null);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Formato 9:16 (1080x1920 é o ideal para Stories)
      const width = 1080;
      const height = 1920;
      canvas.width = width;
      canvas.height = height;

      const gradient = gradients[DEFAULT_GRADIENT_INDEX];
      const colors = gradient?.colors || ['#3b82f6', '#a855f7', '#ec4899'];

      const grd = ctx.createLinearGradient(0, 0, width, height);
      grd.addColorStop(0, colors[0]);
      grd.addColorStop(0.5, colors[1]);
      grd.addColorStop(1, colors[2]);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // Decorações - mais sutis
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.arc(width - 60, 100, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(60, height - 100, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 3, 160, 0, Math.PI * 2);
      ctx.fill();

      const hasHeader = Boolean(emotionMeta);
      const headerOffset = hasHeader ? 60 : 0;

      // Header emocional
      if (emotionMeta) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillText(`${emotionMeta.title} ${emotionMeta.emoji}`, width / 2, 180);
        ctx.restore();
      }

      // Aspas - menores e mais sutis
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.font = 'bold 120px Georgia, "Times New Roman", Times, serif';
      ctx.fillText('"', 70, 260 + headerOffset);

      // Linha decorativa superior
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(width / 2 - 50, 320 + headerOffset, 100, 3);

      // Configuração de texto baseada no tamanho
      const textLength = verse.text.length;
      let fontSize: number;
      let maxChars: number;
      let lineHeightMultiplier: number;

      if (textLength <= 80) {
        fontSize = 48;
        maxChars = 150;
        lineHeightMultiplier = 1.5;
      } else if (textLength <= 150) {
        fontSize = 42;
        maxChars = 220;
        lineHeightMultiplier = 1.45;
      } else if (textLength <= 250) {
        fontSize = 36;
        maxChars = 320;
        lineHeightMultiplier = 1.4;
      } else if (textLength <= 350) {
        fontSize = 32;
        maxChars = 400;
        lineHeightMultiplier = 1.35;
      } else {
        fontSize = 28;
        maxChars = 450;
        lineHeightMultiplier = 1.3;
      }

      // Truncar texto se necessário
      let displayText = verse.text;
      if (displayText.length > maxChars) {
        const truncated = displayText.slice(0, maxChars);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > maxChars * 0.7) {
          displayText = truncated.slice(0, lastSpace) + '...';
        } else {
          displayText = truncated + '...';
        }
      }

      // Texto do versículo
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.font = `${fontSize}px Georgia, "Times New Roman", Times, serif`;

      const words = displayText.split(' ');
      const lines: string[] = [];
      let line = '';
      const maxWidth = width - 140; // Margens laterais maiores

      words.forEach((word) => {
        const test = `${line}${word} `;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line.trim());
          line = `${word} `;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line.trim());

      // Limitar número de linhas para garantir que caiba
      const maxLines = Math.floor((height - 700) / (fontSize * lineHeightMultiplier));
      if (lines.length > maxLines) {
        lines.length = maxLines;
        const lastLine = lines[maxLines - 1];
        if (!lastLine.endsWith('...')) {
          const words = lastLine.split(' ');
          words.pop();
          lines[maxLines - 1] = words.join(' ') + '...';
        }
      }

      const lineHeight = fontSize * lineHeightMultiplier;
      const totalTextHeight = lines.length * lineHeight;
      
      // Área disponível para texto (entre header e footer)
      const textAreaTop = 380 + headerOffset;
      const textAreaBottom = height - 280;
      const textAreaHeight = textAreaBottom - textAreaTop;
      
      // Centralizar verticalmente na área disponível
      const startY = textAreaTop + (textAreaHeight - totalTextHeight) / 2 + fontSize;

      lines.forEach((l, i) => {
        let textLine = l;
        if (i === 0) textLine = `"${textLine}`;
        if (i === lines.length - 1 && !textLine.endsWith('"')) {
          textLine = textLine.endsWith('...') ? textLine : `${textLine}"`;
        }
        ctx.fillText(textLine, width / 2, startY + i * lineHeight);
      });

      // Referência - posicionada após o texto
      const refY = startY + lines.length * lineHeight + 50;
      ctx.font = 'bold 36px Georgia, "Times New Roman", Times, serif';
      ctx.fillText(`— ${verse.reference}`, width / 2, refY);

      // Linha decorativa inferior
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(width / 2 - 35, height - 200, 70, 3);

      // Assinatura
      ctx.font = '28px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(SIGNATURE_LINE, width / 2, height - 130);

      // URL
      ctx.font = '22px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('apalavra-ap.com.br', width / 2, height - 80);

      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
  }, [verse, emotionMeta]);


  const getShareFile = useCallback(async () => {
    if (!verse) return null;
    setIsGenerating(true);
    try {
      const blob = shareMode === 'story' 
        ? await generateStoryImage()
        : await generateCanvasImage();
      if (!blob) return null;
      const suffix = shareMode === 'story' ? '-story' : '';
      return new File([blob], `versiculo-${verse.reference.replace(/\s/g, '-')}${suffix}.jpg`, {
        type: 'image/jpeg',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [generateCanvasImage, generateStoryImage, verse, shareMode]);

  // Compartilhar para Stories (Instagram/WhatsApp Status)
  const handleShareStory = useCallback(async () => {
    if (!verse) return;
    setIsGenerating(true);
    
    try {
      const blob = await generateStoryImage();
      if (!blob) {
        toast.error('Erro ao gerar imagem para Stories.');
        return;
      }

      const file = new File([blob], `versiculo-story-${verse.reference.replace(/\s/g, '-')}.jpg`, {
        type: 'image/jpeg',
      });

      // Verifica se pode compartilhar arquivos
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        
        // Toast com instruções para Stories
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
        // Fallback: baixar a imagem
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.custom(() => (
          <div className="flex items-start gap-3 p-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex-shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-gray-900 text-sm">Imagem salva!</p>
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-4 h-4 bg-pink-100 text-pink-700 rounded-full text-[10px] font-bold">1</span>
                  <span>Abra o Instagram ou WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-4 h-4 bg-pink-100 text-pink-700 rounded-full text-[10px] font-bold">2</span>
                  <span>Crie um Story e selecione a imagem</span>
                </div>
              </div>
            </div>
          </div>
        ), {
          duration: 6000,
          position: 'bottom-center',
        });
      }
    } catch (error) {
      if ((error as Error)?.name === 'AbortError') return;
      toast.error('Erro ao compartilhar para Stories.');
    } finally {
      setIsGenerating(false);
    }
  }, [verse, generateStoryImage]);

  useEffect(() => {
    if (!isOpen) {
      setIsGenerating(false);
      setShareMode('feed');
    }
  }, [isOpen]);

  if (!isOpen || !verse) return null;

  const mobileShareText = buildMobileShareText(verse);
  const desktopShareText = buildDesktopShareText(verse);
  const gradient = gradients[DEFAULT_GRADIENT_INDEX];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Share className="text-teal-600" size={22} />
          <h3 className="text-lg font-bold text-gray-800">Compartilhar Versículo</h3>
        </div>

        {/* Toggle: Feed vs Stories */}
        <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setShareMode('feed')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              shareMode === 'feed'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle size={18} />
            <span>Feed / Chat</span>
          </button>
          <button
            onClick={() => setShareMode('story')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
              shareMode === 'story'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Instagram size={18} />
            <span>Stories</span>
          </button>
        </div>

        {/* Card Preview */}
        <div className="mb-4 relative">
          {shareMode === 'feed' ? (
            <VerseImageCard verse={verse} gradient={gradient} fontStyle={DEFAULT_FONT_STYLE} />
          ) : (
            <div className="flex justify-center">
              <div className="w-48">
                <VerseStoryCard verse={verse} gradient={gradient} fontStyle={DEFAULT_FONT_STYLE} />
              </div>
            </div>
          )}
          {isGenerating && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
              <RefreshCw className="animate-spin text-teal-600" size={28} />
            </div>
          )}
        </div>

        {/* Conteúdo baseado no modo */}
        {shareMode === 'feed' ? (
          <>
            {/* Instruções para Feed/Chat */}
            <div className="mb-5 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-4">
              <p className="text-center text-gray-700 text-sm leading-relaxed">
                <span className="font-semibold text-teal-700">Clique em Copiar</span> e depois em <span className="font-semibold text-green-700">Compartilhar</span>.<br />
                <span className="text-gray-500">Escolha a plataforma, cole o texto e compartilhe.</span>
              </p>
            </div>

            {/* Botões de ação para Feed */}
            <ShareButtons
              shareText={mobileShareText}
              fallbackText={desktopShareText}
              verseName={verse.reference.replace(/\s/g, '-')}
              verseReference={verse.reference}
              verseBook={verse.reference.split(' ')[0]}
              getShareFile={getShareFile}
            />

            {/* Dica extra para mobile */}
            {isMobile && (
              <p className="text-xs text-gray-400 text-center mt-3">
                O texto já estará copiado quando você compartilhar
              </p>
            )}
          </>
        ) : (
          <>
            {/* Instruções para Stories */}
            <div className="mb-5 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 rounded-xl p-4">
              <p className="text-center text-gray-700 text-sm leading-relaxed">
                <span className="font-semibold text-pink-600">Formato vertical 9:16</span> otimizado para<br />
                <span className="text-gray-600">Instagram Stories e WhatsApp Status</span>
              </p>
            </div>

            {/* Botão de compartilhar Stories */}
            <button
              onClick={handleShareStory}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw size={22} className="animate-spin" />
              ) : (
                <Instagram size={22} />
              )}
              <span>{isGenerating ? 'Gerando...' : 'COMPARTILHAR NOS STORIES'}</span>
            </button>

            {/* Dica para Stories */}
            <p className="text-xs text-gray-400 text-center mt-3">
              Funciona com Instagram Stories e WhatsApp Status
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareVerseModal;
