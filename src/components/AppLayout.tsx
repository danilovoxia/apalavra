import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import MoodSelectorScreen from './MoodSelectorScreen';
import PersonalizedVerseScreen from './PersonalizedVerseScreen';
import SoftPaywall from './SoftPaywall';
import SubscriptionPlans from './SubscriptionPlans';
import Footer from './Footer';
import BrowseSection from './browse/BrowseSection';
import ReflectionJournal from './ReflectionJournal';
import FavoritesSection from './FavoritesSection';
import PremiumDashboard from './PremiumDashboard';
import UserSharesSection from './gamification/UserSharesSection';
import { verses, Verse } from '@/data/verses';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { toast } from 'sonner';

const FREE_GENERATIONS_PER_DAY = 3;

const AppLayout: React.FC = () => {
  const { user, loading, isPremium, isTrial, upgradeToPremium } = useAuth();
  const { isFavorite } = useFavorites();

  const [currentSection, setCurrentSection] = useState('home');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [dailyGenerations, setDailyGenerations] = useState(0);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const getRandomVerse = (emotion: string): Verse => {
    const emotionVerses = verses.filter((v) => v.emotion === emotion);
    return emotionVerses[Math.floor(Math.random() * emotionVerses.length)];
  };

  // Carrega gerações do dia (limite Free)
  useEffect(() => {
    const storedGen = localStorage.getItem('dailyGenerations');
    if (storedGen) {
      const { date, count } = JSON.parse(storedGen);
      if (date === getTodayString()) setDailyGenerations(count);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'dailyGenerations',
      JSON.stringify({ date: getTodayString(), count: dailyGenerations })
    );
  }, [dailyGenerations]);

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    setCurrentVerse(getRandomVerse(mood));
    setDailyGenerations((prev) => prev + 1);
    setShowMoodSelector(false);
  };

  const handleGenerateNew = () => {
    if (selectedMood) {
      setCurrentVerse(getRandomVerse(selectedMood));
      setDailyGenerations((prev) => prev + 1);
    }
  };

  const handleBackToMoods = () => {
    setSelectedMood(null);
    setCurrentVerse(null);
  };

  const handleSubscribe = async () => {
    if (user) {
      await upgradeToPremium('annual');
      toast.success('Parabéns! Você agora é Premium!', {
        description: 'Aproveite todos os recursos ilimitados.',
      });
    } else {
      // não logado: upgradeToPremium já grava localStorage dentro do AuthContext
      await upgradeToPremium('annual');
      toast.success('Parabéns! Você agora é Premium!', {
        description: 'Crie uma conta para sincronizar entre dispositivos.',
      });
    }
    setShowPaywall(false);
  };

  const handlePremiumSelectMood = () => {
    const preSelectedEmotion = localStorage.getItem('selectedEmotion');
    if (preSelectedEmotion) {
      localStorage.removeItem('selectedEmotion');
      handleSelectMood(preSelectedEmotion);
      return;
    }
    setShowMoodSelector(true);
  };

  // ✅ Gate: enquanto auth carrega, NÃO decide Premium vs Free
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-cyan-200 border-t-cyan-600 animate-spin" />
          <p className="text-gray-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  const canGenerateNew = isPremium || isTrial || dailyGenerations < FREE_GENERATIONS_PER_DAY;
  const generationsLeft = Math.max(0, FREE_GENERATIONS_PER_DAY - dailyGenerations);

  // ✅ Premium: só entra aqui quando isPremium === true (trial NÃO entra)
  if (currentSection === 'home' && isPremium) {
    // Mood selector dentro do fluxo premium
    if (showMoodSelector && !selectedMood) {
      return (
        <>
          <Navigation
            onNavigate={setCurrentSection}
            currentSection={currentSection}
            isPremium={isPremium}
          />
          <MoodSelectorScreen
            onSelectMood={handleSelectMood}
            currentPlan="premium"
            onUpgrade={handleSubscribe}
            isPremiumUser
          />
          <Footer />
        </>
      );
    }

    // Tela do versículo no premium
    if (selectedMood && currentVerse) {
      return (
        <>
          <PersonalizedVerseScreen
            verse={currentVerse}
            mood={selectedMood}
            onBack={() => {
              handleBackToMoods();
              setShowMoodSelector(false);
            }}
            onGenerateNew={handleGenerateNew}
            isSaved={isFavorite(currentVerse.id)}
            canGenerateNew
            generationsLeft={999}
            onShowPaywall={() => {}}
          />
        </>
      );
    }

    // Dashboard premium
    return (
      <>
        <Navigation
          onNavigate={setCurrentSection}
          currentSection={currentSection}
          isPremium={isPremium}
        />
        <PremiumDashboard onNavigate={setCurrentSection} onSelectMood={handlePremiumSelectMood} />
        <Footer />
      </>
    );
  }

  // ✅ Home Free (inclui Trial como "Free com acesso liberado", sem dashboard premium)
  if (currentSection === 'home') {
    if (!selectedMood || !currentVerse) {
      return (
        <>
          <Navigation
            onNavigate={setCurrentSection}
            currentSection={currentSection}
            isPremium={isPremium}
          />
          <MoodSelectorScreen
            onSelectMood={handleSelectMood}
            currentPlan={isTrial ? 'trial' : 'free'}
            onUpgrade={handleSubscribe}
            isPremiumUser={false}
          />
          <Footer />

          {showPaywall && !isTrial && (
            <SoftPaywall onClose={() => setShowPaywall(false)} onSubscribe={handleSubscribe} />
          )}
        </>
      );
    }

    return (
      <>
        <PersonalizedVerseScreen
          verse={currentVerse}
          mood={selectedMood}
          onBack={handleBackToMoods}
          onGenerateNew={handleGenerateNew}
          isSaved={isFavorite(currentVerse.id)}
          canGenerateNew={canGenerateNew}
          generationsLeft={isTrial ? 999 : generationsLeft}
          onShowPaywall={() => {
            if (!isTrial) setShowPaywall(true);
          }}
        />

        {showPaywall && !isTrial && (
          <SoftPaywall onClose={() => setShowPaywall(false)} onSubscribe={handleSubscribe} />
        )}
      </>
    );
  }

  // Outras seções
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onNavigate={setCurrentSection}
        currentSection={currentSection}
        isPremium={isPremium}
      />

      {currentSection === 'browse' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BrowseSection />
        </div>
      )}

      {currentSection === 'favorites' && <FavoritesSection />}

      {currentSection === 'journal' && (
        <ReflectionJournal onUpgrade={() => setCurrentSection('subscription')} />
      )}

      {currentSection === 'shares' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserSharesSection />
        </div>
      )}

      {currentSection === 'subscription' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isPremium ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Assinatura Premium</h3>
              <p className="text-gray-600">Seu Premium está ativo.</p>
            </div>
          ) : (
            <SubscriptionPlans currentPlan={isTrial ? 'trial' : 'free'} onUpgrade={handleSubscribe} />
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AppLayout;
