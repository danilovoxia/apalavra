import React, { useState, useEffect } from 'react';
import { verses, Verse } from '@/data/verses';
import { getReflectionForVerse } from '@/data/reflections';
import { Bell, BellOff, Calendar, Heart, Lightbulb, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import ShareVerseModal from './ShareVerseModal';
import { useFavorites } from '@/contexts/FavoritesContext';

// Função para obter um versículo baseado na data (mesmo versículo durante todo o dia)
const getDailyVerse = (): Verse => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Usa o dia do ano como seed para selecionar o versículo
  const verseIndex = dayOfYear % verses.length;
  return verses[verseIndex];
};

// Formata a data atual em português
const formatDate = (): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric',
    month: 'long'
  };
  return new Date().toLocaleDateString('pt-BR', options);
};

const DailyVerse: React.FC = () => {
  const [dailyVerse, setDailyVerse] = useState<Verse | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setDailyVerse(getDailyVerse());
    
    // Verifica o status das notificações
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      const savedNotificationPref = localStorage.getItem('dailyVerseNotifications');
      if (savedNotificationPref === 'enabled' && Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações push.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('dailyVerseNotifications', 'enabled');
        
        // Mostra uma notificação de confirmação
        new Notification('Versículo do Dia', {
          body: 'Você receberá o versículo do dia todas as manhãs!',
          icon: '/favicon.ico',
        });

        // Envia mensagem para o Service Worker agendar notificações
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SCHEDULE_DAILY_VERSE',
            verse: getDailyVerse()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('dailyVerseNotifications', 'disabled');
    } else {
      if (notificationPermission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('dailyVerseNotifications', 'enabled');
        
        // Envia mensagem para o Service Worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SCHEDULE_DAILY_VERSE',
            verse: getDailyVerse()
          });
        }
      } else {
        await requestNotificationPermission();
      }
    }
  };

  const handleSave = async () => {
    if (dailyVerse) {
      setIsAnimating(true);
      await toggleFavorite(dailyVerse);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const isSaved = dailyVerse ? isFavorite(dailyVerse.id) : false;
  const reflection = dailyVerse ? getReflectionForVerse(dailyVerse.emotion, dailyVerse.id) : '';

  if (!dailyVerse) return null;

  return (
    <>
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-cyan-100 shadow-sm">
        <div className="p-5 sm:p-6">
          {/* Header compacto */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-700">Versículo do Dia</span>
              <span className="text-xs text-cyan-500 hidden sm:inline">• {formatDate()}</span>
            </div>
            
            {/* Botão de notificação */}
            <button
              onClick={toggleNotifications}
              className={`p-2 rounded-lg transition-all duration-200 ${
                notificationsEnabled 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
              }`}
              title={notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações diárias'}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Versículo */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed text-base italic">
              "{dailyVerse.text}"
            </p>
            <p className="text-cyan-600 font-medium text-sm mt-2">
              — {dailyVerse.reference}
            </p>
          </div>

          {/* Reflexão expansível */}
          <button
            onClick={() => setShowReflection(!showReflection)}
            className="w-full flex items-center gap-2 text-left text-sm text-cyan-600 hover:text-cyan-700 transition-colors mb-3"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="font-medium">Reflexão</span>
            {showReflection ? (
              <ChevronUp className="w-4 h-4 ml-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-auto" />
            )}
          </button>
          
          {showReflection && (
            <div className="mb-4 p-4 bg-cyan-50/50 rounded-xl border border-cyan-100">
              <p className="text-gray-600 text-sm leading-relaxed">
                {reflection}
              </p>
            </div>
          )}

          {/* Ações simplificadas */}
          <div className="flex items-center gap-2 pt-2 border-t border-cyan-100 flex-wrap">
            {/* Botão principal de compartilhar */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Compartilhar</span>
            </button>
            
            {/* Salvar */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all ${
                isSaved
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50'
              } ${isAnimating ? 'scale-95' : ''}`}
            >
              <Heart className={`w-4 h-4 transition-all ${isSaved ? 'fill-current' : ''} ${isAnimating ? 'scale-125' : ''}`} />
              <span>{isSaved ? 'Salvo' : 'Salvar'}</span>
            </button>

            {notificationsEnabled && (
              <span className="ml-auto text-xs text-cyan-500 hidden sm:flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Notificações ativas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de compartilhamento */}
      <ShareVerseModal
        verse={dailyVerse}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  );
};

export default DailyVerse;
