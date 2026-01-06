import React, { useState } from 'react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Trash2, Search, Filter, BookOpen, Sparkles, Cloud, WifiOff, RefreshCw, Share2 } from 'lucide-react';
import ShareVerseModal from './ShareVerseModal';
import SyncStatusBar from './SyncStatusBar';
import { Button } from '@/components/ui/button';
import { Verse } from '@/data/verses';
import { Link } from 'react-router-dom';

const emotionLabels: Record<string, string> = {
  paz: 'Paz',
  ansiedade: 'Ansiedade',
  gratidao: 'Gratidão',
  tristeza: 'Tristeza',
  alegria: 'Alegria',
  medo: 'Medo',
  esperanca: 'Esperança',
  amor: 'Amor',
  forca: 'Força',
  proposito: 'Propósito',
};

const emotionColors: Record<string, string> = {
  paz: 'from-cyan-500 to-blue-500',
  ansiedade: 'from-purple-500 to-indigo-500',
  gratidao: 'from-amber-500 to-orange-500',
  tristeza: 'from-slate-500 to-gray-500',
  alegria: 'from-yellow-500 to-amber-500',
  medo: 'from-red-500 to-rose-500',
  esperanca: 'from-emerald-500 to-teal-500',
  amor: 'from-pink-500 to-rose-500',
  forca: 'from-orange-500 to-red-500',
  proposito: 'from-violet-500 to-purple-500',
};

interface FavoriteVerse extends Verse {
  savedAt?: string;
  syncedAt?: string;
  localOnly?: boolean;
}

const FavoritesSection: React.FC = () => {
  const { favorites, loading, removeFavorite, syncStatus, lastSyncedAt, syncError, retrySync, syncFavorites } = useFavorites();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('all');
  const [shareVerse, setShareVerse] = useState<Verse | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get unique emotions from favorites
  const uniqueEmotions = [...new Set(favorites.map(f => f.emotion))];

  // Filter favorites
  const filteredFavorites = favorites.filter(verse => {
    const matchesSearch = 
      verse.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verse.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = selectedEmotion === 'all' || verse.emotion === selectedEmotion;
    return matchesSearch && matchesEmotion;
  });

  // Count local-only favorites
  const localOnlyCount = (favorites as FavoriteVerse[]).filter(f => f.localOnly).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-500 text-sm">Carregando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg">
          <Heart className="w-8 h-8 text-white" fill="white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Favoritos</h1>
        <p className="text-gray-600">
          {favorites.length === 0 
            ? 'Você ainda não salvou nenhum versículo' 
            : `${favorites.length} versículo${favorites.length > 1 ? 's' : ''} salvo${favorites.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Sync Status Bar */}
      {user && (
        <div className="mb-6">
          <SyncStatusBar
            reflectionsSyncStatus="synced"
            reflectionsLastSynced={null}
            reflectionsPendingCount={0}
            onSyncReflections={async () => {}}
          />
        </div>
      )}

      {/* Local-only warning */}
      {user && localOnlyCount > 0 && syncStatus !== 'syncing' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            {!isOnline ? (
              <WifiOff className="w-5 h-5 text-amber-600 mt-0.5" />
            ) : (
              <Cloud className="w-5 h-5 text-amber-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-amber-800 text-sm font-medium">
                {localOnlyCount} versículo{localOnlyCount > 1 ? 's' : ''} aguardando sincronização
              </p>
              <p className="text-amber-700 text-xs mt-1">
                {!isOnline 
                  ? 'Você está offline. Os favoritos serão sincronizados automaticamente quando a conexão for restaurada.'
                  : 'Os favoritos serão sincronizados automaticamente em breve.'}
              </p>
            </div>
            {isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncFavorites}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Sincronizar
              </Button>
            )}
          </div>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum favorito ainda</h3>
          <p className="text-gray-600 mb-6">
            Explore versículos e clique no coração para salvá-los aqui.
          </p>
          {!user && (
            <div className="bg-cyan-50 rounded-xl p-4 mb-6">
              <p className="text-cyan-800 text-sm">
                <Sparkles className="w-4 h-4 inline mr-1" />
                <Link to="/login" className="font-semibold underline">Faça login</Link> para sincronizar seus favoritos entre dispositivos.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search and Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar nos favoritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all"
                />
              </div>

              {/* Filter by emotion */}
              {uniqueEmotions.length > 1 && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedEmotion}
                    onChange={(e) => setSelectedEmotion(e.target.value)}
                    className="pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none transition-all appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">Todos os temas</option>
                    {uniqueEmotions.map(emotion => (
                      <option key={emotion} value={emotion}>
                        {emotionLabels[emotion] || emotion}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Login reminder for non-authenticated users */}
          {!user && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 mb-6 border border-cyan-100">
              <p className="text-cyan-800 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>
                  <Link to="/login" className="font-semibold underline">Faça login</Link> para sincronizar seus favoritos entre dispositivos e nunca perdê-los.
                </span>
              </p>
            </div>
          )}

          {/* Favorites List */}
          {filteredFavorites.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum versículo encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFavorites.map((verse) => {
                const favoriteVerse = verse as FavoriteVerse;
                return (
                  <div
                    key={verse.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Emotion badge */}
                    <div className={`h-1 bg-gradient-to-r ${emotionColors[verse.emotion] || 'from-gray-400 to-gray-500'}`} />
                    
                    <div className="p-6">
                      {/* Emotion label and sync status */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${emotionColors[verse.emotion] || 'from-gray-400 to-gray-500'} text-white`}>
                            <BookOpen className="w-3 h-3" />
                            {emotionLabels[verse.emotion] || verse.emotion}
                          </span>
                          {favoriteVerse.localOnly && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <Cloud className="w-3 h-3" />
                              Local
                            </span>
                          )}
                        </div>
                        {favoriteVerse.savedAt && (
                          <span className="text-xs text-gray-400">
                            Salvo em {new Date(favoriteVerse.savedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>

                      {/* Verse text */}
                      <p className="text-gray-800 text-lg leading-relaxed font-serif italic mb-3">
                        "{verse.text}"
                      </p>
                      
                      {/* Reference */}
                      <p className="text-cyan-600 font-semibold mb-4">— {verse.reference}</p>

                      {/* Actions - Simplified */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 flex-wrap">
                        {/* Botão principal de compartilhar */}
                        <button
                          onClick={() => setShareVerse(verse)}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="font-medium">Compartilhar</span>
                        </button>
                        
                        {/* Remover */}
                        <button
                          onClick={() => removeFavorite(verse.id)}
                          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all text-sm font-medium group"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Remover</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Share Modal */}
      {shareVerse && (
        <ShareVerseModal
          verse={shareVerse}
          isOpen={true}
          onClose={() => setShareVerse(null)}
        />
      )}
    </div>
  );
};

export default FavoritesSection;
