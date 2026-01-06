import React, { useState, useMemo } from 'react';
import { verses, Verse } from '@/data/verses';
import BrowseFilters from './BrowseFilters';
import BooksList from './BooksList';
import VersesList from './VersesList';
import ShareVerseModal from '../ShareVerseModal';

const BrowseSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'search'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [shareVerse, setShareVerse] = useState<Verse | null>(null);

  const extractBook = (ref: string): string => {
    const match = ref.match(/^(\d?\s?[A-Za-zÀ-ÿ]+)/);
    return match ? match[1].trim() : ref;
  };

  const books = useMemo(() => {
    const bookMap: Record<string, number> = {};
    verses.forEach(v => {
      const book = extractBook(v.reference);
      bookMap[book] = (bookMap[book] || 0) + 1;
    });
    return Object.entries(bookMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredVerses = useMemo(() => {
    if (activeTab === 'search' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return verses.filter(v =>
        v.text.toLowerCase().includes(q) || v.reference.toLowerCase().includes(q)
      ).slice(0, 50);
    }
    if (activeTab === 'books' && selectedBook) {
      return verses.filter(v => extractBook(v.reference) === selectedBook);
    }
    return [];
  }, [activeTab, searchQuery, selectedBook]);

  const getTitle = () => {
    if (activeTab === 'books' && selectedBook) return selectedBook;
    if (activeTab === 'search' && searchQuery) return `Resultados para "${searchQuery}"`;
    return '';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Explorar Versículos</h1>
        <p className="text-gray-600">Navegue por livros bíblicos ou busque por palavras-chave</p>
      </div>
      
      <BrowseFilters
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); setSelectedBook(null); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {activeTab === 'books' && !selectedBook && (
        <BooksList books={books} selectedBook={selectedBook} onSelectBook={setSelectedBook} />
      )}
      
      {activeTab === 'books' && selectedBook && (
        <button onClick={() => setSelectedBook(null)} className="mb-4 text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
          ← Voltar aos livros
        </button>
      )}
      
      {(filteredVerses.length > 0 || (activeTab === 'search' && searchQuery)) && (
        <VersesList verses={filteredVerses} onShareVerse={setShareVerse} title={getTitle()} />
      )}
      
      <ShareVerseModal verse={shareVerse} isOpen={!!shareVerse} onClose={() => setShareVerse(null)} />
    </div>
  );
};

export default BrowseSection;