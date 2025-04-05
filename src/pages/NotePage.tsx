import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
  FaSave, 
  FaArrowLeft, 
  FaStar, 
  FaShare, 
  FaEllipsisH,
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaCode,
  FaImage,
  FaLink,
  FaTasks,
  FaHeading
} from 'react-icons/fa';
import { useNotesStore } from '../store/notesStore';

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentNote, fetchNote, updateNote, createNote, loading, error } = useNotesStore();
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const isNewNote = id === 'new';

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      // Clear previous timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set new timer for auto-save
      const timer = setTimeout(() => {
        handleAutoSave(editor.getHTML());
      }, 2000);
      
      setAutoSaveTimer(timer);
    },
  });

  useEffect(() => {
    return () => {
      // Clean up timer on unmount
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  useEffect(() => {
    if (!isNewNote && id) {
      fetchNote(id);
    }
  }, [id, fetchNote, isNewNote]);

  useEffect(() => {
    if (currentNote && !isNewNote) {
      setTitle(currentNote.title);
      setIsFavorite(currentNote.favorite);
      
      // Set editor content
      if (editor) {
        // Convert our block structure to HTML for TipTap
        // This is a simplified version - in a real app, you'd have a more robust conversion
        let html = '';
        currentNote.content.forEach(block => {
          if (block.type === 'paragraph') {
            html += `<p>${block.content}</p>`;
          } else if (block.type === 'heading') {
            html += `<h${block.content.level}>${block.content.text}</h${block.content.level}>`;
          } else if (block.type === 'list') {
            html += `<ul>${block.content.items.map((item: string) => `<li>${item}</li>`).join('')}</ul>`;
          } else if (block.type === 'checklist') {
            html += `<ul data-type="taskList">${block.content.items.map((item: { text: string, checked: boolean }) => 
              `<li data-type="taskItem" data-checked="${item.checked}">${item.text}</li>`
            ).join('')}</ul>`;
          } else if (block.type === 'code') {
            html += `<pre><code>${block.content}</code></pre>`;
          } else if (block.type === 'image') {
            html += `<img src="${block.content.src}" alt="${block.content.alt || ''}" />`;
          }
        });
        
        editor.commands.setContent(html);
      }
    }
  }, [currentNote, editor, isNewNote]);

  const handleAutoSave = async (content: string) => {
    if (!title) return;
    
    try {
      setIsSaving(true);
      
      // Convert TipTap HTML to our block structure
      // This is a simplified version - in a real app, you'd have a more robust conversion
      const blocks = [
        {
          id: '1',
          type: 'paragraph',
          content: content
        }
      ];
      
      if (isNewNote) {
        const noteId = await createNote({
          title,
          content: blocks,
          favorite: isFavorite
        });
        navigate(`/notes/${noteId}`, { replace: true });
      } else if (id) {
        await updateNote(id, {
          title,
          content: blocks,
          favorite: isFavorite
        });
      }
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!editor || !title) return;
    
    const content = editor.getHTML();
    
    try {
      setIsSaving(true);
      
      // Convert TipTap HTML to our block structure
      const blocks = [
        {
          id: '1',
          type: 'paragraph',
          content: content
        }
      ];
      
      if (isNewNote) {
        const noteId = await createNote({
          title,
          content: blocks,
          favorite: isFavorite
        });
        navigate(`/notes/${noteId}`, { replace: true });
      } else if (id) {
        await updateNote(id, {
          title,
          content: blocks,
          favorite: isFavorite
        });
      }
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  if (loading && !isNewNote) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="note-page h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/notes')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            aria-label="Back to notes"
          >
            <FaArrowLeft />
          </button>
          
          <button 
            onClick={toggleFavorite}
            className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 ${
              isFavorite ? 'text-amber-500' : 'text-slate-600 dark:text-slate-300'
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FaStar />
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            aria-label="Share note"
          >
            <FaShare />
          </button>
          
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="More options"
            >
              <FaEllipsisH />
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">
            {isSaving ? 'Saving...' : 'All changes saved'}
          </span>
          
          <button 
            onClick={handleSave}
            className="btn-primary py-1 px-3 flex items-center"
            disabled={isSaving}
          >
            <FaSave className="mr-1" />
            <span>Save</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2">
          {error}
        </div>
      )}
      
      {/* Note Title */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="text-2xl font-bold w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400"
        />
      </div>
      
      {/* Editor Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex items-center space-x-1 overflow-x-auto">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('bold') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Bold"
        >
          <FaBold />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('italic') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Italic"
        >
          <FaItalic />
        </button>
        
        <div className="h-6 border-r border-slate-200 dark:border-slate-700 mx-1"></div>
        
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('heading', { level: 1 }) ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Heading 1"
        >
          <FaHeading />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Heading 2"
        >
          <span className="text-sm font-bold">H2</span>
        </button>
        
        <div className="h-6 border-r border-slate-200 dark:border-slate-700 mx-1"></div>
        
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('bulletList') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Bullet List"
        >
          <FaListUl />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('orderedList') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Ordered List"
        >
          <FaListOl />
        </button>
        
        <button
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('taskList') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Task List"
        >
          <FaTasks />
        </button>
        
        <div className="h-6 border-r border-slate-200 dark:border-slate-700 mx-1"></div>
        
        <button
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('codeBlock') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Code Block"
        >
          <FaCode />
        </button>
        
        <button
          onClick={() => {
            const url = window.prompt('Enter the URL of the image:');
            if (url) {
              editor?.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          aria-label="Insert Image"
        >
          <FaImage />
        </button>
        
        <button
          onClick={() => {
            const url = window.prompt('Enter the URL:');
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${
            editor?.isActive('link') ? 'bg-slate-100 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'
          }`}
          aria-label="Insert Link"
        >
          <FaLink />
        </button>
      </div>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <EditorContent editor={editor} className="prose prose-slate dark:prose-invert max-w-none" />
        </div>
      </div>
    </div>
  );
};

export default NotePage;
