import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Menu,
  X,
  Home,
  Crown,
  LogIn,
  LogOut,
  ChevronDown,
  BookOpen,
  Heart,
  MessageCircle,
  Clock,
  Share2,
  Flame,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useOffline } from '@/contexts/OfflineContext';
import { useGamification } from '@/contexts/GamificationContext';
import SyncIndicator from './SyncIndicator';
import AdBanner from './AdBanner';

interface NavigationProps {
  onNavigate: (section: string) => void;
  currentSection: string;
  isPremium?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  onNavigate,
  currentSection,
  isPremium = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, profile, signOut, isTrial, trialDaysRemaining } = useAuth();
  const { favorites, syncStatus, lastSyncedAt, syncError, retrySync } = useFavorites();
  const { isOnline, pendingCount } = useOffline(); // kept for future usage (and side effects)

  // Safely try to use gamification context
  let gamificationStats = {
    totalShares: 0,
    currentStreak: 0,
    unlockedBadges: [] as any[],
  };
  try {
    const gamification = useGamification();
    gamificationStats = gamification.stats;
  } catch {
    // Gamification context not available
  }

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuário';
  };

  const getUserAvatar = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    if (user?.user_metadata?.picture) return user.user_metadata.picture;
    return null;
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-cyan-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                A Palavra
              </span>
            </button>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className={`${
                  currentSection === 'home' ? 'text-cyan-600 font-semibold' : 'text-gray-600'
                } hover:text-cyan-600 transition-colors flex items-center gap-1 px-3 py-2`}
              >
                <Home className="w-4 h-4" />
                Início
              </button>

              <button
                onClick={() => onNavigate('browse')}
                className={`${
                  currentSection === 'browse' ? 'text-cyan-600 font-semibold' : 'text-gray-600'
                } hover:text-cyan-600 transition-colors flex items-center gap-1 px-3 py-2`}
              >
                <Compass className="w-4 h-4" />
                Explorar
              </button>

              <button
                onClick={() => onNavigate('favorites')}
                className={`${
                  currentSection === 'favorites'
                    ? 'text-rose-600 font-semibold'
                    : 'text-gray-600'
                } hover:text-rose-600 transition-colors flex items-center gap-1 px-3 py-2 relative`}
              >
                <Heart className="w-4 h-4" fill={currentSection === 'favorites' ? 'currentColor' : 'none'} />
                Favoritos
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {favorites.length > 99 ? '99+' : favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate('journal')}
                className={`${
                  currentSection === 'journal' ? 'text-cyan-600 font-semibold' : 'text-gray-600'
                } hover:text-cyan-600 transition-colors flex items-center gap-1 px-3 py-2`}
              >
                <BookOpen className="w-4 h-4" />
                Diário
                {isPremium && !isTrial && (
                  <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                    Premium
                  </span>
                )}
                {isTrial && (
                  <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Teste
                  </span>
                )}
              </button>

              <button
                onClick={() => onNavigate('shares')}
                className={`${
                  currentSection === 'shares' ? 'text-cyan-600 font-semibold' : 'text-gray-600'
                } hover:text-cyan-600 transition-colors flex items-center gap-1 px-3 py-2 relative`}
              >
                <Share2 className="w-4 h-4" />
                Impacto
                {gamificationStats.totalShares > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">
                    {gamificationStats.totalShares}
                  </span>
                )}
                {gamificationStats.currentStreak > 0 && (
                  <span className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                    <Flame className="w-3 h-3" />
                    {gamificationStats.currentStreak}
                  </span>
                )}
              </button>

              <Link
                to="/contato"
                className="text-gray-600 hover:text-cyan-600 transition-colors flex items-center gap-1 px-3 py-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contato
              </Link>

              {isTrial && trialDaysRemaining !== null && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  <span>{trialDaysRemaining}d restantes</span>
                </div>
              )}

              {!isPremium && !isTrial && (
                <button
                  onClick={() => onNavigate('subscription')}
                  className="bg-gradient-to-r from-cyan-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Crown className="w-4 h-4" />
                  Seja Premium
                </button>
              )}

              {/* Sync Indicator - only show when logged in */}
              {user && (
                <SyncIndicator
                  status={syncStatus}
                  lastSyncedAt={lastSyncedAt}
                  errorMessage={syncError || undefined}
                  onRetry={retrySync}
                  showPendingCount={true}
                />
              )}

              {/* Auth Section */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {getUserAvatar() ? (
                      <img
                        src={getUserAvatar()!}
                        alt={getUserDisplayName()}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-gray-700 font-medium hidden lg:block max-w-[120px] truncate">
                      {getUserDisplayName()}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {isPremium && !isTrial && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs font-medium rounded-full">
                                <Crown className="w-3 h-3" />
                                Premium
                              </span>
                            )}
                            {isTrial && trialDaysRemaining !== null && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                <Clock className="w-3 h-3" />
                                Teste ({trialDaysRemaining}d)
                              </span>
                            )}
                            <SyncIndicator
                              status={syncStatus}
                              lastSyncedAt={lastSyncedAt}
                              errorMessage={syncError || undefined}
                              onRetry={retrySync}
                            />
                          </div>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => {
                              onNavigate('favorites');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <Heart className="w-4 h-4" />
                            Meus Favoritos
                            {favorites.length > 0 && (
                              <span className="ml-auto px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full">
                                {favorites.length}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              onNavigate('shares');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <Share2 className="w-4 h-4" />
                            Meu Impacto
                            {gamificationStats.totalShares > 0 && (
                              <span className="ml-auto px-2 py-0.5 bg-cyan-100 text-cyan-600 text-xs rounded-full">
                                {gamificationStats.totalShares}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              onNavigate('journal');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <BookOpen className="w-4 h-4" />
                            Meu Diário
                          </button>

                          <button
                            onClick={() => {
                              onNavigate('subscription');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <Crown className="w-4 h-4" />
                            {isPremium ? 'Minha Assinatura' : 'Seja Premium'}
                          </button>

                          <Link
                            to="/contato"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Contato
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-full hover:opacity-90 transition-opacity font-medium shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  Acessar
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <SyncIndicator
                  status={syncStatus}
                  lastSyncedAt={lastSyncedAt}
                  errorMessage={syncError || undefined}
                  onRetry={retrySync}
                  className="scale-90"
                />
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-cyan-100">
              <div className="flex flex-col space-y-2">
                {user && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    {getUserAvatar() ? (
                      <img
                        src={getUserAvatar()!}
                        alt={getUserDisplayName()}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {getUserDisplayName().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    {isPremium && !isTrial && (
                      <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                    {isTrial && trialDaysRemaining !== null && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Teste ({trialDaysRemaining}d)
                      </span>
                    )}
                  </div>
                )}

                {isTrial && trialDaysRemaining !== null && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 rounded-lg mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-800">Período de Teste</p>
                      <p className="text-xs text-purple-600">
                        {trialDaysRemaining}{' '}
                        {trialDaysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    onNavigate('home');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                    currentSection === 'home'
                      ? 'bg-cyan-50 text-cyan-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  Início
                </button>

                <button
                  onClick={() => {
                    onNavigate('browse');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                    currentSection === 'browse'
                      ? 'bg-cyan-50 text-cyan-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  Explorar
                </button>

                <button
                  onClick={() => {
                    onNavigate('favorites');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                    currentSection === 'favorites'
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-5 h-5" fill={currentSection === 'favorites' ? 'currentColor' : 'none'} />
                  Meus Favoritos
                  {favorites.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full font-medium">
                      {favorites.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    onNavigate('shares');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                    currentSection === 'shares'
                      ? 'bg-cyan-50 text-cyan-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Share2 className="w-5 h-5" />
                  Meu Impacto
                  <div className="ml-auto flex items-center gap-1">
                    {gamificationStats.totalShares > 0 && (
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-600 text-xs rounded-full font-medium">
                        {gamificationStats.totalShares}
                      </span>
                    )}
                    {gamificationStats.currentStreak > 0 && (
                      <span className="flex items-center gap-0.5 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                        <Flame className="w-3 h-3" />
                        {gamificationStats.currentStreak}
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => {
                    onNavigate('journal');
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                    currentSection === 'journal'
                      ? 'bg-cyan-50 text-cyan-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  Diário de Reflexões
                  {isPremium && !isTrial && (
                    <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                      Premium
                    </span>
                  )}
                  {isTrial && (
                    <span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Teste
                    </span>
                  )}
                </button>

                <Link
                  to="/contato"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contato
                </Link>

                <button
                  onClick={() => {
                    onNavigate('subscription');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-amber-500 text-white"
                >
                  <Crown className="w-5 h-5" />
                  {isPremium ? 'Minha Assinatura' : isTrial ? 'Assinar Premium' : 'Seja Premium'}
                </button>

                {user ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair da conta
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    Acessar
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ✅ Banner GLOBAL: aparece em todas as telas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
        <AdBanner variant="top" />
      </div>
    </>
  );
};

export default Navigation;
