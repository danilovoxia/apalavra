import React from 'react';
import { Book, ChevronRight } from 'lucide-react';

interface BooksListProps {
  books: { name: string; count: number }[];
  selectedBook: string | null;
  onSelectBook: (book: string | null) => void;
}

const BooksList: React.FC<BooksListProps> = ({ books, selectedBook, onSelectBook }) => {
  if (selectedBook) {
    return (
      <button
        onClick={() => onSelectBook(null)}
        className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-4 font-medium"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Voltar aos livros
      </button>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {books.map(book => (
        <button
          key={book.name}
          onClick={() => onSelectBook(book.name)}
          className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <Book className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm group-hover:text-cyan-600 transition-colors line-clamp-1">
            {book.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{book.count} versículos</p>
        </button>
      ))}
    </div>
  );
};

export default BooksList;
