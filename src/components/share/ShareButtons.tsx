import React, { useCallback, useState } from 'react';
import { Copy, Share2, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  shareText: string;      // texto curto (mobile)
  fallbackText: string;   // texto completo (desktop)
  verseName: string;
  verseReference: string;
  verseBook?: string;
  getShareFile: () => Promise<File | null>;
}

const isMobileDevice = () =>
  typeof navigator !== 'undefined'
  && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const canShareFiles = (file: File) => {
  try {
    return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
  } catch {
    return false;
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

const openWhatsApp = (text: string) => {
  const encoded = encodeURIComponent(text);
  window.open(
    isMobileDevice()
      ? `whatsapp://send?text=${encoded}`
      : `https://web.whatsapp.com/send?text=${encoded}`,
    '_blank',
  );
};

const downloadFile = (file: File, name: string) => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Ícone do WhatsApp em SVG
const WhatsAppIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-8 h-8 text-green-500 flex-shrink-0"
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Toast customizado com instruções visuais para WhatsApp
const WhatsAppInstructionToast = () => (
  <div className="flex items-start gap-3 p-1">
    <WhatsAppIcon />
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold text-gray-900 text-sm">Agora no WhatsApp:</p>
      <div className="flex flex-col gap-1 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs font-bold">1</span>
          <span>Escolha o contato</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs font-bold">2</span>
          <span>Cole o texto <span className="text-gray-500">(segure e cole)</span></span>
        </div>
      </div>
    </div>
  </div>
);

// Toast para quando o card é baixado (fallback)
const DownloadInstructionToast = () => (
  <div className="flex items-start gap-3 p-1">
    <WhatsAppIcon />
    <div className="flex flex-col gap-1.5">
      <p className="font-semibold text-gray-900 text-sm">Card salvo! No WhatsApp:</p>
      <div className="flex flex-col gap-1 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs font-bold">1</span>
          <span>Anexe a imagem salva</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 bg-green-100 text-green-700 rounded-full text-xs font-bold">2</span>
          <span>Cole o texto <span className="text-gray-500">(segure e cole)</span></span>
        </div>
      </div>
    </div>
  </div>
);

const ShareButtons: React.FC<ShareButtonsProps> = ({
  shareText,
  fallbackText,
  verseName,
  getShareFile,
}) => {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const isMobile = isMobileDevice();
  const fileName = `versiculo-${verseName}.jpg`;

  // Texto que será copiado
  const textToCopy = isMobile ? shareText : fallbackText;

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(textToCopy);
    if (success) {
      setCopied(true);
      toast.success('Texto copiado! Agora clique em Compartilhar.');
      setTimeout(() => setCopied(false), 3000);
    } else {
      toast.error('Não foi possível copiar.');
    }
  }, [textToCopy]);

  const handleShare = useCallback(async () => {
    setLoading(true);
    try {
      // SEMPRE copia o texto para o clipboard primeiro (garantia)
      await copyToClipboard(textToCopy);

      // Desktop: abre WhatsApp Web com texto
      if (!isMobile) {
        openWhatsApp(fallbackText);
        return;
      }

      // Mobile: gera e compartilha APENAS a imagem
      const file = await getShareFile();
      if (!file) {
        toast.error('Erro ao gerar o card.');
        return;
      }

      if (canShareFiles(file)) {
        // Compartilha APENAS a imagem (sem texto)
        await navigator.share({ files: [file] });
        
        // Toast visual com instruções passo-a-passo
        toast.custom(() => <WhatsAppInstructionToast />, {
          duration: 6000,
          position: 'bottom-center',
        });
        return;
      }

      // Fallback: baixa a imagem
      downloadFile(file, fileName);
      
      // Toast visual para download
      toast.custom(() => <DownloadInstructionToast />, {
        duration: 6000,
        position: 'bottom-center',
      });
    } catch (error) {
      // Usuário cancelou o share sheet - não é erro
      if ((error as Error)?.name === 'AbortError') {
        return;
      }
      toast.error('Erro ao compartilhar.');
    } finally {
      setLoading(false);
    }
  }, [getShareFile, textToCopy, fallbackText, isMobile, fileName]);

  return (
    <div className="flex gap-3">
      {/* COPIAR - Primeiro botão */}
      <button
        onClick={handleCopy}
        disabled={loading}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold transition-all ${
          copied 
            ? 'bg-green-100 text-green-700 border-2 border-green-500' 
            : 'bg-teal-600 hover:bg-teal-700 text-white'
        }`}
      >
        {copied ? <Check size={20} /> : <Copy size={20} />}
        <span>{copied ? 'COPIADO!' : 'COPIAR'}</span>
      </button>

      {/* COMPARTILHAR - Segundo botão */}
      <button
        onClick={handleShare}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3.5 rounded-xl font-semibold transition-all"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
        <span>{loading ? 'Preparando...' : 'COMPARTILHAR'}</span>
      </button>
    </div>
  );
};

export default ShareButtons;
