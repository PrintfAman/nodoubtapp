import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Info, Mail, ExternalLink, X, Languages } from 'lucide-react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showDevDropdown, setShowDevDropdown] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, '').replace(/\/api\/posts$/, '')
    : '';
  const wsRef = useRef(null);
  const devDropdownRef = useRef(null);

  useEffect(() => {
    const fetchAndSave = async () => {
      await fetch(`${apiBaseUrl}/api/posts/fetch-and-save`, {
        method: 'POST'
      });
    };

    const fetchPosts = async () => {
      const response = await fetch(`${apiBaseUrl}/api/posts`);
      const data = await response.json();
      setPosts(data);
      setSearchResults(data);
      setLoading(false);
    };

    fetchAndSave().then(() => {
      fetchPosts();
    });

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSearchResults(data);
      setIsSearching(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (devDropdownRef.current && !devDropdownRef.current.contains(event.target)) {
        setShowDevDropdown(false);
      }
      if (event.target.classList.contains('modal-overlay')) {
        setSelectedPost(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsSearching(true);
      wsRef.current.send(query);
    }
  };

  const translateText = async (text, title) => {
    if (!text && !title) return;
    
    setIsTranslating(true);
    try {
      if (title) {
        const titleResponse = await axios.get('https://translate.googleapis.com/translate_a/single', {
          params: {
            client: 'gtx',
            sl: 'auto',
            tl: 'en',
            dt: 't',
            q: title
          }
        });
        
        if (titleResponse.data && titleResponse.data[0]) {
          const translatedTitleText = titleResponse.data[0]
            .map(item => item[0])
            .join('');
          setTranslatedTitle(translatedTitleText);
        }
      }

      if (text) {
        const textResponse = await axios.get('https://translate.googleapis.com/translate_a/single', {
          params: {
            client: 'gtx',
            sl: 'auto',
            tl: 'en',
            dt: 't',
            q: text
          }
        });
        
        if (textResponse.data && textResponse.data[0]) {
          const translatedTextContent = textResponse.data[0]
            .map(item => item[0])
            .join('');
          setTranslatedText(translatedTextContent);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText(text || '');
      setTranslatedTitle(title || '');
    } finally {
      setIsTranslating(false);
    }
  };

  const resetTranslation = () => {
    setTranslatedText('');
    setTranslatedTitle('');
    setIsTranslating(false);
  };

  return (
    <div className="app">

      <div className="header">
        <div className="header-top">
          <h1>Post Explorer</h1>
          <div className="dev-dropdown-wrapper" ref={devDropdownRef}>
            <button
              className="dev-button"
              onClick={() => setShowDevDropdown(!showDevDropdown)}
            >
              <Info size={16} />
              Developer
            </button>
            {showDevDropdown && (
              <div className="dev-dropdown">
                <div className="dev-info">
                  <div className="dev-name">Amanpreet Singh Khanna</div>
                  <a href="mailto:amanpreetkhanna48@gmail.com" className="dev-email">
                    <Mail size={14} />
                    amanpreetkhanna48@gmail.com
                  </a>
                  <a
                    href="https://www.linkedin.com/in/amanpreet-singh-khanna-ab9831295/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dev-linkedin"
                  >
                    <ExternalLink size={14} />
                    LinkedIn Profile
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <p>Browse and search through posts in real time</p>
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-bar"
            placeholder="Search by title or content..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="stats-bar">
        <span>{searchResults.length} posts</span>
        <span>{searchQuery ? `Results for "${searchQuery}"` : 'All posts'}</span>
      </div>

      {loading && (
        <div className="loading">
          Loading posts <span className="loading-dots">...</span>
        </div>
      )}

      {!loading && searchResults.length === 0 && (
        <div className="no-results">
          <h3>No posts found</h3>
          <p>Try a different search term</p>
        </div>
      )}

      {!loading && (
        <div className="posts-grid">
          {searchResults.map((post) => (
            <div className="post-card" key={post.id}>
              <div className="post-number">#{post.id}</div>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <div className="post-footer">
                <span>User {post.userId}</span>
                <span 
                  className="read-tag" 
                  onClick={() => setSelectedPost(post)}
                >
                  Read
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => {
                setSelectedPost(null);
                resetTranslation();
              }}
            >
              <X size={24} />
            </button>
            <div className="modal-header">
              <div className="modal-post-number">Post #{selectedPost.id}</div>
              <h1>{translatedTitle || selectedPost.title}</h1>
              <div className="modal-meta">
                <span>By User {selectedPost.userId}</span>
                <button 
                  className="translate-btn"
                  onClick={() => translateText(selectedPost.body, selectedPost.title)}
                  disabled={isTranslating}
                >
                  <Languages size={16} />
                  {isTranslating ? 'Translating...' : 'Translate to English'}
                </button>
              </div>
            </div>
            <div className="modal-body">
              <p>{translatedText || selectedPost.body}</p>
              {translatedText && (
                <div className="translation-notice">
                  <small>Title and description translated to English</small>
                  <button 
                    className="reset-translate-btn"
                    onClick={resetTranslation}
                  >
                    Show Original
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;