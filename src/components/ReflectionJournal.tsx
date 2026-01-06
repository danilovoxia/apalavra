import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReflections, Reflection } from '@/contexts/ReflectionsContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Lock, 
  Cloud, 
  CloudOff,
  RefreshCw,
  Check
} from 'lucide-react';
import { verses, Verse } from '@/data/verses';
import SyncStatusBar from './SyncStatusBar';

interface ReflectionJournalProps {
  onUpgrade?: () => void;
}

const ReflectionJournal: React.FC<ReflectionJournalProps> = ({ onUpgrade }) => {
  const { user, isPremium } = useAuth();
  const { 
    reflections, 
    loading, 
    syncStatus, 
    lastSyncedAt, 
    pendingCount,
    addReflection, 
    updateReflection, 
    deleteReflection,
    syncReflections 
  } = useReflections();
  
  const [showEditor, setShowEditor] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [content, setContent] = useState('');
  const [showVerseSelector, setShowVerseSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const itemsPerPage = 6;

  const moods = [
    { id: 'paz', label: 'Paz', emoji: '🕊️', color: 'bg-blue-100 text-blue-700' },
    { id: 'gratidao', label: 'Gratidão', emoji: '🙏', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'esperanca', label: 'Esperança', emoji: '✨', color: 'bg-purple-100 text-purple-700' },
    { id: 'alegria', label: 'Alegria', emoji: '😊', color: 'bg-green-100 text-green-700' },
    { id: 'reflexao', label: 'Reflexão', emoji: '💭', color: 'bg-gray-100 text-gray-700' },
    { id: 'forca', label: 'Força', emoji: '💪', color: 'bg-orange-100 text-orange-700' },
  ];

  const handleSaveReflection = async () => {
    if (!content.trim()) {
      toast.error('Por favor, escreva sua reflexão');
      return;
    }

    if (editingReflection) {
      await updateReflection(editingReflection.id, {
        content,
        verse_id: selectedVerse?.id || editingReflection.verse_id,
        verse_text: selectedVerse?.text || editingReflection.verse_text,
        verse_reference: selectedVerse?.reference || editingReflection.verse_reference,
        mood: selectedMood || editingReflection.mood,
      });
      toast.success('Reflexão atualizada com sucesso!');
    } else {
      await addReflection({
        verse_id: selectedVerse?.id || '',
        verse_text: selectedVerse?.text || '',
        verse_reference: selectedVerse?.reference || '',
        content,
        mood: selectedMood,
      });
      toast.success('Reflexão salva com sucesso!');
    }

    resetEditor();
  };

  const handleDeleteReflection = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta reflexão?')) return;
    await deleteReflection(id);
    toast.success('Reflexão excluída');
  };

  const handleEditReflection = (reflection: Reflection) => {
    setEditingReflection(reflection);
    setContent(reflection.content);
    setSelectedMood(reflection.mood || '');
    if (reflection.verse_id) {
      const verse = verses.find(v => v.id === reflection.verse_id);
      setSelectedVerse(verse || null);
    }
    setShowEditor(true);
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingReflection(null);
    setContent('');
    setSelectedVerse(null);
    setSelectedMood('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredReflections = reflections.filter(r => 
    r.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.verse_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.verse_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReflections.length / itemsPerPage);
  const paginatedReflections = filteredReflections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Show upgrade prompt for non-premium users
  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Diário de Reflexões Premium
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              O Diário de Reflexões é um recurso exclusivo para assinantes Premium. 
              Registre suas meditações diárias, associe versículos e acompanhe sua 
              jornada espiritual.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Reflexões ilimitadas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Histórico completo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Sincronização na nuvem</span>
              </div>
            </div>
            <Button 
              onClick={onUpgrade}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg"
            >
              Desbloquear por R$ 60/ano
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-600" />
            Diário de Reflexões
          </h1>
          <p className="text-gray-600 mt-1">
            Registre suas meditações e reflexões sobre os versículos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowEditor(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Reflexão
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-6">
        <SyncStatusBar
          reflectionsSyncStatus={syncStatus}
          reflectionsLastSynced={lastSyncedAt}
          reflectionsPendingCount={pendingCount}
          onSyncReflections={syncReflections}
        />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar reflexões..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{reflections.length}</div>
            <div className="text-sm text-blue-600">Total de Reflexões</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-700">
              {reflections.filter(r => {
                const today = new Date().toDateString();
                return new Date(r.created_at).toDateString() === today;
              }).length}
            </div>
            <div className="text-sm text-green-600">Hoje</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">
              {reflections.filter(r => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(r.created_at) >= weekAgo;
              }).length}
            </div>
            <div className="text-sm text-purple-600">Esta Semana</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-700">
              {new Set(reflections.map(r => r.verse_reference)).size}
            </div>
            <div className="text-sm text-amber-600">Versículos</div>
          </CardContent>
        </Card>
      </div>

      {/* Reflections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedReflections.length === 0 ? (
        <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'Nenhuma reflexão encontrada' : 'Comece seu diário'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente buscar por outros termos' 
                : 'Registre sua primeira reflexão sobre um versículo bíblico'}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowEditor(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeira Reflexão
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReflections.map(reflection => {
              const mood = moods.find(m => m.id === reflection.mood);
              return (
                <Card 
                  key={reflection.id} 
                  className={`group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-amber-300 ${
                    reflection.localOnly ? 'border-l-4 border-l-amber-400' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatDate(reflection.created_at)}
                        {reflection.localOnly && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <CloudOff className="w-3 h-3" />
                            <span className="text-xs">Local</span>
                          </span>
                        )}
                      </div>
                      {mood && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${mood.color}`}>
                          {mood.emoji} {mood.label}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {reflection.verse_reference && (
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mb-4">
                        <p className="text-sm text-gray-700 italic line-clamp-2">
                          "{reflection.verse_text}"
                        </p>
                        <p className="text-xs text-amber-700 font-semibold mt-1">
                          — {reflection.verse_reference}
                        </p>
                      </div>
                    )}
                    <p className="text-gray-700 line-clamp-4 mb-4">
                      {reflection.content}
                    </p>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReflection(reflection)}
                        className="text-gray-600 hover:text-amber-600"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReflection(reflection.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              {editingReflection ? 'Editar Reflexão' : 'Nova Reflexão'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Verse Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versículo (opcional)
              </label>
              {selectedVerse ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 relative">
                  <button
                    onClick={() => setSelectedVerse(null)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                  <p className="text-gray-700 italic">"{selectedVerse.text}"</p>
                  <p className="text-amber-700 font-semibold mt-2">
                    — {selectedVerse.reference}
                  </p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowVerseSelector(true)}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Selecionar um versículo
                </Button>
              )}
            </div>

            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como você está se sentindo?
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(selectedMood === mood.id ? '' : mood.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedMood === mood.id
                        ? mood.color + ' ring-2 ring-offset-2 ring-amber-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {mood.emoji} {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sua reflexão
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva suas reflexões, pensamentos e orações sobre este versículo..."
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length} caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetEditor}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveReflection}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {editingReflection ? 'Salvar Alterações' : 'Salvar Reflexão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verse Selector Dialog */}
      <Dialog open={showVerseSelector} onOpenChange={setShowVerseSelector}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Selecionar Versículo</DialogTitle>
          </DialogHeader>
          <VerseSelectorContent 
            onSelect={(verse) => {
              setSelectedVerse(verse);
              setShowVerseSelector(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Verse Selector Component
const VerseSelectorContent: React.FC<{ onSelect: (verse: Verse) => void }> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');

  const emotions = [
    { id: 'paz', label: 'Paz' },
    { id: 'ansiedade', label: 'Ansiedade' },
    { id: 'gratidao', label: 'Gratidão' },
    { id: 'tristeza', label: 'Tristeza' },
    { id: 'alegria', label: 'Alegria' },
    { id: 'medo', label: 'Medo' },
    { id: 'esperanca', label: 'Esperança' },
    { id: 'amor', label: 'Amor' },
    { id: 'forca', label: 'Força' },
    { id: 'proposito', label: 'Propósito' },
  ];

  const filteredVerses = verses.filter(v => {
    const matchesSearch = search === '' || 
      v.text.toLowerCase().includes(search.toLowerCase()) ||
      v.reference.toLowerCase().includes(search.toLowerCase());
    const matchesEmotion = selectedEmotion === '' || v.emotion === selectedEmotion;
    return matchesSearch && matchesEmotion;
  }).slice(0, 50);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar versículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedEmotion('')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            selectedEmotion === '' 
              ? 'bg-amber-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {emotions.map(emotion => (
          <button
            key={emotion.id}
            onClick={() => setSelectedEmotion(emotion.id)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedEmotion === emotion.id 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {emotion.label}
          </button>
        ))}
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {filteredVerses.map(verse => (
          <button
            key={verse.id}
            onClick={() => onSelect(verse)}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all"
          >
            <p className="text-sm text-gray-700 line-clamp-2">"{verse.text}"</p>
            <p className="text-xs text-amber-700 font-semibold mt-1">
              — {verse.reference}
            </p>
          </button>
        ))}
        {filteredVerses.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nenhum versículo encontrado
          </p>
        )}
      </div>
    </div>
  );
};

export default ReflectionJournal;
