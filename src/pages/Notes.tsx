import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaFolder, 
  FaStar, 
  FaEllipsisH, 
  FaSearch,
  FaSortAmountDown,
  FaFilter
} from 'react-icons/fa';
import { useNotesStore } from '../store/notesStore';

const Notes: React.FC = () => {
  const { notes, fetchNotes, toggleFavorite, loading, error } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filter notes based on search query and favorites filter
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = showFavoritesOnly ? note.favorite : true;
    return matchesSearch && matchesFavorite;
  });

  // Sort notes based on selected sort option
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Group notes by parent
  const rootNotes = sortedNotes.filter(note => !note.parentId);
  const childNotes = sortedNotes.filter(note => note.parentId);
  
  // Group child notes by parent ID
  const notesByParent: Record<string, typeof notes> = {};
  childNotes.forEach(note => {
    if (note.parentId) {
      if (!notesByParent[note.parentId]) {
        notesByParent[note.parentId] = [];
      }
      notesByParent[note.parentId].push(note);
    }
  });

  const handleToggleFavorite = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(noteId);
  };

  return (
    <div className="notes-page p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Notes</h1>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input py-2 pl-9 pr-4 w-full md:w-64"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`btn-outline py-2 px-3 ${showFavoritesOnly ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700' : ''}`}
              aria-label="Show favorites only"
            >
              <FaStar className={showFavoritesOnly ? 'text-amber-500' : ''} />
            </button>
            
            <div className="relative group">
              <button 
                className="btn-outline py-2 px-3"
                aria-label="Sort options"
              >
                <FaSortAmountDown />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hidden group-hover:block z-10">
                <div className="p-2">
                  <button 
                    onClick={() => setSortBy('updated')}
                    className={`w-full text-left px-3 py-2 rounded-md ${sortBy === 'updated' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    Last updated
                  </button>
                  <button 
                    onClick={() => setSortBy('created')}
                    className={`w-full text-left px-3 py-2 rounded-md ${sortBy === 'created' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    Date created
                  </button>
                  <button 
                    onClick={() => setSortBy('title')}
                    className={`w-full text-left px-3 py-2 rounded-md ${sortBy === 'title' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    Alphabetical
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
                aria-label="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
                aria-label="List view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <Link to="/notes/new" className="btn-primary py-2 px-4 flex items-center">
              <FaPlus className="mr-1" />
              <span>New</span>
            </Link>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {sortedNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                <FaFolder className="text-3xl text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No notes found</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchQuery || showFavoritesOnly 
                  ? "Try adjusting your search or filters" 
                  : "Create your first note to get started"}
              </p>
              <Link to="/notes/new" className="btn-primary py-2 px-4 inline-flex items-center">
                <FaPlus className="mr-2" />
                <span>Create New Note</span>
              </Link>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'
            }>
              {rootNotes.map((note) => (
                <Link 
                  key={note.id} 
                  to={`/notes/${note.id}`}
                  className={`block transition-all ${
                    viewMode === 'grid'
                      ? 'card hover:shadow-md group'
                      : 'card hover:shadow-md p-4 group'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-white text-lg flex items-center">
                        {note.emoji && <span className="mr-2">{note.emoji}</span>}
                        {note.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                      
                      {/* Preview of content */}
                      <div className="mt-2 text-slate-600 dark:text-slate-300 line-clamp-2 text-sm">
                        {note.content[0]?.content || "Empty note"}
                      </div>
                      
                      {/* Child notes count */}
                      {notesByParent[note.id] && notesByParent[note.id].length > 0 && (
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          {notesByParent[note.id].length} sub-page{notesByParent[note.id].length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <button 
                        onClick={(e) => handleToggleFavorite(e, note.id)}
                        className="p-1 text-slate-400 hover:text-amber-500 dark:text-slate-500 dark:hover:text-amber-400"
                        aria-label={note.favorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <FaStar className={note.favorite ? "text-amber-500" : ""} />
                      </button>
                      
                      <div className="relative ml-1">
                        <button 
                          className="p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                          aria-label="More options"
                        >
                          <FaEllipsisH />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hidden group-hover:block z-10">
                          <div className="p-1">
                            <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                              Rename
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                              Duplicate
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                              Move
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 dark:text-red-400">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notes;
