/**
 * Corporate Bookmarks Management System
 * A professional bookmark organizer with advanced features for corporate environments
 * 
 * @author Keith Clarke
 * @version 2.2.6
 * @created 2025-01-26
 * @updated 2025-07-27
 * @description A comprehensive bookmark management system featuring:
 *   - Categorized bookmark organization
 *   - Advanced search with autocomplete
 *   - Tag-based filtering system
 *   - Favorites management
 *   - Recent visits tracking
 *   - Multiple theme support
 *   - Import/Export functionality
 *   - User bookmark creation
 *   - Responsive design
 *   - Local storage persistence
 * 
 * @features
 *   - Standalone operation (no server required)
 *   - JSON-based data structure
 *   - Professional corporate themes
 *   - Advanced filtering and search
 *   - User data management
 *   - Cross-browser compatibility
 * 
 * @license MIT
 * @repository https://github.com/mrmeener/BookMarks
 */


// Corporate Bookmarks Application
class BookmarkApp {
    constructor() {
        this.bookmarksData = null;
        
        // DEFAULT THEME CONFIGURATION
        // Change this value to set the default theme for new users
        // Available themes: 'eco-lime', 'corporate-blue', 'corporate-red', 'corporate-orange',
        // 'corporate-green', 'corporate-teal', 'trust-blue', 'executive-navy', 'modern-indigo',
        // 'corporate-purple', 'minimal-sandstone', 'minimal-white', 'professional-gray',
        // 'steel-cyan', 'charcoal-gold', 'dark-mode', 'high-contrast', etc.
        // See the theme selector dropdown in Settings for all available options
        this.currentTheme = 'eco-lime'; // Lime-Green theme (default)
        
        this.searchTerm = '';
        this.collapsedCategories = new Set(['recent-visits']); // Recently Visited collapsed by default
        this.activeTags = new Set();
        this.favorites = new Set();
        this.searchHistory = [];
        this.allTags = [];
        this.autocompleteIndex = -1;
        this.autocompleteItems = [];
        this.searchTimeout = null;
        this.tagSectionExpanded = false;
        this.recentVisits = [];
        this.userBookmarks = {
            categories: [],
            bookmarksInExistingCategories: {}
        };
        
        this.init();
    }

    async init() {
        this.loadFromStorage();
        this.loadUserBookmarks();
        this.setupEventListeners();
        await this.loadBookmarks();
        this.hideLoadingSpinner();
    }

    loadFromStorage() {
        // Load theme
        const savedTheme = localStorage.getItem('bookmarks-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        }

        // Load favorites
        const savedFavorites = localStorage.getItem('bookmarks-favorites');
        if (savedFavorites) {
            try {
                this.favorites = new Set(JSON.parse(savedFavorites));
            } catch (e) {
                console.warn('Could not parse saved favorites');
            }
        }

        // Load search history
        const savedSearchHistory = localStorage.getItem('bookmarks-search-history');
        if (savedSearchHistory) {
            try {
                this.searchHistory = JSON.parse(savedSearchHistory);
            } catch (e) {
                console.warn('Could not parse saved search history');
            }
        }

        // Load active tags
        const savedActiveTags = localStorage.getItem('bookmarks-active-tags');
        if (savedActiveTags) {
            try {
                this.activeTags = new Set(JSON.parse(savedActiveTags));
            } catch (e) {
                console.warn('Could not parse saved active tags');
            }
        }

        // Load collapsed categories
        const savedCollapsed = localStorage.getItem('bookmarks-collapsed');
        if (savedCollapsed) {
            try {
                this.collapsedCategories = new Set(JSON.parse(savedCollapsed));
            } catch (e) {
                console.warn('Could not parse saved collapsed categories');
            }
        }

        // Load tag section state
        const savedTagSectionExpanded = localStorage.getItem('bookmarks-tag-section-expanded');
        if (savedTagSectionExpanded) {
            this.tagSectionExpanded = savedTagSectionExpanded === 'true';
        }

        // Load recent visits
        const savedRecentVisits = localStorage.getItem('bookmarks-recent-visits');
        if (savedRecentVisits) {
            try {
                this.recentVisits = JSON.parse(savedRecentVisits);
                // Clean up old entries (older than 30 days)
                const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
                this.recentVisits = this.recentVisits.filter(visit => visit.lastVisited > thirtyDaysAgo);
            } catch (e) {
                console.warn('Could not parse saved recent visits');
                this.recentVisits = [];
            }
        }

        // Load health status from sessionStorage
        const savedHealthStatus = sessionStorage.getItem('bookmarks-health-status');
        if (savedHealthStatus) {
            try {
                const healthData = JSON.parse(savedHealthStatus);
                this.healthStatus = new Map(Object.entries(healthData));
            } catch (e) {
                console.warn('Could not parse saved health status');
            }
        }
    }

    setupEventListeners() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        themeSelect.value = this.currentTheme;
        themeSelect.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // Enhanced search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        // Search keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeydown(e);
        });

        // Hide dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideAutocomplete();
            }
            if (!e.target.closest('.settings-container')) {
                this.hideSettingsDropdown();
            }
        });
    }

    handleSearchInput(value) {
        this.searchTerm = value.toLowerCase();
        
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Debounce search
        this.searchTimeout = setTimeout(() => {
            this.filterBookmarks();
            
            // Show autocomplete after 3 characters
            if (value.length >= 3) {
                this.showAutocomplete(value);
            } else {
                this.hideAutocomplete();
            }
        }, 300);
    }

    handleSearchKeydown(e) {
        const dropdown = document.getElementById('autocompleteDropdown');
        
        if (e.key === 'Escape') {
            e.target.value = '';
            this.searchTerm = '';
            this.filterBookmarks();
            this.hideAutocomplete();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.navigateAutocomplete(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.navigateAutocomplete(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.autocompleteIndex >= 0 && this.autocompleteItems.length > 0) {
                this.selectAutocompleteItem(this.autocompleteItems[this.autocompleteIndex]);
            } else {
                this.addToSearchHistory(e.target.value);
                this.hideAutocomplete();
            }
        }
    }

    showAutocomplete(query) {
        const suggestions = this.generateSuggestions(query);
        const dropdown = document.getElementById('autocompleteDropdown');
        
        if (suggestions.length === 0) {
            this.hideAutocomplete();
            return;
        }

        this.autocompleteItems = suggestions;
        this.autocompleteIndex = -1;

        dropdown.innerHTML = suggestions.map((item, index) => `
            <div class="autocomplete-item" data-index="${index}" onclick="bookmarkApp.selectAutocompleteItem('${item.text}')">
                <div class="autocomplete-text">${this.highlightMatch(item.text, query)}</div>
                <div class="autocomplete-type">${item.type}</div>
            </div>
        `).join('');

        dropdown.style.display = 'block';
    }

    generateSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Add search history
        this.searchHistory.forEach(term => {
            if (term.toLowerCase().includes(queryLower) && term !== query) {
                suggestions.push({ text: term, type: 'Recent search' });
            }
        });

        // Add bookmark names and descriptions
        if (this.bookmarksData && this.bookmarksData.categories) {
            this.bookmarksData.categories.forEach(category => {
                category.bookmarks.forEach(bookmark => {
                    if (bookmark.name.toLowerCase().includes(queryLower)) {
                        suggestions.push({ text: bookmark.name, type: 'Bookmark' });
                    }
                    if (bookmark.description.toLowerCase().includes(queryLower) && 
                        !suggestions.some(s => s.text === bookmark.name)) {
                        suggestions.push({ text: bookmark.name, type: 'Description match' });
                    }
                });
            });
        }

        // Add tags
        this.allTags.forEach(tag => {
            if (tag.toLowerCase().includes(queryLower)) {
                suggestions.push({ text: tag, type: 'Tag' });
            }
        });

        // Remove duplicates and limit results
        const uniqueSuggestions = suggestions.filter((item, index, self) => 
            index === self.findIndex(t => t.text === item.text)
        );

        return uniqueSuggestions.slice(0, 8);
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    navigateAutocomplete(direction) {
        const items = document.querySelectorAll('.autocomplete-item');
        if (items.length === 0) return;

        // Remove current selection
        if (this.autocompleteIndex >= 0) {
            items[this.autocompleteIndex].classList.remove('selected');
        }

        // Update index
        this.autocompleteIndex += direction;
        if (this.autocompleteIndex < 0) {
            this.autocompleteIndex = items.length - 1;
        } else if (this.autocompleteIndex >= items.length) {
            this.autocompleteIndex = 0;
        }

        // Add new selection
        items[this.autocompleteIndex].classList.add('selected');
        items[this.autocompleteIndex].scrollIntoView({ block: 'nearest' });
    }

    selectAutocompleteItem(text) {
        const searchInput = document.getElementById('searchInput');
        searchInput.value = text;
        this.searchTerm = text.toLowerCase();
        this.addToSearchHistory(text);
        this.filterBookmarks();
        this.hideAutocomplete();
    }

    hideAutocomplete() {
        const dropdown = document.getElementById('autocompleteDropdown');
        dropdown.style.display = 'none';
        this.autocompleteIndex = -1;
        this.autocompleteItems = [];
    }

    addToSearchHistory(term) {
        if (term && term.length >= 3) {
            // Remove if already exists
            this.searchHistory = this.searchHistory.filter(t => t !== term);
            // Add to beginning
            this.searchHistory.unshift(term);
            // Keep only last 10
            this.searchHistory = this.searchHistory.slice(0, 10);
            // Save to storage
            localStorage.setItem('bookmarks-search-history', JSON.stringify(this.searchHistory));
        }
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        localStorage.setItem('bookmarks-theme', theme);
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    async loadBookmarks() {
        // Load bookmarks directly from bookmarks.js (JSONP method)
        const script = document.createElement('script');
        script.src = 'bookmarks.js';
        script.onerror = () => {
            console.error('Could not load bookmarks.js - please ensure the file exists');
            this.showError();
        };
        document.head.appendChild(script);
    }

    // This will be called by the JSONP file
    loadBookmarksData(data) {
        this.bookmarksData = data;
        console.log('Loaded bookmarks from bookmarks.js file');
        this.initializeAfterLoad();
    }

    // This will be called by the user bookmarks JSONP file
    loadUserBookmarks(data) {
        if (data && data.categories) {
            console.log('Loaded user bookmarks from user-bookmarks.js file');
            // Merge user bookmarks with existing data
            this.mergeImportedUserBookmarks(data);
            // Re-render if already initialized
            if (this.bookmarksData) {
                // Call mergeUserBookmarks to integrate into display data
                this.mergeUserBookmarks();
                this.refreshBookmarkDisplay();
            }
        }
    }

    mergeImportedUserBookmarks(userData) {
        // Add imported user categories to userBookmarks
        if (userData.categories) {
            userData.categories.forEach(category => {
                // Check if category already exists
                const existingCategory = this.userBookmarks.categories.find(cat => cat.id === category.id);
                if (!existingCategory) {
                    this.userBookmarks.categories.push(category);
                }
            });
        }

        // Add imported bookmarks to existing categories
        if (userData.bookmarksInExistingCategories) {
            Object.entries(userData.bookmarksInExistingCategories).forEach(([categoryId, bookmarks]) => {
                if (!this.userBookmarks.bookmarksInExistingCategories[categoryId]) {
                    this.userBookmarks.bookmarksInExistingCategories[categoryId] = [];
                }
                // Merge bookmarks, avoiding duplicates
                bookmarks.forEach(bookmark => {
                    const exists = this.userBookmarks.bookmarksInExistingCategories[categoryId]
                        .some(existing => existing.url === bookmark.url);
                    if (!exists) {
                        this.userBookmarks.bookmarksInExistingCategories[categoryId].push(bookmark);
                    }
                });
            });
        }

        // Save merged data
        this.saveUserBookmarks();
        
        // Refresh display if bookmarks are already loaded
        if (this.bookmarksData) {
            this.refreshBookmarkDisplay();
        }
    }

    initializeAfterLoad() {
        // Check for and restore UI state from previous session
        this.restoreUIState();
        
        // Merge user bookmarks with default bookmarks
        this.mergeUserBookmarks();
        
        this.collectAllTags();
        this.renderTagFilters();
        this.initializeTagSection();
        this.updateTagToggleButton();
        this.renderRecentlyVisited();
        this.renderFavorites();
        this.renderCategories();
        this.setupBookmarkClickTracking();
        
        // Apply any restored filters
        if (this.searchTerm || this.activeTags.size > 0) {
            this.filterBookmarks();
        }
    }

    // Recently Visited Tracking
    trackBookmarkVisit(bookmark) {
        const now = Date.now();
        const existingIndex = this.recentVisits.findIndex(visit => visit.url === bookmark.url);
        
        if (existingIndex >= 0) {
            // Update existing entry
            this.recentVisits[existingIndex].count++;
            this.recentVisits[existingIndex].lastVisited = now;
        } else {
            // Add new entry
            this.recentVisits.unshift({
                url: bookmark.url,
                name: bookmark.name,
                description: bookmark.description,
                count: 1,
                lastVisited: now,
                firstVisited: now
            });
        }
        
        // Keep only last 8 entries
        this.recentVisits = this.recentVisits.slice(0, 8);
        
        // Sort by last visited (most recent first)
        this.recentVisits.sort((a, b) => b.lastVisited - a.lastVisited);
        
        // Save to localStorage
        localStorage.setItem('bookmarks-recent-visits', JSON.stringify(this.recentVisits));
        
        // Re-render recently visited section
        this.renderRecentlyVisited();
    }

    setupBookmarkClickTracking() {
        // Add click tracking to all bookmark cards
        document.addEventListener('click', (e) => {
            const bookmarkCard = e.target.closest('.bookmark-card');
            if (bookmarkCard && !e.target.closest('.bookmark-star')) {
                const url = bookmarkCard.href;
                const bookmark = this.findBookmarkByUrl(url);
                if (bookmark) {
                    this.trackBookmarkVisit(bookmark);
                }
            }
        });
    }

    findBookmarkByUrl(url) {
        if (!this.bookmarksData || !this.bookmarksData.categories) return null;
        
        for (const category of this.bookmarksData.categories) {
            for (const bookmark of category.bookmarks) {
                if (bookmark.url === url) {
                    return bookmark;
                }
            }
        }
        return null;
    }

    renderRecentlyVisited() {
        const container = document.getElementById('categoriesContainer');
        let recentSection = document.querySelector('.recent-visits-section');
        
        // Remove existing section
        if (recentSection) {
            recentSection.remove();
        }
        
        // Don't show if no recent visits
        if (this.recentVisits.length === 0) {
            return;
        }

        // Create new section
        recentSection = document.createElement('div');
        recentSection.className = 'recent-visits-section';
        
        // Insert after favorites but before regular categories
        const favoritesSection = document.querySelector('.favorites-section');
        const firstCategory = document.querySelector('.category-section');
        
        if (favoritesSection) {
            container.insertBefore(recentSection, favoritesSection.nextSibling);
        } else if (firstCategory) {
            container.insertBefore(recentSection, firstCategory);
        } else {
            container.insertBefore(recentSection, container.firstChild);
        }

        const isCollapsed = this.collapsedCategories.has('recent-visits');
        if (isCollapsed) {
            recentSection.classList.add('collapsed');
        }

        recentSection.innerHTML = `
            <div class="recent-visits-header" onclick="bookmarkApp.toggleCategory('recent-visits')">
                <div>
                    <div class="recent-visits-title">
                        🕒 Recently Visited
                        <span class="recent-visits-badge">${this.recentVisits.length}</span>
                    </div>
                    <div class="recent-visits-description">Your most recently accessed bookmarks</div>
                </div>
                <div class="expand-icon">${isCollapsed ? '▶' : '▼'}</div>
            </div>
            <div class="recent-visits-grid">
                ${this.recentVisits.map(visit => this.createRecentVisitCard(visit)).join('')}
            </div>
        `;
    }

    createRecentVisitCard(visit) {
        const logoSrc = this.getFaviconUrl(visit.url);
        const isFavorited = this.favorites.has(visit.url);
        const timeAgo = this.getTimeAgo(visit.lastVisited);

        return `
            <a href="${visit.url}" class="bookmark-card recent-visit-card" target="_blank" rel="noopener noreferrer">
                <div class="bookmark-star ${isFavorited ? 'favorited' : ''}" 
                     data-url="${visit.url}"
                     onclick="bookmarkApp.toggleFavorite('${visit.url}', event)">
                    ${isFavorited ? '⭐' : '☆'}
                </div>
                <div class="bookmark-header">
                    <img src="${logoSrc}" alt="${visit.name} logo" class="bookmark-logo" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMjQgMTJDMTcuMzczIDEyIDEyIDE3LjM3MyAxMiAyNEMxMiAzMC42MjcgMTcuMzczIDM2IDI0IDM2QzMwLjYyNyAzNiAzNiAzMC42MjcgMzYgMjRDMzYgMTcuMzczIDMwLjYyNyAxMiAyNCAxMlpNMjQgMzNDMTkuMDMgMzMgMTUgMjguOTcgMTUgMjRDMTUgMTkuMDMgMTkuMDMgMTUgMjQgMTVDMjguOTcgMTUgMzMgMTkuMDMgMzMgMjRDMzMgMjguOTcgMjguOTcgMzMgMjQgMzNaIiBmaWxsPSIjNjA1RTVDIi8+CjxwYXRoIGQ9Ik0yNCAyMUMyMi4zNDMgMjEgMjEgMjIuMzQzIDIxIDI0QzIxIDI1LjY1NyAyMi4zNDMgMjcgMjQgMjdDMjUuNjU3IDI3IDI3IDI1LjY1NyAyNyAyNEMyNyAAMi4zNDMgMjUuNjU3IDIxIDI0IDIxWiIgZmlsbD0iIzYwNUU1QyIvPgo8L3N2Zz4K'">
                    <div class="bookmark-info">
                        <div class="bookmark-title">${visit.name}</div>
                        <div class="bookmark-url">${this.formatUrl(visit.url)}</div>
                    </div>
                </div>
                <div class="bookmark-description">${visit.description}</div>
                <div class="recent-visit-meta">
                    <span class="visit-time">Last visited: ${timeAgo}</span>
                    <span class="visit-count">${visit.count} visit${visit.count > 1 ? 's' : ''}</span>
                </div>
            </a>
        `;
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }


    initializeTagSection() {
        const filtersSection = document.getElementById('filtersSection');
        const toggleBtn = document.getElementById('tagToggleBtn');
        
        if (this.tagSectionExpanded) {
            filtersSection.classList.remove('collapsed');
            filtersSection.classList.add('expanded');
            toggleBtn.classList.add('active');
        } else {
            filtersSection.classList.add('collapsed');
            filtersSection.classList.remove('expanded');
            toggleBtn.classList.remove('active');
        }
    }

    toggleTagSection() {
        const filtersSection = document.getElementById('filtersSection');
        const toggleBtn = document.getElementById('tagToggleBtn');
        
        this.tagSectionExpanded = !this.tagSectionExpanded;
        
        if (this.tagSectionExpanded) {
            filtersSection.classList.remove('collapsed');
            filtersSection.classList.add('expanded');
            toggleBtn.classList.add('active');
        } else {
            filtersSection.classList.remove('expanded');
            filtersSection.classList.add('collapsed');
            toggleBtn.classList.remove('active');
        }
        
        // Save state
        localStorage.setItem('bookmarks-tag-section-expanded', this.tagSectionExpanded);
        this.updateTagToggleButton();
    }

    updateTagToggleButton() {
        const toggleBtn = document.getElementById('tagToggleBtn');
        if (!toggleBtn) return;
        
        const activeCount = this.activeTags.size;
        const baseText = '🏷️ Tags';
        
        if (activeCount > 0) {
            toggleBtn.textContent = `${baseText} (${activeCount})`;
        } else {
            toggleBtn.textContent = baseText;
        }
    }

    collectAllTags() {
        const tagSet = new Set();
        if (this.bookmarksData && this.bookmarksData.categories) {
            this.bookmarksData.categories.forEach(category => {
                category.bookmarks.forEach(bookmark => {
                    if (bookmark.tags) {
                        bookmark.tags.forEach(tag => tagSet.add(tag));
                    }
                });
            });
        }
        this.allTags = Array.from(tagSet).sort();
    }

    renderTagFilters() {
        const container = document.getElementById('tagFilters');
        if (!container || this.allTags.length === 0) return;

        const tagCounts = this.getTagCounts();
        
        // Create active filters section
        const activeFiltersHtml = this.activeTags.size > 0 ? `
            <div class="active-filters-section">
                <div class="active-filters-header">
                    <span class="active-filters-title">Active Filters:</span>
                    <button class="tag-clear-btn" onclick="bookmarkApp.clearTagFilters()">Clear All</button>
                </div>
                <div class="active-filters-list">
                    ${Array.from(this.activeTags).map(tag => {
                        const count = tagCounts[tag] || 0;
                        return `
                            <span class="tag-chip active" onclick="bookmarkApp.toggleTagFilter('${tag}')">
                                ${tag} (${count}) ✕
                            </span>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : '';

        // Create available tags section
        const availableTagsHtml = `
            <div class="available-tags-section">
                <div class="available-tags-header">Available Tags:</div>
                <div class="available-tags-list">
                    ${this.allTags.map(tag => {
                        const count = tagCounts[tag] || 0;
                        const isActive = this.activeTags.has(tag);
                        if (isActive) return ''; // Don't show active tags in available section
                        return `
                            <span class="tag-chip" onclick="bookmarkApp.toggleTagFilter('${tag}')">
                                ${tag} (${count})
                            </span>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        container.innerHTML = activeFiltersHtml + availableTagsHtml;
    }

    getTagCounts() {
        const counts = {};
        if (this.bookmarksData && this.bookmarksData.categories) {
            this.bookmarksData.categories.forEach(category => {
                category.bookmarks.forEach(bookmark => {
                    if (bookmark.tags) {
                        bookmark.tags.forEach(tag => {
                            counts[tag] = (counts[tag] || 0) + 1;
                        });
                    }
                });
            });
        }
        return counts;
    }

    toggleTagFilter(tag) {
        if (this.activeTags.has(tag)) {
            this.activeTags.delete(tag);
        } else {
            this.activeTags.add(tag);
        }
        
        localStorage.setItem('bookmarks-active-tags', JSON.stringify([...this.activeTags]));
        this.renderTagFilters();
        this.updateTagToggleButton();
        this.filterBookmarks();
    }

    clearTagFilters() {
        this.activeTags.clear();
        localStorage.setItem('bookmarks-active-tags', JSON.stringify([]));
        this.renderTagFilters();
        this.updateTagToggleButton();
        this.filterBookmarks();
    }

    handleTagClick(tag, event) {
        // Prevent the bookmark card from being clicked
        event.preventDefault();
        event.stopPropagation();
        
        // Activate the tag filter
        this.activeTags.add(tag);
        
        // Auto-expand tag section if it's collapsed
        if (!this.tagSectionExpanded) {
            this.toggleTagSection();
        }
        
        // Update UI and filter
        localStorage.setItem('bookmarks-active-tags', JSON.stringify([...this.activeTags]));
        this.renderTagFilters();
        this.updateTagToggleButton();
        this.filterBookmarks();
    }

    toggleFavorite(bookmarkUrl, event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.favorites.has(bookmarkUrl)) {
            this.favorites.delete(bookmarkUrl);
        } else {
            this.favorites.add(bookmarkUrl);
        }
        
        localStorage.setItem('bookmarks-favorites', JSON.stringify([...this.favorites]));
        this.renderFavorites();
        this.updateStarIcons();
    }

    updateStarIcons() {
        document.querySelectorAll('.bookmark-star').forEach(star => {
            const url = star.dataset.url;
            if (this.favorites.has(url)) {
                star.classList.add('favorited');
                star.textContent = '⭐';
            } else {
                star.classList.remove('favorited');
                star.textContent = '☆';
            }
        });
    }

    renderFavorites() {
        const container = document.getElementById('categoriesContainer');
        let favoritesSection = document.querySelector('.favorites-section');
        
        // Get favorite bookmarks
        const favoriteBookmarks = this.getFavoriteBookmarks();
        
        if (favoriteBookmarks.length === 0) {
            if (favoritesSection) {
                favoritesSection.remove();
            }
            return;
        }

        if (!favoritesSection) {
            favoritesSection = document.createElement('div');
            favoritesSection.className = 'favorites-section';
            container.insertBefore(favoritesSection, container.firstChild);
        }

        const isCollapsed = this.collapsedCategories.has('favorites');
        if (isCollapsed) {
            favoritesSection.classList.add('collapsed');
        }

        favoritesSection.innerHTML = `
            <div class="favorites-header" onclick="bookmarkApp.toggleCategory('favorites')">
                <div>
                    <div class="favorites-title">
                        My Favorites
                        <span class="favorites-badge">${favoriteBookmarks.length}</span>
                    </div>
                </div>
                <div class="expand-icon">${isCollapsed ? '▶' : '▼'}</div>
            </div>
            <div class="bookmarks-grid">
                ${favoriteBookmarks.map(bookmark => this.createBookmarkCard(bookmark)).join('')}
            </div>
        `;
    }

    getFavoriteBookmarks() {
        const favorites = [];
        if (this.bookmarksData && this.bookmarksData.categories) {
            this.bookmarksData.categories.forEach(category => {
                category.bookmarks.forEach(bookmark => {
                    if (this.favorites.has(bookmark.url)) {
                        favorites.push(bookmark);
                    }
                });
            });
        }
        return favorites;
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        
        // Remove existing categories (but keep favorites)
        const existingCategories = container.querySelectorAll('.category-section');
        existingCategories.forEach(cat => cat.remove());

        if (!this.bookmarksData || !this.bookmarksData.categories) {
            this.showError();
            return;
        }

        this.bookmarksData.categories.forEach(category => {
            const categoryElement = this.createCategoryElement(category);
            container.appendChild(categoryElement);
        });

        this.updateStarIcons();
    }

    createCategoryElement(category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-section';
        categoryDiv.dataset.categoryId = category.id;

        const isCollapsed = this.collapsedCategories.has(category.id);
        if (isCollapsed) {
            categoryDiv.classList.add('collapsed');
        }

        categoryDiv.innerHTML = `
            <div class="category-header" onclick="bookmarkApp.toggleCategory('${category.id}')">
                <div>
                    <div class="category-title">
                        ${category.name}
                        <span class="category-badge">${category.bookmarks.length}</span>
                    </div>
                    <div class="category-description">${category.description}</div>
                </div>
                <div class="expand-icon">${isCollapsed ? '▶' : '▼'}</div>
            </div>
            <div class="bookmarks-grid">
                ${category.bookmarks.map(bookmark => this.createBookmarkCard(bookmark)).join('')}
            </div>
        `;

        return categoryDiv;
    }

    createBookmarkCard(bookmark) {
        const isDesktopApp = bookmark.type === 'desktop';
        const logoSrc = bookmark.logo || this.getFaviconUrl(bookmark.url);
        const isFavorited = this.favorites.has(bookmark.url);
        const tags = bookmark.tags ? bookmark.tags.map(tag => 
            `<span class="bookmark-tag clickable" onclick="bookmarkApp.handleTagClick('${tag}', event)">${tag}</span>`
        ).join('') : '';

        // For desktop apps, show info modal instead of trying to open URL
        const cardAction = isDesktopApp 
            ? `onclick="bookmarkApp.showDesktopAppInfo('${bookmark.name.replace(/'/g, "\\'")}', '${bookmark.url}', '${bookmark.description.replace(/'/g, "\\'")}', event)"` 
            : `href="${bookmark.url}" target="_blank" rel="noopener noreferrer"`;

        const cardClass = isDesktopApp ? 'bookmark-card desktop-app-card' : 'bookmark-card';
        const typeIndicator = '';

        return `
            <a ${cardAction} class="${cardClass}">
                <div class="bookmark-star ${isFavorited ? 'favorited' : ''}" 
                     data-url="${bookmark.url}"
                     onclick="bookmarkApp.toggleFavorite('${bookmark.url}', event)">
                    ${isFavorited ? '⭐' : '☆'}
                </div>
                ${typeIndicator}
                <div class="bookmark-header">
                    <img src="${logoSrc}" alt="${bookmark.name} logo" class="bookmark-logo" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMjQgMTJDMTcuMzczIDEyIDEyIDE3LjM3MyAxMiAyNEMxMiAzMC42MjcgMTcuMzczIDM2IDI0IDM2QzMwLjYyNyAzNiAzNiAzMC42MjcgMzYgMjRDMzYgMTcuMzczIDMwLjYyNyAxMiAyNCAxMlpNMjQgMzNDMTkuMDMgMzMgMTUgMjguOTcgMTUgMjRDMTUgMTkuMDMgMTkuMDMgMTUgMjQgMTVDMjguOTcgMTUgMzMgMTkuMDMgMzMgMjRDMzMgMjguOTcgMjguOTcgMzMgMjQgMzNaIiBmaWxsPSIjNjA1RTVDIi8+CjxwYXRoIGQ9Ik0yNCAyMUMyMi4zNDMgMjEgMjEgMjIuMzQzIDIxIDI0QzIxIDI1LjY1NyAyMi4zNDMgMjcgMjQgMjdDMjUuNjU3IDI3IDI3IDI1LjY1NyAyNyAyNEMyNyAAMi4zNDMgMjUuNjU3IDIxIDI0IDIxWiIgZmlsbD0iIzYwNUU1QyIvPgo8L3N2Zz4K'">
                    <div class="bookmark-info">
                        <div class="bookmark-title">
                            ${bookmark.name}
                            <div class="bookmark-help" 
                                 title="Get help with ${bookmark.name}"
                                 onclick="bookmarkApp.requestHelp('${bookmark.name.replace(/'/g, "\\'")}', '${bookmark.url}', '${bookmark.description.replace(/'/g, "\\'")}', event)">
                                ❓
                            </div>
                        </div>
                        <div class="bookmark-url">${isDesktopApp ? 'Desktop Application' : this.formatUrl(bookmark.url)}</div>
                    </div>
                </div>
                <div class="bookmark-description">${bookmark.description}</div>
                ${tags ? `<div class="bookmark-tags">${tags}</div>` : ''}
            </a>
        `;
    }

    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=48`;
        } catch {
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y4RjlGQSIvPgo8cGF0aCBkPSJNMjQgMTJDMTcuMzczIDEyIDEyIDE3LjM3MyAxMiAyNEMxMiAzMC42MjcgMTcuMzczIDM2IDI0IDM2QzMwLjYyNyAzNiAzNiAzMC42MjcgMzYgMjRDMzYgMTcuMzczIDMwLjYyNyAxMiAyNCAxMlpNMjQgMzNDMTkuMDMgMzMgMTUgMjguOTcgMTUgMjRDMTUgMTkuMDMgMTkuMDMgMTUgMjQgMTVDMjguOTcgMTUgMzMgMTkuMDMgMzMgMjRDMzMgMjguOTcgMjguOTcgMzMgMjQgMzNaIiBmaWxsPSIjNjA1RTVDIi8+CjxwYXRoIGQ9Ik0yNCAyMUMyMi4zNDMgMjEgMjEgMjIuMzQzIDIxIDI0QzIxIDI1LjY1NyAyMi4zNDMgMjcgMjQgMjdDMjUuNjU3IDI3IDI3IDI1LjY1NyAyNyAyNEMyNyAyMi4zNDMgMjUuNjU3IDIxIDI0IDIxWiIgZmlsbD0iIzYwNUU1QyIvPgo8L3N2Zz4K';
        }
    }

    formatUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return url;
        }
    }

    toggleCategory(categoryId) {
        let categoryElement;
        
        // Handle different section types
        if (categoryId === 'favorites') {
            categoryElement = document.querySelector('.favorites-section');
        } else if (categoryId === 'recent-visits') {
            categoryElement = document.querySelector('.recent-visits-section');
        } else {
            categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
        }
        
        if (!categoryElement) return;
        
        const expandIcon = categoryElement.querySelector('.expand-icon');
        
        if (this.collapsedCategories.has(categoryId)) {
            this.collapsedCategories.delete(categoryId);
            categoryElement.classList.remove('collapsed');
            if (expandIcon) expandIcon.textContent = '▼';
        } else {
            this.collapsedCategories.add(categoryId);
            categoryElement.classList.add('collapsed');
            if (expandIcon) expandIcon.textContent = '▶';
        }
        
        // Save collapsed state
        localStorage.setItem('bookmarks-collapsed', JSON.stringify([...this.collapsedCategories]));
    }

    filterBookmarks() {
        if (!this.bookmarksData) return;

        // Filter favorites section
        const favoritesSection = document.querySelector('.favorites-section');
        if (favoritesSection) {
            this.filterFavoritesSection(favoritesSection);
        }

        // Filter recently visited section
        const recentVisitsSection = document.querySelector('.recent-visits-section');
        if (recentVisitsSection) {
            this.filterRecentVisitsSection(recentVisitsSection);
        }

        // Filter regular categories
        const categories = document.querySelectorAll('.category-section');
        categories.forEach(categoryElement => {
            const categoryId = categoryElement.dataset.categoryId;
            const category = this.bookmarksData.categories.find(cat => cat.id === categoryId);
            
            if (!category) return;

            let visibleBookmarks = 0;
            const bookmarkCards = categoryElement.querySelectorAll('.bookmark-card');
            
            bookmarkCards.forEach((card, index) => {
                const bookmark = category.bookmarks[index];
                const isVisible = this.matchesSearchAndTags(bookmark);
                
                if (isVisible) {
                    card.classList.remove('hidden');
                    visibleBookmarks++;
                } else {
                    card.classList.add('hidden');
                }
            });

            // Hide category if no bookmarks match
            if (visibleBookmarks === 0 && (this.searchTerm || this.activeTags.size > 0)) {
                categoryElement.classList.add('hidden');
            } else {
                categoryElement.classList.remove('hidden');
            }

            // Update badge count
            const badge = categoryElement.querySelector('.category-badge');
            if (badge) {
                badge.textContent = (this.searchTerm || this.activeTags.size > 0) ? visibleBookmarks : category.bookmarks.length;
            }
        });
    }
    filterRecentVisitsSection(recentVisitsSection) {
        let visibleBookmarks = 0;
        const bookmarkCards = recentVisitsSection.querySelectorAll('.bookmark-card');
        
        bookmarkCards.forEach((card, index) => {
            const visit = this.recentVisits[index];
            if (visit && this.matchesSearchAndTags(visit)) {
                card.classList.remove('hidden');
                visibleBookmarks++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Hide recent visits section if no bookmarks match
        if (visibleBookmarks === 0 && (this.searchTerm || this.activeTags.size > 0)) {
            recentVisitsSection.classList.add('hidden');
        } else {
            recentVisitsSection.classList.remove('hidden');
        }

        // Update badge count
        const badge = recentVisitsSection.querySelector('.recent-visits-badge');
        if (badge) {
            badge.textContent = (this.searchTerm || this.activeTags.size > 0) ? visibleBookmarks : this.recentVisits.length;
        }
    }

    filterFavoritesSection(favoritesSection) {
        const favoriteBookmarks = this.getFavoriteBookmarks();
        let visibleBookmarks = 0;
        const bookmarkCards = favoritesSection.querySelectorAll('.bookmark-card');
        
        bookmarkCards.forEach((card, index) => {
            const bookmark = favoriteBookmarks[index];
            if (bookmark && this.matchesSearchAndTags(bookmark)) {
                card.classList.remove('hidden');
                visibleBookmarks++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Hide favorites section if no bookmarks match
        if (visibleBookmarks === 0 && (this.searchTerm || this.activeTags.size > 0)) {
            favoritesSection.classList.add('hidden');
        } else {
            favoritesSection.classList.remove('hidden');
        }

        // Update badge count
        const badge = favoritesSection.querySelector('.favorites-badge');
        if (badge) {
            badge.textContent = (this.searchTerm || this.activeTags.size > 0) ? visibleBookmarks : favoriteBookmarks.length;
        }
    }

    matchesSearchAndTags(bookmark) {
        // Check search term
        const matchesSearch = this.matchesSearch(bookmark);
        
        // Check tags (OR logic - bookmark must have at least one of the active tags)
        const matchesTags = this.activeTags.size === 0 || 
            (bookmark.tags && bookmark.tags.some(tag => this.activeTags.has(tag)));
        
        return matchesSearch && matchesTags;
    }

    matchesSearch(bookmark) {
        if (!this.searchTerm) return true;
        
        const searchFields = [
            bookmark.name,
            bookmark.description,
            bookmark.url,
            ...(bookmark.tags || [])
        ].join(' ').toLowerCase();
        
        return searchFields.includes(this.searchTerm);
    }

    // Smart Refresh System
    scheduleSmartRefresh() {
        // Clear any existing refresh timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        if (this.refreshCountdown) {
            clearInterval(this.refreshCountdown);
        }

        // Save current UI state
        this.saveUIState();

        // Show countdown notification
        this.showRefreshNotification();

        // Schedule refresh after 10 seconds
        this.refreshTimer = setTimeout(() => {
            this.performSmartRefresh();
        }, 10000);
    }

    saveUIState() {
        const uiState = {
            scrollPosition: window.scrollY,
            searchTerm: document.getElementById('searchInput').value,
            activeTags: [...this.activeTags],
            collapsedCategories: [...this.collapsedCategories],
            tagSectionExpanded: this.tagSectionExpanded,
            currentTheme: this.currentTheme,
            timestamp: Date.now()
        };

        sessionStorage.setItem('bookmarks-ui-state', JSON.stringify(uiState));
    }

    restoreUIState() {
        const savedState = sessionStorage.getItem('bookmarks-ui-state');
        if (!savedState) return;

        try {
            const uiState = JSON.parse(savedState);
            
            // Only restore if saved within last 30 seconds (to avoid stale state)
            if (Date.now() - uiState.timestamp > 30000) {
                sessionStorage.removeItem('bookmarks-ui-state');
                return;
            }

            // Restore search term
            if (uiState.searchTerm) {
                const searchInput = document.getElementById('searchInput');
                searchInput.value = uiState.searchTerm;
                this.searchTerm = uiState.searchTerm.toLowerCase();
            }

            // Restore active tags
            if (uiState.activeTags) {
                this.activeTags = new Set(uiState.activeTags);
            }

            // Restore collapsed categories
            if (uiState.collapsedCategories) {
                this.collapsedCategories = new Set(uiState.collapsedCategories);
            }

            // Restore tag section state
            if (typeof uiState.tagSectionExpanded === 'boolean') {
                this.tagSectionExpanded = uiState.tagSectionExpanded;
            }

            // Restore theme
            if (uiState.currentTheme) {
                this.currentTheme = uiState.currentTheme;
                this.applyTheme(uiState.currentTheme);
                const themeSelect = document.getElementById('themeSelect');
                if (themeSelect) themeSelect.value = uiState.currentTheme;
            }

            // Restore scroll position after a short delay
            setTimeout(() => {
                if (uiState.scrollPosition) {
                    window.scrollTo(0, uiState.scrollPosition);
                }
            }, 100);

            // Clean up saved state
            sessionStorage.removeItem('bookmarks-ui-state');

        } catch (e) {
            console.warn('Could not restore UI state:', e);
            sessionStorage.removeItem('bookmarks-ui-state');
        }
    }

    showRefreshNotification() {
        // Remove any existing notification
        const existingNotification = document.getElementById('refreshNotification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'refreshNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
        `;

        notification.innerHTML = `
            <span id="refreshMessage">Refreshing in <span id="refreshCountdown">10</span> seconds...</span>
            <button id="cancelRefresh" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">Cancel</button>
        `;

        document.body.appendChild(notification);

        // Add cancel functionality
        document.getElementById('cancelRefresh').addEventListener('click', () => {
            this.cancelSmartRefresh();
        });

        // Start countdown
        let countdown = 10;
        this.refreshCountdown = setInterval(() => {
            countdown--;
            const countdownElement = document.getElementById('refreshCountdown');
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(this.refreshCountdown);
            }
        }, 1000);
    }

    cancelSmartRefresh() {
        // Clear timers
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        if (this.refreshCountdown) {
            clearInterval(this.refreshCountdown);
            this.refreshCountdown = null;
        }

        // Remove notification
        const notification = document.getElementById('refreshNotification');
        if (notification) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }

        // Clear saved UI state
        sessionStorage.removeItem('bookmarks-ui-state');
    }

    performSmartRefresh() {
        // Clear timers
        if (this.refreshCountdown) {
            clearInterval(this.refreshCountdown);
        }

        // Update notification
        const notification = document.getElementById('refreshNotification');
        if (notification) {
            notification.innerHTML = `
                <span>Refreshing page...</span>
                <div style="
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
            `;
        }

        // Perform refresh after short delay
        setTimeout(() => {
            location.reload();
        }, 500);
    }

    // User Bookmark Management
    showAddBookmarkModal() {
        const modal = document.getElementById('addBookmarkModal');
        const form = document.getElementById('addBookmarkForm');
        
        // Reset form
        form.reset();
        
        // Populate category dropdown
        this.populateCategoryDropdown();
        
        // Setup form event listeners
        this.setupAddBookmarkForm();
        
        // Show modal
        modal.style.display = 'flex';
        
        // Focus on name field
        setTimeout(() => {
            document.getElementById('bookmarkName').focus();
        }, 100);
    }

    hideAddBookmarkModal() {
        const modal = document.getElementById('addBookmarkModal');
        modal.style.display = 'none';
        
        // Clear any validation states
        this.clearFormValidation();
    }

    populateCategoryDropdown() {
        const categorySelect = document.getElementById('bookmarkCategory');
        
        // Clear existing options except the first one
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        
        // Add existing categories
        if (this.bookmarksData && this.bookmarksData.categories) {
            this.bookmarksData.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
        
        // Add user-created categories
        this.userBookmarks.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `${category.name} (Custom)`;
            categorySelect.appendChild(option);
        });
        
        // Add "Create New Category" option
        const newCategoryOption = document.createElement('option');
        newCategoryOption.value = 'new';
        newCategoryOption.textContent = '+ Create New Category';
        categorySelect.appendChild(newCategoryOption);
    }

    setupAddBookmarkForm() {
        const form = document.getElementById('addBookmarkForm');
        const urlInput = document.getElementById('bookmarkUrl');
        const categorySelect = document.getElementById('bookmarkCategory');
        const tagsInput = document.getElementById('bookmarkTags');
        const typeSelect = document.getElementById('bookmarkType');
        
        // Remove existing event listeners
        form.removeEventListener('submit', this.handleAddBookmarkSubmit);
        urlInput.removeEventListener('input', this.handleUrlInput);
        categorySelect.removeEventListener('change', this.handleCategoryChange);
        tagsInput.removeEventListener('input', this.handleTagsInput);
        typeSelect.removeEventListener('change', this.handleTypeChange);
        
        // Add event listeners
        form.addEventListener('submit', (e) => this.handleAddBookmarkSubmit(e));
        urlInput.addEventListener('input', (e) => this.handleUrlInput(e));
        categorySelect.addEventListener('change', (e) => this.handleCategoryChange(e));
        tagsInput.addEventListener('input', (e) => this.handleTagsInput(e));
        typeSelect.addEventListener('change', (e) => this.handleTypeChange(e));
    }

    handleAddBookmarkSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const bookmarkData = {
            name: formData.get('name').trim(),
            url: formData.get('url').trim(),
            description: formData.get('description').trim(),
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            logo: formData.get('logo').trim(),
            helpType: formData.get('helpType') || 'help',
            type: formData.get('type') || 'web'
        };
        
        // Validate form data
        if (!this.validateBookmarkData(bookmarkData)) {
            return;
        }
        
        // Handle new category creation
        if (bookmarkData.category === 'new') {
            const newCategoryName = document.getElementById('newCategoryName').value.trim();
            const newCategoryColor = document.getElementById('newCategoryColor').value;
            
            if (!newCategoryName) {
                this.showFormError('Please enter a name for the new category');
                return;
            }
            
            bookmarkData.category = this.createNewCategory(newCategoryName, newCategoryColor);
        }
        
        // Add the bookmark
        this.addUserBookmark(bookmarkData);
        
        // Hide modal and show success message
        this.hideAddBookmarkModal();
        this.showSuccessMessage('Bookmark added successfully!');
        
        // Refresh the display
        this.refreshBookmarkDisplay();
    }

    validateBookmarkData(data) {
        // Clear previous validation errors
        this.clearFormValidation();
        
        let isValid = true;
        
        // Validate name
        if (!data.name) {
            this.showFieldError('bookmarkName', 'Name is required');
            isValid = false;
        }
        
        // Validate URL
        if (!data.url) {
            this.showFieldError('bookmarkUrl', 'URL is required');
            isValid = false;
        } else {
            try {
                new URL(data.url);
            } catch {
                this.showFieldError('bookmarkUrl', 'Please enter a valid URL');
                isValid = false;
            }
        }
        
        // Validate category
        if (!data.category) {
            this.showFieldError('bookmarkCategory', 'Please select a category');
            isValid = false;
        }
        
        // Check for duplicate URL
        if (this.isDuplicateUrl(data.url)) {
            this.showFieldError('bookmarkUrl', 'This URL already exists in your bookmarks');
            isValid = false;
        }
        
        return isValid;
    }

    isDuplicateUrl(url) {
        // Check in default bookmarks
        if (this.bookmarksData && this.bookmarksData.categories) {
            for (const category of this.bookmarksData.categories) {
                if (category.bookmarks.some(bookmark => bookmark.url === url)) {
                    return true;
                }
            }
        }
        
        // Check in user bookmarks
        for (const category of this.userBookmarks.categories) {
            if (category.bookmarks.some(bookmark => bookmark.url === url)) {
                return true;
            }
        }
        
        // Check in user bookmarks added to existing categories
        for (const categoryId in this.userBookmarks.bookmarksInExistingCategories) {
            const bookmarks = this.userBookmarks.bookmarksInExistingCategories[categoryId];
            if (bookmarks.some(bookmark => bookmark.url === url)) {
                return true;
            }
        }
        
        return false;
    }

    createNewCategory(name, color) {
        const categoryId = `user-${Date.now()}`;
        const newCategory = {
            id: categoryId,
            name: name,
            description: `Custom category: ${name}`,
            color: color,
            isUserCreated: true,
            bookmarks: []
        };
        
        this.userBookmarks.categories.push(newCategory);
        this.saveUserBookmarks();
        
        return categoryId;
    }

    addUserBookmark(bookmarkData) {
        const bookmark = {
            name: bookmarkData.name,
            url: bookmarkData.url,
            description: bookmarkData.description || '',
            logo: bookmarkData.logo || '',
            tags: bookmarkData.tags || [],
            supportType: bookmarkData.helpType || 'help',
            type: bookmarkData.type || 'web',
            isUserCreated: true,
            dateAdded: Date.now()
        };
        
        // Check if it's a user-created category
        const userCategory = this.userBookmarks.categories.find(cat => cat.id === bookmarkData.category);
        if (userCategory) {
            userCategory.bookmarks.push(bookmark);
        } else {
            // Add to existing category
            if (!this.userBookmarks.bookmarksInExistingCategories[bookmarkData.category]) {
                this.userBookmarks.bookmarksInExistingCategories[bookmarkData.category] = [];
            }
            this.userBookmarks.bookmarksInExistingCategories[bookmarkData.category].push(bookmark);
        }
        
        this.saveUserBookmarks();
    }

    saveUserBookmarks() {
        const userBookmarksData = {
            version: '1.0',
            lastModified: Date.now(),
            ...this.userBookmarks
        };
        
        localStorage.setItem('bookmarks-user-data', JSON.stringify(userBookmarksData));
    }

    loadUserBookmarks() {
        const savedData = localStorage.getItem('bookmarks-user-data');
        if (savedData) {
            try {
                const userData = JSON.parse(savedData);
                this.userBookmarks = {
                    categories: userData.categories || [],
                    bookmarksInExistingCategories: userData.bookmarksInExistingCategories || {}
                };
            } catch (e) {
                console.warn('Could not parse user bookmarks data:', e);
                this.userBookmarks = {
                    categories: [],
                    bookmarksInExistingCategories: {}
                };
            }
        }
    }

    refreshBookmarkDisplay() {
        // Merge user bookmarks with default bookmarks
        this.mergeUserBookmarks();
        
        // Re-collect tags (including user bookmark tags)
        this.collectAllTags();
        
        // Re-render everything
        this.renderTagFilters();
        this.renderFavorites();
        this.renderCategories();
        this.updateStarIcons();
        
        // Apply current filters
        this.filterBookmarks();
    }

    mergeUserBookmarks() {
        if (!this.bookmarksData || !this.bookmarksData.categories) return;
        
        // First, remove any previously added user bookmarks to avoid duplicates
        this.bookmarksData.categories.forEach(category => {
            // Remove user-created bookmarks from existing categories
            category.bookmarks = category.bookmarks.filter(bookmark => !bookmark.isUserCreated);
        });
        
        // Remove user-created categories
        this.bookmarksData.categories = this.bookmarksData.categories.filter(category => !category.isUserCreated);
        
        // Now add user bookmarks to existing categories
        this.bookmarksData.categories.forEach(category => {
            const userBookmarks = this.userBookmarks.bookmarksInExistingCategories[category.id];
            if (userBookmarks && userBookmarks.length > 0) {
                category.bookmarks = [...category.bookmarks, ...userBookmarks];
            }
        });
        
        // Add user-created categories
        if (this.userBookmarks.categories.length > 0) {
            this.bookmarksData.categories = [...this.bookmarksData.categories, ...this.userBookmarks.categories];
        }
    }

    handleUrlInput(e) {
        const url = e.target.value.trim();
        const preview = document.querySelector('.url-preview');
        const faviconPreview = document.getElementById('faviconPreview');
        const urlStatus = document.getElementById('urlStatus');
        
        if (!url) {
            faviconPreview.style.display = 'none';
            urlStatus.textContent = '';
            return;
        }
        
        try {
            const urlObj = new URL(url);
            urlStatus.textContent = `Domain: ${urlObj.hostname}`;
            urlStatus.className = 'url-status valid';
            
            // Load favicon
            const faviconUrl = this.getFaviconUrl(url);
            faviconPreview.src = faviconUrl;
            faviconPreview.style.display = 'block';
            
            // Auto-populate name if empty
            const nameInput = document.getElementById('bookmarkName');
            if (!nameInput.value.trim()) {
                // Try to get page title (this won't work due to CORS, but we can try)
                nameInput.placeholder = `Bookmark for ${urlObj.hostname}`;
            }
            
        } catch {
            urlStatus.textContent = 'Invalid URL format';
            urlStatus.className = 'url-status invalid';
            faviconPreview.style.display = 'none';
        }
    }

    handleCategoryChange(e) {
        const newCategorySection = document.querySelector('.new-category-section');
        
        if (e.target.value === 'new') {
            newCategorySection.style.display = 'flex';
            document.getElementById('newCategoryName').focus();
        } else {
            newCategorySection.style.display = 'none';
        }
    }

    handleTagsInput(e) {
        const input = e.target.value;
        const suggestions = document.querySelector('.tag-suggestions');
        
        // Clear existing suggestions
        suggestions.innerHTML = '';
        
        if (input.length < 2) return;
        
        // Get the current tag being typed (after the last comma)
        const tags = input.split(',');
        const currentTag = tags[tags.length - 1].trim().toLowerCase();
        
        if (currentTag.length < 2) return;
        
        // Find matching existing tags
        const matchingTags = this.allTags.filter(tag => 
            tag.toLowerCase().includes(currentTag) && 
            !tags.map(t => t.trim().toLowerCase()).includes(tag.toLowerCase())
        ).slice(0, 5);
        
        // Display suggestions
        matchingTags.forEach(tag => {
            const suggestion = document.createElement('span');
            suggestion.className = 'tag-suggestion';
            suggestion.textContent = tag;
            suggestion.onclick = () => this.addTagSuggestion(tag);
            suggestions.appendChild(suggestion);
        });
    }

    handleTypeChange(e) {
        const urlInput = document.getElementById('bookmarkUrl');
        const urlLabel = document.getElementById('urlLabel');
        const urlPreview = document.querySelector('.url-preview');
        
        if (e.target.value === 'desktop') {
            // Change to desktop application mode
            urlLabel.textContent = 'Application Name/ID *';
            urlInput.type = 'text';
            urlInput.placeholder = 'e.g., Microsoft Word, Adobe Photoshop, app://microsoft-word';
            urlInput.removeAttribute('pattern');
            
            // Hide URL preview for desktop apps
            if (urlPreview) {
                urlPreview.style.display = 'none';
            }
            
            // Clear URL validation
            urlInput.setCustomValidity('');
        } else {
            // Change to web bookmark mode
            urlLabel.textContent = 'URL *';
            urlInput.type = 'url';
            urlInput.placeholder = 'https://example.com';
            
            // Show URL preview for web bookmarks
            if (urlPreview) {
                urlPreview.style.display = 'block';
            }
        }
        
        // Clear the input when switching types
        urlInput.value = '';
        
        // Clear any existing validation messages
        this.clearFieldValidation('bookmarkUrl');
    }

    clearFieldValidation(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '';
            field.setCustomValidity('');
            
            // Remove error message
            const existingError = field.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
        }
    }

    addTagSuggestion(tag) {
        const tagsInput = document.getElementById('bookmarkTags');
        const currentTags = tagsInput.value.split(',').map(t => t.trim());
        
        // Replace the last tag (being typed) with the suggestion
        currentTags[currentTags.length - 1] = tag;
        
        tagsInput.value = currentTags.join(', ') + ', ';
        tagsInput.focus();
        
        // Clear suggestions
        document.querySelector('.tag-suggestions').innerHTML = '';
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.style.borderColor = '#ef4444';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #ef4444; font-size: 0.8rem; margin-top: 4px;';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    showFormError(message) {
        // Show general form error at the top of the modal
        const form = document.getElementById('addBookmarkForm');
        
        // Remove existing error
        const existingError = form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 0.9rem;
        `;
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
    }

    clearFormValidation() {
        // Clear field errors
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        document.querySelectorAll('.form-error').forEach(error => error.remove());
        
        // Reset field border colors
        document.querySelectorAll('#addBookmarkForm input, #addBookmarkForm textarea, #addBookmarkForm select').forEach(field => {
            field.style.borderColor = '';
        });
    }

    showSuccessMessage(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 2001;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Export/Import System
    showExportModal() {
        const modal = document.getElementById('exportModal');
        
        // Reset form
        this.resetExportForm();
        
        // Setup event listeners
        this.setupExportForm();
        
        // Generate default filename
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        document.getElementById('exportFileName').value = `bookmarks-export-${dateStr}`;
        
        // Show modal
        modal.style.display = 'flex';
    }

    hideExportModal() {
        const modal = document.getElementById('exportModal');
        modal.style.display = 'none';
    }

    resetExportForm() {
        // Reset radio buttons
        document.querySelector('input[name="exportType"][value="full"]').checked = true;
        
        // Hide selective options
        document.getElementById('selectiveOptions').style.display = 'none';
        document.getElementById('exportPreview').style.display = 'none';
    }

    setupExportForm() {
        // Export type change handler
        const exportTypeRadios = document.querySelectorAll('input[name="exportType"]');
        exportTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.handleExportTypeChange(e.target.value));
        });
        
        // Update preview when filename changes
        document.getElementById('exportFileName').addEventListener('input', () => this.updateExportPreview());
        
        // Initial preview update
        this.updateExportPreview();
    }

    handleExportTypeChange(exportType) {
        const selectiveOptions = document.getElementById('selectiveOptions');
        
        if (exportType === 'selective') {
            selectiveOptions.style.display = 'block';
            this.populateSelectiveOptions();
        } else {
            selectiveOptions.style.display = 'none';
        }
        
        this.updateExportPreview();
    }

    populateSelectiveOptions() {
        const container = document.getElementById('exportSelectionList');
        
        let html = '';
        
        // User categories
        if (this.userBookmarks.categories.length > 0) {
            html += '<h5 style="margin: 0 0 8px 0; color: var(--primary-color);">Custom Categories:</h5>';
            this.userBookmarks.categories.forEach(category => {
                html += `
                    <div class="selection-item">
                        <input type="checkbox" id="export-cat-${category.id}" value="${category.id}" checked>
                        <label for="export-cat-${category.id}" class="selection-item-label">${category.name}</label>
                        <span class="selection-item-count">${category.bookmarks.length}</span>
                    </div>
                `;
            });
        }
        
        // User bookmarks in existing categories
        const hasUserBookmarksInExisting = Object.keys(this.userBookmarks.bookmarksInExistingCategories).length > 0;
        if (hasUserBookmarksInExisting) {
            html += '<h5 style="margin: 16px 0 8px 0; color: var(--primary-color);">User Bookmarks in Existing Categories:</h5>';
            Object.entries(this.userBookmarks.bookmarksInExistingCategories).forEach(([categoryId, bookmarks]) => {
                const category = this.bookmarksData.categories.find(cat => cat.id === categoryId);
                if (category && bookmarks.length > 0) {
                    html += `
                        <div class="selection-item">
                            <input type="checkbox" id="export-existing-${categoryId}" value="existing-${categoryId}" checked>
                            <label for="export-existing-${categoryId}" class="selection-item-label">${category.name} (User Bookmarks)</label>
                            <span class="selection-item-count">${bookmarks.length}</span>
                        </div>
                    `;
                }
            });
        }
        
        // Settings options
        html += '<h5 style="margin: 16px 0 8px 0; color: var(--primary-color);">Settings:</h5>';
        const settingsOptions = [
            { id: 'favorites', label: 'Favorites', count: this.favorites.size },
            { id: 'recentVisits', label: 'Recent Visits', count: this.recentVisits.length },
            { id: 'theme', label: 'Theme Preference', count: 1 },
            { id: 'searchHistory', label: 'Search History', count: this.searchHistory.length },
            { id: 'uiPreferences', label: 'UI Preferences', count: 1 }
        ];
        
        settingsOptions.forEach(option => {
            if (option.count > 0) {
                html += `
                    <div class="selection-item">
                        <input type="checkbox" id="export-setting-${option.id}" value="setting-${option.id}" checked>
                        <label for="export-setting-${option.id}" class="selection-item-label">${option.label}</label>
                        <span class="selection-item-count">${option.count}</span>
                    </div>
                `;
            }
        });
        
        if (!html) {
            html = '<p style="color: var(--text-secondary); font-style: italic;">No user data available to export.</p>';
        }
        
        container.innerHTML = html;
        
        // Add change listeners to checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateExportPreview());
        });
    }

    updateExportPreview() {
        const exportType = document.querySelector('input[name="exportType"]:checked').value;
        const preview = document.getElementById('exportPreview');
        const summary = document.getElementById('exportSummary');
        
        const exportData = this.generateExportData(exportType);
        
        let html = '';
        
        // Export info
        html += `
            <div class="preview-item">
                <span class="preview-label">Export Type:</span>
                <span class="preview-value highlight">${this.getExportTypeLabel(exportType)}</span>
            </div>
        `;
        
        // File info
        const fileName = document.getElementById('exportFileName').value || 'bookmarks-export';
        html += `
            <div class="preview-item">
                <span class="preview-label">File Name:</span>
                <span class="preview-value">${fileName}.json</span>
            </div>
        `;
        
        // Content summary
        if (exportData.userBookmarks) {
            const totalBookmarks = this.countBookmarksInExportData(exportData.userBookmarks);
            const totalCategories = (exportData.userBookmarks.categories || []).length;
            
            if (totalBookmarks > 0) {
                html += `
                    <div class="preview-item">
                        <span class="preview-label">Bookmarks:</span>
                        <span class="preview-value highlight">${totalBookmarks}</span>
                    </div>
                `;
            }
            
            if (totalCategories > 0) {
                html += `
                    <div class="preview-item">
                        <span class="preview-label">Custom Categories:</span>
                        <span class="preview-value highlight">${totalCategories}</span>
                    </div>
                `;
            }
        }
        
        if (exportData.userSettings) {
            const settingsCount = Object.keys(exportData.userSettings).length;
            html += `
                <div class="preview-item">
                    <span class="preview-label">Settings:</span>
                    <span class="preview-value highlight">${settingsCount} items</span>
                </div>
            `;
        }
        
        // File size estimate
        const jsonString = JSON.stringify(exportData, null, 2);
        const sizeKB = Math.round(jsonString.length / 1024);
        html += `
            <div class="preview-item">
                <span class="preview-label">Estimated Size:</span>
                <span class="preview-value">${sizeKB} KB</span>
            </div>
        `;
        
        summary.innerHTML = html;
        preview.style.display = 'block';
    }

    getExportTypeLabel(exportType) {
        const labels = {
            full: 'Full Export (bookmarks + settings)',
            bookmarks: 'Bookmarks Only',
            settings: 'Settings Only',
            selective: 'Custom Selection'
        };
        return labels[exportType] || exportType;
    }

    countBookmarksInExportData(userBookmarks) {
        let count = 0;
        
        // Count bookmarks in custom categories
        if (userBookmarks.categories) {
            userBookmarks.categories.forEach(category => {
                count += category.bookmarks.length;
            });
        }
        
        // Count bookmarks in existing categories
        if (userBookmarks.bookmarksInExistingCategories) {
            Object.values(userBookmarks.bookmarksInExistingCategories).forEach(bookmarks => {
                count += bookmarks.length;
            });
        }
        
        return count;
    }

    generateExportData(exportType) {
        const now = new Date();
        const exportData = {
            exportInfo: {
                version: '1.0',
                exportDate: now.toISOString(),
                exportType: exportType,
                source: 'Corporate Bookmarks App',
                userAgent: navigator.userAgent,
                totalBookmarks: 0,
                totalCategories: 0
            }
        };
        
        // Add custom notes if provided (exportNotes element doesn't exist, so skip this)
        // const notes = document.getElementById('exportNotes').value.trim();
        // if (notes) {
        //     exportData.exportInfo.customNotes = notes;
        // }
        
        // Add user bookmarks based on export type
        if (exportType === 'full' || exportType === 'bookmarks') {
            exportData.userBookmarks = this.getBookmarksForExport(exportType);
            exportData.exportInfo.totalBookmarks = this.countBookmarksInExportData(exportData.userBookmarks);
            exportData.exportInfo.totalCategories = (exportData.userBookmarks.categories || []).length;
        }
        
        // Add settings based on export type
        if (exportType === 'full' || exportType === 'settings') {
            exportData.userSettings = this.getSettingsForExport(exportType);
        }
        
        // Handle selective export
        if (exportType === 'selective') {
            const selectedItems = this.getSelectedExportItems();
            
            if (selectedItems.bookmarks.length > 0 || selectedItems.categories.length > 0) {
                exportData.userBookmarks = this.getSelectiveBookmarksForExport(selectedItems);
                exportData.exportInfo.totalBookmarks = this.countBookmarksInExportData(exportData.userBookmarks);
                exportData.exportInfo.totalCategories = (exportData.userBookmarks.categories || []).length;
            }
            
            if (selectedItems.settings.length > 0) {
                exportData.userSettings = this.getSelectiveSettingsForExport(selectedItems.settings);
            }
        }
        
        return exportData;
    }

    getBookmarksForExport(exportType) {
        return {
            version: '1.0',
            lastModified: Date.now(),
            categories: [...this.userBookmarks.categories],
            bookmarksInExistingCategories: {...this.userBookmarks.bookmarksInExistingCategories}
        };
    }

    getSettingsForExport(exportType) {
        return {
            favorites: [...this.favorites],
            recentVisits: [...this.recentVisits],
            theme: this.currentTheme,
            collapsedCategories: [...this.collapsedCategories],
            activeTags: [...this.activeTags],
            searchHistory: [...this.searchHistory],
            tagSectionExpanded: this.tagSectionExpanded
        };
    }

    getSelectedExportItems() {
        const categories = [];
        const bookmarks = [];
        const settings = [];
        
        // Get selected checkboxes
        document.querySelectorAll('#exportSelectionList input[type="checkbox"]:checked').forEach(checkbox => {
            const value = checkbox.value;
            
            if (value.startsWith('user-')) {
                categories.push(value);
            } else if (value.startsWith('existing-')) {
                bookmarks.push(value.replace('existing-', ''));
            } else if (value.startsWith('setting-')) {
                settings.push(value.replace('setting-', ''));
            }
        });
        
        return { categories, bookmarks, settings };
    }

    getSelectiveBookmarksForExport(selectedItems) {
        const exportBookmarks = {
            version: '1.0',
            lastModified: Date.now(),
            categories: [],
            bookmarksInExistingCategories: {}
        };
        
        // Add selected custom categories
        selectedItems.categories.forEach(categoryId => {
            const category = this.userBookmarks.categories.find(cat => cat.id === categoryId);
            if (category) {
                exportBookmarks.categories.push(category);
            }
        });
        
        // Add selected bookmarks from existing categories
        selectedItems.bookmarks.forEach(categoryId => {
            const bookmarks = this.userBookmarks.bookmarksInExistingCategories[categoryId];
            if (bookmarks && bookmarks.length > 0) {
                exportBookmarks.bookmarksInExistingCategories[categoryId] = bookmarks;
            }
        });
        
        return exportBookmarks;
    }

    getSelectiveSettingsForExport(selectedSettings) {
        const settings = {};
        
        selectedSettings.forEach(settingKey => {
            switch (settingKey) {
                case 'favorites':
                    settings.favorites = [...this.favorites];
                    break;
                case 'recentVisits':
                    settings.recentVisits = [...this.recentVisits];
                    break;
                case 'theme':
                    settings.theme = this.currentTheme;
                    break;
                case 'searchHistory':
                    settings.searchHistory = [...this.searchHistory];
                    break;
                case 'uiPreferences':
                    settings.collapsedCategories = [...this.collapsedCategories];
                    settings.activeTags = [...this.activeTags];
                    settings.tagSectionExpanded = this.tagSectionExpanded;
                    break;
            }
        });
        
        return settings;
    }

    performExport() {
        const exportType = document.querySelector('input[name="exportType"]:checked').value;
        const fileName = document.getElementById('exportFileName').value || 'bookmarks-export';
        
        try {
            const exportData = this.generateExportData(exportType);
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Create and download file
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Show success message and close modal
            this.hideExportModal();
            this.showSuccessMessage(`Export completed: ${fileName}.json`);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showFormError('Export failed. Please try again.');
        }
    }

    // Import System
    showImportModal() {
        const modal = document.getElementById('importModal');
        
        // Reset form
        this.resetImportForm();
        
        // Setup event listeners
        this.setupImportForm();
        
        // Show modal
        modal.style.display = 'flex';
    }

    hideImportModal() {
        const modal = document.getElementById('importModal');
        modal.style.display = 'none';
    }

    resetImportForm() {
        // Reset file input
        document.getElementById('importFile').value = '';
        
        // Hide preview sections
        document.getElementById('importPreview').style.display = 'none';
        document.getElementById('conflictSection').style.display = 'none';
        
        // Reset conflict resolution
        document.querySelector('input[name="conflictResolution"][value="skip"]').checked = true;
        
        // Disable import button
        document.getElementById('importBtn').disabled = true;
        
        // Clear file status
        document.getElementById('fileStatus').textContent = '';
        document.getElementById('fileStatus').className = 'file-status';
    }

    setupImportForm() {
        const fileInput = document.getElementById('importFile');
        
        // File input change handler
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Conflict resolution change handler
        const conflictRadios = document.querySelectorAll('input[name="conflictResolution"]');
        conflictRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updateImportPreview());
        });
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        const fileStatus = document.getElementById('fileStatus');
        
        if (!file) {
            this.resetImportForm();
            return;
        }
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            fileStatus.textContent = 'Please select a JSON file';
            fileStatus.className = 'file-status invalid';
            document.getElementById('importBtn').disabled = true;
            return;
        }
        
        // Show processing status
        fileStatus.textContent = 'Processing file...';
        fileStatus.className = 'file-status processing';
        
        // Read and validate file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.validateAndPreviewImport(importData, file);
            } catch (error) {
                fileStatus.textContent = 'Invalid JSON file format';
                fileStatus.className = 'file-status invalid';
                document.getElementById('importBtn').disabled = true;
                console.error('JSON parse error:', error);
            }
        };
        
        reader.onerror = () => {
            fileStatus.textContent = 'Error reading file';
            fileStatus.className = 'file-status invalid';
            document.getElementById('importBtn').disabled = true;
        };
        
        reader.readAsText(file);
    }

    validateAndPreviewImport(importData, file) {
        const fileStatus = document.getElementById('fileStatus');
        
        // Validate export format
        if (!this.isValidExportFormat(importData)) {
            fileStatus.textContent = 'Invalid export file format';
            fileStatus.className = 'file-status invalid';
            document.getElementById('importBtn').disabled = true;
            return;
        }
        
        // Store import data for later use
        this.pendingImportData = importData;
        
        // Show success status
        fileStatus.textContent = `Valid export file (${Math.round(file.size / 1024)} KB)`;
        fileStatus.className = 'file-status valid';
        
        // Enable import button
        document.getElementById('importBtn').disabled = false;
        
        // Show preview
        this.showImportPreview(importData);
    }

    isValidExportFormat(data) {
        // Check for required export info
        if (!data.exportInfo || !data.exportInfo.version || !data.exportInfo.source) {
            return false;
        }
        
        // Check that at least one data section exists
        if (!data.userBookmarks && !data.userSettings) {
            return false;
        }
        
        // Validate userBookmarks structure if present
        if (data.userBookmarks) {
            if (!data.userBookmarks.version || 
                !Array.isArray(data.userBookmarks.categories) ||
                typeof data.userBookmarks.bookmarksInExistingCategories !== 'object') {
                return false;
            }
        }
        
        return true;
    }

    showImportPreview(importData) {
        const preview = document.getElementById('importPreview');
        const summary = document.getElementById('importSummary');
        
        let html = '';
        
        // Export info
        html += `
            <div class="preview-item">
                <span class="preview-label">Export Date:</span>
                <span class="preview-value">${new Date(importData.exportInfo.exportDate).toLocaleString()}</span>
            </div>
        `;
        
        html += `
            <div class="preview-item">
                <span class="preview-label">Export Type:</span>
                <span class="preview-value">${this.getExportTypeLabel(importData.exportInfo.exportType)}</span>
            </div>
        `;
        
        if (importData.exportInfo.customNotes) {
            html += `
                <div class="preview-item">
                    <span class="preview-label">Notes:</span>
                    <span class="preview-value">${importData.exportInfo.customNotes}</span>
                </div>
            `;
        }
        
        // Content summary
        if (importData.userBookmarks) {
            const totalBookmarks = this.countBookmarksInExportData(importData.userBookmarks);
            const totalCategories = (importData.userBookmarks.categories || []).length;
            
            if (totalBookmarks > 0) {
                html += `
                    <div class="preview-item">
                        <span class="preview-label">Bookmarks to Import:</span>
                        <span class="preview-value highlight">${totalBookmarks}</span>
                    </div>
                `;
            }
            
            if (totalCategories > 0) {
                html += `
                    <div class="preview-item">
                        <span class="preview-label">Custom Categories:</span>
                        <span class="preview-value highlight">${totalCategories}</span>
                    </div>
                `;
            }
        }
        
        if (importData.userSettings) {
            const settingsCount = Object.keys(importData.userSettings).length;
            html += `
                <div class="preview-item">
                    <span class="preview-label">Settings to Import:</span>
                    <span class="preview-value highlight">${settingsCount} items</span>
                </div>
            `;
        }
        
        summary.innerHTML = html;
        preview.style.display = 'block';
        
        // Check for conflicts
        this.checkImportConflicts(importData);
    }

    checkImportConflicts(importData) {
        const conflicts = [];
        
        if (importData.userBookmarks) {
            // Check for category name conflicts
            if (importData.userBookmarks.categories) {
                importData.userBookmarks.categories.forEach(importCategory => {
                    // Check against existing user categories
                    const existingUserCategory = this.userBookmarks.categories.find(cat => 
                        cat.name.toLowerCase() === importCategory.name.toLowerCase()
                    );
                    
                    if (existingUserCategory) {
                        conflicts.push({
                            type: 'category',
                            message: `Category "${importCategory.name}" already exists`,
                            existing: existingUserCategory,
                            importing: importCategory
                        });
                    }
                });
            }
            
            // Check for bookmark URL conflicts
            const allImportBookmarks = this.getAllBookmarksFromImportData(importData.userBookmarks);
            allImportBookmarks.forEach(bookmark => {
                if (this.isDuplicateUrl(bookmark.url)) {
                    conflicts.push({
                        type: 'bookmark',
                        message: `Bookmark "${bookmark.name}" (${bookmark.url}) already exists`,
                        existing: this.findBookmarkByUrl(bookmark.url),
                        importing: bookmark
                    });
                }
            });
        }
        
        if (conflicts.length > 0) {
            this.showImportConflicts(conflicts);
        } else {
            document.getElementById('conflictSection').style.display = 'none';
        }
    }

    getAllBookmarksFromImportData(userBookmarks) {
        const allBookmarks = [];
        
        // Get bookmarks from custom categories
        if (userBookmarks.categories) {
            userBookmarks.categories.forEach(category => {
                allBookmarks.push(...category.bookmarks);
            });
        }
        
        // Get bookmarks from existing categories
        if (userBookmarks.bookmarksInExistingCategories) {
            Object.values(userBookmarks.bookmarksInExistingCategories).forEach(bookmarks => {
                allBookmarks.push(...bookmarks);
            });
        }
        
        return allBookmarks;
    }

    showImportConflicts(conflicts) {
        const conflictSection = document.getElementById('conflictSection');
        const conflictList = document.getElementById('conflictList');
        
        let html = '';
        
        conflicts.forEach(conflict => {
            html += `
                <div class="conflict-item">
                    <span class="conflict-icon">⚠️</span>
                    <span class="conflict-text">${conflict.message}</span>
                </div>
            `;
        });
        
        conflictList.innerHTML = html;
        conflictSection.style.display = 'block';
    }

    updateImportPreview() {
        // This method can be used to update preview based on conflict resolution choice
        // For now, it's a placeholder for future enhancements
    }

    performImport() {
        if (!this.pendingImportData) {
            this.showFormError('No import data available');
            return;
        }
        
        const conflictResolution = document.querySelector('input[name="conflictResolution"]:checked').value;
        
        try {
            // Create backup of current data
            this.createImportBackup();
            
            // Perform the import
            const importResult = this.executeImport(this.pendingImportData, conflictResolution);
            
            // Show success message
            this.hideImportModal();
            this.showSuccessMessage(`Import completed: ${importResult.bookmarksImported} bookmarks, ${importResult.categoriesImported} categories`);
            
            // Refresh the display
            this.refreshBookmarkDisplay();
            
        } catch (error) {
            console.error('Import failed:', error);
            this.showFormError('Import failed. Please try again.');
        }
    }

    createImportBackup() {
        // Create a backup of current user data before import
        const backup = {
            timestamp: Date.now(),
            userBookmarks: JSON.parse(JSON.stringify(this.userBookmarks)),
            favorites: [...this.favorites],
            recentVisits: [...this.recentVisits],
            theme: this.currentTheme,
            collapsedCategories: [...this.collapsedCategories],
            activeTags: [...this.activeTags],
            searchHistory: [...this.searchHistory],
            tagSectionExpanded: this.tagSectionExpanded
        };
        
        sessionStorage.setItem('bookmarks-import-backup', JSON.stringify(backup));
    }

    executeImport(importData, conflictResolution) {
        let bookmarksImported = 0;
        let categoriesImported = 0;
        
        // Import bookmarks
        if (importData.userBookmarks) {
            // Import custom categories
            if (importData.userBookmarks.categories) {
                importData.userBookmarks.categories.forEach(importCategory => {
                    const result = this.importCategory(importCategory, conflictResolution);
                    if (result.imported) {
                        categoriesImported++;
                        bookmarksImported += importCategory.bookmarks.length;
                    }
                });
            }
            
            // Import bookmarks in existing categories
            if (importData.userBookmarks.bookmarksInExistingCategories) {
                Object.entries(importData.userBookmarks.bookmarksInExistingCategories).forEach(([categoryId, bookmarks]) => {
                    bookmarks.forEach(bookmark => {
                        const result = this.importBookmarkToExistingCategory(bookmark, categoryId, conflictResolution);
                        if (result.imported) {
                            bookmarksImported++;
                        }
                    });
                });
            }
        }
        
        // Import settings
        if (importData.userSettings) {
            this.importSettings(importData.userSettings, conflictResolution);
        }
        
        // Save updated data
        this.saveUserBookmarks();
        
        return { bookmarksImported, categoriesImported };
    }

    importCategory(importCategory, conflictResolution) {
        const existingCategory = this.userBookmarks.categories.find(cat => 
            cat.name.toLowerCase() === importCategory.name.toLowerCase()
        );
        
        if (existingCategory) {
            switch (conflictResolution) {
                case 'skip':
                    return { imported: false, reason: 'skipped' };
                
                case 'overwrite':
                    // Replace existing category
                    const index = this.userBookmarks.categories.indexOf(existingCategory);
                    this.userBookmarks.categories[index] = { ...importCategory };
                    return { imported: true, reason: 'overwritten' };
                
                case 'rename':
                    // Import with new name
                    const newCategory = { 
                        ...importCategory, 
                        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        name: `${importCategory.name} (Imported)`
                    };
                    this.userBookmarks.categories.push(newCategory);
                    return { imported: true, reason: 'renamed' };
            }
        } else {
            // No conflict, import directly
            const newCategory = { 
                ...importCategory,
                id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            this.userBookmarks.categories.push(newCategory);
            return { imported: true, reason: 'new' };
        }
    }

    importBookmarkToExistingCategory(bookmark, categoryId, conflictResolution) {
        if (this.isDuplicateUrl(bookmark.url)) {
            switch (conflictResolution) {
                case 'skip':
                    return { imported: false, reason: 'skipped' };
                
                case 'overwrite':
                    // Remove existing bookmark and add new one
                    this.removeBookmarkByUrl(bookmark.url);
                    break;
                
                case 'rename':
                    // Import with modified name
                    bookmark = { ...bookmark, name: `${bookmark.name} (Imported)` };
                    break;
            }
        }
        
        // Add bookmark to category
        if (!this.userBookmarks.bookmarksInExistingCategories[categoryId]) {
            this.userBookmarks.bookmarksInExistingCategories[categoryId] = [];
        }
        
        this.userBookmarks.bookmarksInExistingCategories[categoryId].push({
            ...bookmark,
            isUserCreated: true,
            dateAdded: Date.now()
        });
        
        return { imported: true, reason: 'added' };
    }

    removeBookmarkByUrl(url) {
        // Remove from user categories
        this.userBookmarks.categories.forEach(category => {
            category.bookmarks = category.bookmarks.filter(bookmark => bookmark.url !== url);
        });
        
        // Remove from existing categories
        Object.keys(this.userBookmarks.bookmarksInExistingCategories).forEach(categoryId => {
            this.userBookmarks.bookmarksInExistingCategories[categoryId] = 
                this.userBookmarks.bookmarksInExistingCategories[categoryId].filter(bookmark => bookmark.url !== url);
        });
        
        // Remove from favorites
        this.favorites.delete(url);
        localStorage.setItem('bookmarks-favorites', JSON.stringify([...this.favorites]));
    }

    importSettings(settings, conflictResolution) {
        // Import favorites (merge with existing)
        if (settings.favorites) {
            settings.favorites.forEach(url => this.favorites.add(url));
            localStorage.setItem('bookmarks-favorites', JSON.stringify([...this.favorites]));
        }
        
        // Import recent visits (merge with existing, keeping most recent)
        if (settings.recentVisits) {
            const mergedVisits = [...this.recentVisits];
            settings.recentVisits.forEach(importVisit => {
                const existingIndex = mergedVisits.findIndex(visit => visit.url === importVisit.url);
                if (existingIndex >= 0) {
                    // Keep the more recent visit
                    if (importVisit.lastVisited > mergedVisits[existingIndex].lastVisited) {
                        mergedVisits[existingIndex] = importVisit;
                    }
                } else {
                    mergedVisits.push(importVisit);
                }
            });
            
            // Sort and limit
            this.recentVisits = mergedVisits
                .sort((a, b) => b.lastVisited - a.lastVisited)
                .slice(0, 15);
            localStorage.setItem('bookmarks-recent-visits', JSON.stringify(this.recentVisits));
        }
        
        // Import theme (only if not conflicting or overwrite is selected)
        if (settings.theme && (conflictResolution === 'overwrite' || this.currentTheme === 'eco-lime')) {
            this.changeTheme(settings.theme);
        }
        
        // Import search history (merge)
        if (settings.searchHistory) {
            const mergedHistory = [...new Set([...this.searchHistory, ...settings.searchHistory])];
            this.searchHistory = mergedHistory.slice(0, 10);
            localStorage.setItem('bookmarks-search-history', JSON.stringify(this.searchHistory));
        }
        
        // Import UI preferences
        if (settings.collapsedCategories) {
            settings.collapsedCategories.forEach(cat => this.collapsedCategories.add(cat));
            localStorage.setItem('bookmarks-collapsed', JSON.stringify([...this.collapsedCategories]));
        }
        
        if (settings.activeTags) {
            settings.activeTags.forEach(tag => this.activeTags.add(tag));
            localStorage.setItem('bookmarks-active-tags', JSON.stringify([...this.activeTags]));
        }
        
        if (typeof settings.tagSectionExpanded === 'boolean') {
            this.tagSectionExpanded = settings.tagSectionExpanded;
            localStorage.setItem('bookmarks-tag-section-expanded', this.tagSectionExpanded);
        }
    }

    // Settings Dropdown Functions
    toggleSettingsMenu() {
        const dropdown = document.getElementById('settingsDropdown');
        const isVisible = dropdown.style.display === 'block';
        
        if (isVisible) {
            this.hideSettingsDropdown();
        } else {
            this.showSettingsDropdown();
        }
    }

    showSettingsDropdown() {
        const dropdown = document.getElementById('settingsDropdown');
        dropdown.style.display = 'block';
    }

    hideSettingsDropdown() {
        const dropdown = document.getElementById('settingsDropdown');
        dropdown.style.display = 'none';
    }

    showBrowserImportInfo() {
        this.hideBackupDropdown();
        
        // Create info modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Browser Import</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <p>To import bookmarks from your browser:</p>
                    <ol style="margin: 16px 0; padding-left: 20px;">
                        <li>Run the PowerShell script: <code>Import-BrowserBookmarks.ps1</code></li>
                        <li>The script will extract bookmarks from Chrome and Edge</li>
                        <li>Copy the generated files to your BookMark Manager directory</li>
                        <li>Refresh this page to see your imported bookmarks</li>
                    </ol>
                    <p><strong>Note:</strong> The script creates <code>user-bookmarks.js</code> which should be placed in the same directory as this application.</p>
                    <div class="modal-actions">
                        <button type="button" class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Got it</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    viewLogs() {
        this.hideSettingsDropdown();
        
        // Get logs from localStorage and sessionStorage
        const logs = {
            'Recent Visits': this.recentVisits.length,
            'Search History': this.searchHistory.length,
            'Favorites': this.favorites.size,
            'User Categories': this.userBookmarks.categories.length,
            'User Bookmarks': Object.keys(this.userBookmarks.bookmarksInExistingCategories).length,
            'Active Tags': this.activeTags.size,
            'Current Theme': this.currentTheme
        };
        
        // Create logs modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">System Information</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <h4>Data Summary:</h4>
                    ${Object.entries(logs).map(([key, value]) => `
                        <div class="preview-item">
                            <span class="preview-label">${key}:</span>
                            <span class="preview-value">${value}</span>
                        </div>
                    `).join('')}
                    
                    <h4 style="margin-top: 20px;">Storage Usage:</h4>
                    <div class="preview-item">
                        <span class="preview-label">Local Storage:</span>
                        <span class="preview-value">${Math.round(JSON.stringify(localStorage).length / 1024)} KB</span>
                    </div>
                    <div class="preview-item">
                        <span class="preview-label">Session Storage:</span>
                        <span class="preview-value">${Math.round(JSON.stringify(sessionStorage).length / 1024)} KB</span>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    clearAllData() {
        this.hideSettingsDropdown();
        
        // Create confirmation modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">⚠️ Clear All Data</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <p><strong>Warning:</strong> This will permanently delete all your personal data including:</p>
                    <ul style="margin: 16px 0; padding-left: 20px;">
                        <li>Custom bookmarks and categories</li>
                        <li>Favorites</li>
                        <li>Recent visits</li>
                        <li>Search history</li>
                        <li>Theme preferences</li>
                        <li>UI settings</li>
                    </ul>
                    <p><strong>This action cannot be undone!</strong></p>
                    
                    <div class="form-group" style="margin-top: 20px;">
                        <label>
                            <input type="checkbox" id="confirmClear" style="margin-right: 8px;">
                            I understand this will delete all my personal data
                        </label>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button type="button" class="btn-primary" style="background-color: #dc2626;" 
                                onclick="if(document.getElementById('confirmClear').checked) { bookmarkApp.performClearAllData(); this.closest('.modal-overlay').remove(); }" 
                                id="clearDataBtn">Clear All Data</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Enable/disable clear button based on checkbox
        const checkbox = modal.querySelector('#confirmClear');
        const clearBtn = modal.querySelector('#clearDataBtn');
        checkbox.addEventListener('change', () => {
            clearBtn.disabled = !checkbox.checked;
            clearBtn.style.opacity = checkbox.checked ? '1' : '0.5';
        });
        clearBtn.disabled = true;
        clearBtn.style.opacity = '0.5';
    }

    performClearAllData() {
        // Clear all localStorage data
        const keysToRemove = [
            'bookmarks-theme',
            'bookmarks-favorites',
            'bookmarks-user-data',
            'bookmarks-recent-visits',
            'bookmarks-search-history',
            'bookmarks-active-tags',
            'bookmarks-collapsed',
            'bookmarks-tag-section-expanded'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Show success message and reload
        this.showSuccessMessage('All personal data has been cleared. Reloading page...');
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    }

    // Help System Functions
    showHelpModal() {
        const modal = document.getElementById('helpModal');
        
        // Generate help content dynamically from JSON data
        this.generateHelpContent();
        
        modal.style.display = 'flex';
        
        // Show overview section by default
        this.showHelpSection('overview');
    }

    hideHelpModal() {
        const modal = document.getElementById('helpModal');
        modal.style.display = 'none';
    }

    showHelp(section) {
        // Show help modal and navigate to specific section
        this.showHelpModal();
        this.showHelpSection(section);
    }

    generateHelpContent() {
        // Get help system data from bookmarks data
        const helpSystem = this.bookmarksData?.settings?.helpSystem;
        if (!helpSystem || !helpSystem.sections) {
            console.warn('Help system data not found');
            return;
        }

        // Generate navigation buttons
        const helpNavigation = document.querySelector('.help-navigation');
        if (helpNavigation) {
            helpNavigation.innerHTML = helpSystem.sections.map(section => 
                `<button class="help-nav-btn" onclick="bookmarkApp.showHelpSection('${section.id}')">${section.title}</button>`
            ).join('');
        }

        // Generate help sections
        const helpSections = document.querySelector('.help-sections');
        if (helpSections) {
            helpSections.innerHTML = helpSystem.sections.map(section => 
                this.generateHelpSectionHTML(section)
            ).join('');
        }
    }

    generateHelpSectionHTML(section) {
        let html = `<div id="help-${section.id}" class="help-section">`;
        html += `<h3>${section.title}</h3>`;
        
        // Add description
        if (section.content.description) {
            html += `<p>${section.content.description}</p>`;
        }

        // Add features list
        if (section.content.features) {
            html += '<ul>';
            section.content.features.forEach(feature => {
                html += `<li><strong>${feature.title}:</strong> ${feature.description}</li>`;
            });
            html += '</ul>';
        }

        // Add themes list (for themes section)
        if (section.content.themes) {
            html += '<ul>';
            section.content.themes.forEach(theme => {
                html += `<li><strong>${theme.name}:</strong> ${theme.description}</li>`;
            });
            html += '</ul>';
        }

        // Add examples (for search section)
        if (section.content.examples) {
            html += '<div class="help-example"><strong>Examples:</strong><br>';
            section.content.examples.forEach(example => {
                html += `• <code>${example.code}</code> - ${example.description}<br>`;
            });
            html += '</div>';
        }

        // Add best practices (for add bookmarks section)
        if (section.content.bestPractices) {
            html += '<div class="help-example"><strong>Best Practices:</strong><br>';
            section.content.bestPractices.forEach(practice => {
                html += `• ${practice}<br>`;
            });
            html += '</div>';
        }

        // Add keyboard shortcuts (for keyboard section)
        if (section.content.shortcuts) {
            html += '<div class="keyboard-shortcuts">';
            section.content.shortcuts.forEach(shortcut => {
                html += '<div class="shortcut-item">';
                shortcut.keys.forEach((key, index) => {
                    if (index > 0) html += ' + ';
                    html += `<kbd>${key}</kbd>`;
                });
                html += `<span>${shortcut.description}</span>`;
                html += '</div>';
            });
            html += '</div>';
        }

        // Add tips
        if (section.content.tips) {
            section.content.tips.forEach(tip => {
                html += `<div class="help-tip"><strong>${tip.icon} Tip:</strong> ${tip.text}</div>`;
            });
        }

        html += '</div>';
        return html;
    }

    showHelpSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.help-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.help-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`help-${sectionId}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Activate corresponding nav button
        const navButtons = document.querySelectorAll('.help-nav-btn');
        navButtons.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(`'${sectionId}'`)) {
                btn.classList.add('active');
            }
        });
    }

    // Enhanced Help Request System with Type Dispatcher
    requestHelp(serviceName, serviceUrl, serviceDescription, event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Find the bookmark to check for support type and help info
        const bookmark = this.findBookmarkByUrl(serviceUrl);
        
        if (bookmark) {
            // Dispatch based on support type
            this.dispatchHelpByType(bookmark);
        } else {
            // Fall back to generic email help
            this.showGenericHelpEmail(serviceName, serviceUrl, serviceDescription);
        }
    }

    // Help Type Dispatcher
    dispatchHelpByType(bookmark) {
        const supportType = bookmark.supportType || 'help'; // Default to help if not specified
        
        switch (supportType) {
            case 'help':
                this.showHelpModal(bookmark);
                break;
            case 'split-help':
                this.showSplitHelpModal(bookmark);
                break;
            case 'approval-process':
                this.showApprovalProcessModal(bookmark);
                break;
            // Legacy support for old types
            case 'ticket':
                this.showSplitHelpModal(bookmark);
                break;
            case 'popup':
                this.showHelpModal(bookmark);
                break;
            case 'none':
                this.showHelpModal(bookmark);
                break;
            default:
                // Unknown support type, fall back to help
                console.warn(`Unknown support type: ${supportType}, falling back to help`);
                this.showHelpModal(bookmark);
        }
    }

    // New Help Modal Types

    // 1. Help Modal (Self-Service Popup)
    showHelpModal(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">❓ ${bookmark.name} - Help</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <div class="form-group">
                        <h4>📋 Tool Information:</h4>
                        <p><strong>Name:</strong> ${bookmark.name}</p>
                        <p><strong>URL:</strong> <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">${bookmark.url}</a></p>
                        <p><strong>Description:</strong> ${bookmark.description}</p>
                        ${bookmark.tags && bookmark.tags.length > 0 ? `<p><strong>Tags:</strong> ${bookmark.tags.join(', ')}</p>` : ''}
                    </div>
                    
                    <div class="form-group">
                        <h4>🛠️ Self-Service Help:</h4>
                        <p>This is a self-service tool. For assistance, you can:</p>
                        <ul>
                            <li>📖 Check the tool's built-in help or documentation</li>
                            <li>🌐 Visit the tool's website for user guides</li>
                            <li>📧 Contact IT support if you encounter technical issues</li>
                        </ul>
                    </div>
                    
                    <div class="form-group">
                        <h4>📞 Need More Help?</h4>
                        <p>If you need additional assistance, contact IT support with details about your specific issue.</p>
                        <div class="action-buttons-group">
                            <button class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Tool</button>
                            <button class="btn-secondary" onclick="bookmarkApp.showGenericHelpEmail('${bookmark.name}', '${bookmark.url}', '${bookmark.description}'); this.closest('.modal-overlay').remove();">📧 Contact IT</button>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Tool</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 2. Split Help Modal (2 Tabs: Self-Service + Support Ticket)
    showSplitHelpModal(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content knowledge-base-modal">
                <div class="modal-header">
                    <h2 class="modal-title">🛠️ ${bookmark.name} - Help & Support</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="knowledge-base-tabs">
                        <button class="kb-tab-btn active" onclick="bookmarkApp.showHelpTab(this, 'self-service')">🚀 Self Service</button>
                        <button class="kb-tab-btn" onclick="bookmarkApp.showHelpTab(this, 'support-ticket')">🎫 Support Ticket</button>
                    </div>
                    
                    <div class="kb-tab-content split-help-tab-content">
                        <!-- Self Service Tab -->
                        <div id="help-self-service" class="kb-tab-panel active">
                            <div class="form-group">
                                <div class="split-help-tool-info">
                                    <h4>📋 Tool Information</h4>
                                    <p><strong>Name:</strong> ${bookmark.name}</p>
                                    <p><strong>URL:</strong> <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">${bookmark.url}</a></p>
                                    <p><strong>Description:</strong> ${bookmark.description}</p>
                                    ${bookmark.tags && bookmark.tags.length > 0 ? `<p><strong>Tags:</strong> ${bookmark.tags.join(', ')}</p>` : ''}
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <h4>🚀 Self-Service Options</h4>
                                <p>Try these resources first to resolve your issue quickly and independently:</p>
                                <div class="self-service-options">
                                    <div class="service-option">
                                        <h5>🌐 Tool Website</h5>
                                        <p>Visit the official website for comprehensive documentation, tutorials, and user guides.</p>
                                        <button class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Website</button>
                                    </div>
                                    <div class="service-option">
                                        <h5>📚 Local Documentation</h5>
                                        <p>Browse our curated documentation library and quick reference guides for immediate assistance.</p>
                                        <button class="btn-primary" onclick="window.open('./Docs/', '_blank')">📚 Open Docs</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="split-help-tips">
                                    <h4>💡 Quick Tips</h4>
                                    <ul>
                                        <li>Check the tool's built-in help section or FAQ first</li>
                                        <li>Look for troubleshooting guides in the documentation</li>
                                        <li>Search for your specific issue or error message online</li>
                                        <li>Check if there are video tutorials or training materials available</li>
                                        <li>Try clearing your browser cache if experiencing loading issues</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Support Ticket Tab -->
                        <div id="help-support-ticket" class="kb-tab-panel">
                            <div class="form-group">
                                <h4>🎫 Create Support Ticket</h4>
                                <p>If self-service options don't resolve your issue, create a support ticket for personalized assistance from our IT team.</p>
                            </div>
                            
                            <div class="form-group">
                                <h4>📧 Support Request Email</h4>
                                <p>Use this pre-filled template to ensure you provide all necessary information:</p>
                                <div class="support-email-template">
                                    <div class="email-template-header">
                                        <strong>To:</strong> ${this.getDefaultSupportEmail()}<br>
                                        <strong>Subject:</strong> Support Request - ${bookmark.name}
                                    </div>
                                    <div class="email-template-body">
                                        <strong>Email Body:</strong>
                                        <textarea id="splitHelpEmailBody" class="support-email-body" rows="15" style="width: 100%; font-family: monospace; font-size: 12px; resize: vertical;">${this.generateSplitHelpSupportTemplate(bookmark)}</textarea>
                                    </div>
                                    <div class="email-template-actions">
                                        <button class="btn-primary" onclick="bookmarkApp.sendSplitHelpSupportEmail('${bookmark.name}', '${bookmark.url}')">📧 Create Support Ticket</button>
                                        <button class="btn-secondary" onclick="bookmarkApp.copySplitHelpSupportTemplate('${bookmark.name}')">📋 Copy Template</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="split-help-tips">
                                    <h4>📋 Before Creating a Ticket</h4>
                                    <ul>
                                        <li>Ensure you've tried the self-service options above</li>
                                        <li>Check if colleagues in your team have encountered the same issue</li>
                                        <li>Gather any error messages, screenshots, or relevant details</li>
                                        <li>Note exactly what you were trying to accomplish when the issue occurred</li>
                                        <li>Include your browser type and version if experiencing web-based issues</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Tool</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 3. Approval Process Modal (2 Tabs: Approval Info + Request Ticket)
    showApprovalProcessModal(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        const approvalInfo = bookmark.approvalInfo || {
            approver: 'IT Manager',
            requirements: ['Business justification', 'Manager approval'],
            process: 'Submit request with business case and manager approval',
            estimatedTime: '3-5 business days'
        };
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">🔒 ${bookmark.name} - Approval Required</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="knowledge-base-tabs">
                        <button class="kb-tab-btn active" onclick="bookmarkApp.showHelpTab(this, 'approval-info')">📋 Approval Information</button>
                        <button class="kb-tab-btn" onclick="bookmarkApp.showHelpTab(this, 'request-ticket')">🎫 Request Access</button>
                    </div>
                    
                    <div class="kb-tab-content">
                        <!-- Approval Information Tab -->
                        <div id="help-approval-info" class="kb-tab-panel active">
                            <div class="form-group">
                                <h4>📋 Tool Information:</h4>
                                <p><strong>Name:</strong> ${bookmark.name}</p>
                                <p><strong>URL:</strong> <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">${bookmark.url}</a></p>
                                <p><strong>Description:</strong> ${bookmark.description}</p>
                                ${bookmark.tags && bookmark.tags.length > 0 ? `<p><strong>Tags:</strong> ${bookmark.tags.join(', ')}</p>` : ''}
                            </div>
                            
                            <div class="form-group">
                                <h4>🔒 Approval Required</h4>
                                <div style="background-color: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 6px; padding: 12px; color: #856404;">
                                    <strong>⚠️ Access Restriction</strong><br>
                                    This tool requires approval before access can be granted. Please review the requirements below.
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <h4>👤 Approver:</h4>
                                <p><strong>${approvalInfo.approver}</strong></p>
                            </div>
                            
                            <div class="form-group">
                                <h4>📋 Requirements:</h4>
                                <ul>
                                    ${approvalInfo.requirements.map(req => `<li>${req}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="form-group">
                                <h4>🔄 Process:</h4>
                                <p>${approvalInfo.process}</p>
                            </div>
                            
                            <div class="form-group">
                                <h4>⏱️ Estimated Time:</h4>
                                <p>${approvalInfo.estimatedTime}</p>
                            </div>
                            
                            <div class="form-group">
                                <h4>💡 Tips for Approval:</h4>
                                <ul>
                                    <li>Provide clear business justification</li>
                                    <li>Include your manager in the request</li>
                                    <li>Explain how this tool will benefit your work</li>
                                    <li>Be specific about what access you need</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Request Ticket Tab -->
                        <div id="help-request-ticket" class="kb-tab-panel">
                            <div class="form-group">
                                <h4>🎫 Request Access</h4>
                                <p>Submit an access request for <strong>${bookmark.name}</strong>. Make sure to include all required information.</p>
                            </div>
                            
                            <div class="form-group">
                                <h4>📧 Access Request Email</h4>
                                <div class="approval-process-email-template">
                                    <div class="email-template-header">
                                        <strong>To:</strong> ${this.getDefaultSupportEmail()}<br>
                                        <strong>Subject:</strong> Access Request - ${bookmark.name}
                                    </div>
                                    <div class="email-template-body">
                                        <strong>Email Body:</strong>
                                        <textarea id="approvalProcessEmailBody" class="support-email-body" rows="15" style="width: 100%; font-family: monospace; font-size: 12px; resize: vertical;">${this.generateApprovalProcessTemplate(bookmark, approvalInfo)}</textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <h4>👤 Manager CC (Required)</h4>
                                <p>Your manager must be copied on approval requests:</p>
                                <div class="manager-cc-input">
                                    <input type="email" id="managerEmail" placeholder="manager@company.com" style="width: 100%; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.9375rem; background-color: var(--card-background); color: var(--text-primary); transition: border-color 0.3s ease; font-family: inherit; margin-bottom: 8px;">
                                    <small style="color: var(--text-secondary); font-size: 0.8125rem; line-height: 1.4;">Enter your manager's email address - they will be CC'd on the request</small>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="email-template-actions">
                                    <button class="btn-primary" onclick="bookmarkApp.sendApprovalProcessEmailWithManager('${bookmark.name}', '${bookmark.url}')">📧 Send Request</button>
                                    <button class="btn-secondary" onclick="bookmarkApp.copyApprovalProcessTemplate('${bookmark.name}')">📋 Copy Template</button>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <div class="approval-process-tips">
                                    <h4>💡 Tips for Success</h4>
                                    <ul>
                                        <li>Provide clear business justification for why you need this tool</li>
                                        <li>Explain specifically how you plan to use it in your work</li>
                                        <li>Specify how long you need access (temporary project or ongoing)</li>
                                        <li>Mention why existing tools or alternatives won't meet your needs</li>
                                        <li>Include your manager's approval and contact information</li>
                                        <li>Be specific about what level of access you require</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <div class="action-buttons-group">
                            <button type="button" class="btn-primary" onclick="bookmarkApp.sendApprovalProcessEmailWithManager('${bookmark.name}', '${bookmark.url}')">🎫 Submit Request</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Helper functions for the new help system
    generateSplitHelpSupportTemplate(bookmark) {
        const browserInfo = this.getBrowserInfo();
        const hostname = this.getHostname();
        const timestamp = new Date().toLocaleString();
        
        return `Hello IT Support,

I need assistance with ${bookmark.name} and have tried the self-service options.

Tool Information:
- Name: ${bookmark.name}
- URL: ${bookmark.url}
- Description: ${bookmark.description}

Self-Service Attempts:
☐ Checked the tool's built-in help
☐ Visited the tool's website documentation
☐ Reviewed local documentation
☐ Searched for solutions online

Issue Description:
[Please describe your specific issue here]

What I was trying to accomplish:
[Describe your goal or task]

Steps I've already tried:
1. [First step you attempted]
2. [Second step you attempted]
3. [Third step you attempted]

Error messages (if any):
[Copy any error messages you received]

System Information:
- Computer Name: ${hostname}
- Browser: ${browserInfo}
- Date/Time: ${timestamp}
- User: [Your Name]

Additional Information:
[Any other relevant details or screenshots]

Thank you for your assistance.

Best regards,
[Your Name]
[Your Email]
[Your Department]`;
    }

    generateApprovalProcessTemplate(bookmark, approvalInfo) {
        const browserInfo = this.getBrowserInfo();
        const hostname = this.getHostname();
        const timestamp = new Date().toLocaleString();
        
        return `Hello IT Support,

I am requesting access to ${bookmark.name} and understand that approval is required.

Tool Information:
- Name: ${bookmark.name}
- URL: ${bookmark.url}
- Description: ${bookmark.description}

Business Justification:
[Please provide a detailed business justification for why you need access to this tool]

Use Case:
[Explain specifically how you plan to use this tool in your work]

Duration of Access:
[How long do you need access? Temporary project or ongoing work?]

Manager Approval:
- Manager Name: [Your Manager's Name]
- Manager Email: [Manager's Email - will be CC'd]
- Manager has been informed: [Yes/No]

Project/Department Information:
- Department: [Your Department]
- Project Name: [If applicable]
- Cost Center: [If applicable]

Alternative Solutions Considered:
[Explain why existing tools or alternatives won't meet your needs]

Required Access Level:
[Specify what level of access you need - read-only, full access, admin, etc.]

System Information:
- Computer Name: ${hostname}
- Browser: ${browserInfo}
- Date/Time: ${timestamp}
- User: [Your Name]

I understand that:
- This request requires approval from ${approvalInfo.approver}
- The estimated processing time is ${approvalInfo.estimatedTime}
- I must comply with all company policies regarding tool usage

Thank you for processing this request.

Best regards,
[Your Name]
[Your Email]
[Your Phone Number]
[Your Department]`;
    }

    sendSplitHelpSupportEmail(toolName, toolUrl) {
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Support Request - ${toolName}`;
        const body = document.getElementById('splitHelpEmailBody')?.value || this.generateSplitHelpSupportTemplate({ name: toolName, url: toolUrl, description: `Support request for ${toolName}` });
        
        const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    copySplitHelpSupportTemplate(toolName) {
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Support Request - ${toolName}`;
        const bookmark = { name: toolName, url: '', description: `Support request for ${toolName}` };
        const body = this.generateSplitHelpSupportTemplate(bookmark);
        
        const emailText = `To: ${supportEmail}\nSubject: ${subject}\n\n${body}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailText).then(() => {
                this.showSuccessMessage('Support template copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy to clipboard:', err);
                this.fallbackCopyToClipboard(emailText);
            });
        } else {
            this.fallbackCopyToClipboard(emailText);
        }
    }

    sendApprovalProcessEmail(toolName, toolUrl) {
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Access Request - ${toolName}`;
        const body = document.getElementById('approvalProcessEmailBody')?.value || this.generateApprovalProcessTemplate({ name: toolName, url: toolUrl, description: `Access request for ${toolName}` }, { approver: 'IT Manager', requirements: ['Business justification'], process: 'Standard approval process', estimatedTime: '3-5 business days' });
        
        const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    sendApprovalProcessEmailWithManager(toolName, toolUrl) {
        const managerEmail = document.getElementById('managerEmail')?.value.trim();
        
        if (!managerEmail) {
            alert('Please enter your manager\'s email address before submitting the request.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(managerEmail)) {
            alert('Please enter a valid email address for your manager.');
            return;
        }
        
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Access Request - ${toolName}`;
        const bookmark = { name: toolName, url: toolUrl, description: `Access request for ${toolName}` };
        const approvalInfo = { approver: 'IT Manager', requirements: ['Business justification'], process: 'Standard approval process', estimatedTime: '3-5 business days' };
        const body = this.generateApprovalProcessTemplate(bookmark, approvalInfo);
        
        const mailtoLink = `mailto:${supportEmail}?cc=${encodeURIComponent(managerEmail)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    copyApprovalProcessTemplate(toolName) {
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Access Request - ${toolName}`;
        const bookmark = { name: toolName, url: '', description: `Access request for ${toolName}` };
        const approvalInfo = { approver: 'IT Manager', requirements: ['Business justification'], process: 'Standard approval process', estimatedTime: '3-5 business days' };
        const body = this.generateApprovalProcessTemplate(bookmark, approvalInfo);
        
        const emailText = `To: ${supportEmail}\nSubject: ${subject}\n\n${body}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailText).then(() => {
                this.showSuccessMessage('Approval request template copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy to clipboard:', err);
                this.fallbackCopyToClipboard(emailText);
            });
        } else {
            this.fallbackCopyToClipboard(emailText);
        }
    }

    // Show step-by-step ticket modal for guided ticket creation
    showStepByStepTicketModal(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay step-by-step-modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">🎫 Support Ticket - ${bookmark.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <div class="form-group">
                        <h4>📋 About this tool:</h4>
                        <p><strong>Name:</strong> ${bookmark.name}</p>
                        <p><strong>URL:</strong> ${bookmark.url}</p>
                        <p><strong>Description:</strong> ${bookmark.description}</p>
                    </div>
                    
                    <div class="form-group">
                        <h4>🎫 Support Process:</h4>
                        <p>This tool requires IT support ticket for assistance. Click the button below to create a support request.</p>
                    </div>
                    
                    <div class="form-group">
                        <h4>📧 Support Request Email</h4>
                        <div class="support-email-template">
                            <div class="email-template-header">
                                <strong>To:</strong> ${this.getDefaultSupportEmail()}<br>
                                <strong>Subject:</strong> Support Request - ${bookmark.name}
                            </div>
                            <div class="email-template-body">
                                <strong>Email Body:</strong>
                                <textarea readonly class="support-email-body">${this.generateBasicSupportTemplate(bookmark)}</textarea>
                            </div>
                            <div class="email-template-actions">
                                <button class="btn-primary" onclick="bookmarkApp.sendBasicSupportEmail('${bookmark.name}', '${bookmark.url}')">📧 Create Support Ticket</button>
                                <button class="btn-secondary" onclick="bookmarkApp.copyBasicSupportTemplate('${bookmark.name}')">📋 Copy Template</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="bookmarkApp.sendBasicSupportEmail('${bookmark.name}', '${bookmark.url}')">🎫 Create Ticket</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Show basic help modal for simple popup help
    showBasicHelpModal(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">❓ ${bookmark.name} - Help</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <div class="form-group">
                        <h4>📋 Tool Information:</h4>
                        <p><strong>Name:</strong> ${bookmark.name}</p>
                        <p><strong>URL:</strong> <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">${bookmark.url}</a></p>
                        <p><strong>Description:</strong> ${bookmark.description}</p>
                        ${bookmark.tags && bookmark.tags.length > 0 ? `<p><strong>Tags:</strong> ${bookmark.tags.join(', ')}</p>` : ''}
                    </div>
                    
                    <div class="form-group">
                        <h4>🛠️ Getting Help:</h4>
                        <p>For assistance with this tool, you can:</p>
                        <ul>
                            <li>📖 Check the tool's built-in help or documentation</li>
                            <li>🌐 Visit the tool's website for user guides</li>
                            <li>📧 Contact IT support if you encounter technical issues</li>
                        </ul>
                    </div>
                    
                    <div class="form-group">
                        <h4>📞 Support Options:</h4>
                        <div class="action-buttons-group">
                            <button class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Tool</button>
                            <button class="btn-secondary" onclick="bookmarkApp.showGenericHelpEmail('${bookmark.name}', '${bookmark.url}', '${bookmark.description}'); this.closest('.modal-overlay').remove();">📧 Contact Support</button>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Tool</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Show no support available modal
    showNoSupportModal(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">ℹ️ ${bookmark.name} - Information</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <div class="form-group">
                        <h4>📋 Tool Information:</h4>
                        <p><strong>Name:</strong> ${bookmark.name}</p>
                        <p><strong>URL:</strong> <a href="${bookmark.url}" target="_blank" rel="noopener noreferrer">${bookmark.url}</a></p>
                        <p><strong>Description:</strong> ${bookmark.description}</p>
                        ${bookmark.tags && bookmark.tags.length > 0 ? `<p><strong>Tags:</strong> ${bookmark.tags.join(', ')}</p>` : ''}
                    </div>
                    
                    <div class="form-group">
                        <h4>ℹ️ Support Status:</h4>
                        <div style="background-color: rgba(var(--info-color), 0.1); border: 1px solid var(--info-color); border-radius: 6px; padding: 12px; color: var(--info-color);">
                            <strong>📰 Information Resource</strong><br>
                            This is an informational resource that typically doesn't require technical support. The content is self-contained and designed for independent use.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4>🔗 Access:</h4>
                        <p>Click the button below to access this resource directly:</p>
                        <div class="action-buttons-group">
                            <button class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Resource</button>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Resource</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Helper functions for basic support
    getDefaultSupportEmail() {
        const helpConfig = this.bookmarksData?.settings?.helpDesk;
        return helpConfig?.defaultEmail || 'it-support@company.com';
    }

    generateBasicSupportTemplate(bookmark) {
        const browserInfo = this.getBrowserInfo();
        const hostname = this.getHostname();
        const timestamp = new Date().toLocaleString();
        const ipAddress = this.getLocalIPAddress();
        const screenResolution = this.getScreenResolution();
        const userAgent = navigator.userAgent;
        
        return `Hello IT Support,

I need assistance with the following tool:

Tool Information:
- Name: ${bookmark.name}
- URL: ${bookmark.url}
- Description: ${bookmark.description}

Issue Description:
[Please describe your issue or question here]

What I was trying to do:
[Describe what you were attempting when the issue occurred]

Error Messages (if any):
[Copy any error messages you received]

Steps to Reproduce:
1. [What i tried]
2. [What happened]

System Information:
- Computer Name/Hostname: ${hostname}
- User: [Your Name/Username]
- Department: [Your Department]
- Location: [Your Office Location]
- Browser: ${browserInfo}
- Screen Resolution: ${screenResolution}
- Local IP: ${ipAddress}
- Date/Time: ${timestamp}
- Operating System: ${this.getOperatingSystem()}

Network Information:
- Connected to: [WiFi/Ethernet]
- VPN Status: [Connected/Disconnected - if applicable]

Business Impact:
- Priority: [Low/Medium/High/Critical]
- Urgency: [How soon do you need this resolved?]
- Business Justification: [Why do you need access to this tool?]

Additional Information:
[Any other relevant details, screenshots, or context]

Technical Details (for IT use):
User Agent: ${userAgent}

Thank you for your assistance.

Best regards,
[Your Name]
[Your Email]
[Your Phone Number]`;
    }

    sendBasicSupportEmail(toolName, toolUrl) {
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Support Request - ${toolName}`;
        const bookmark = { name: toolName, url: toolUrl, description: `Support request for ${toolName}` };
        const body = this.generateBasicSupportTemplate(bookmark);
        
        const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    copyBasicSupportTemplate(toolName) {
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Support Request - ${toolName}`;
        const bookmark = { name: toolName, url: '', description: `Support request for ${toolName}` };
        const body = this.generateBasicSupportTemplate(bookmark);
        
        const emailText = `To: ${supportEmail}\nSubject: ${subject}\n\n${body}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailText).then(() => {
                this.showSuccessMessage('Support template copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy to clipboard:', err);
                this.fallbackCopyToClipboard(emailText);
            });
        } else {
            this.fallbackCopyToClipboard(emailText);
        }
    }

    // Show tool-specific help modal
    showToolHelpModal(bookmark) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        const helpInfo = bookmark.helpInfo;
        const accessTypeIcon = this.getAccessTypeIcon(helpInfo.accessProcess);
        
        modal.innerHTML = `
            <div class="modal-content knowledge-base-modal">
                <div class="modal-header">
                    <h2 class="modal-title">${accessTypeIcon} ${bookmark.name} - Help & Support</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="knowledge-base-tabs">
                        <button class="kb-tab-btn active" onclick="bookmarkApp.showHelpTab(this, 'access-request')">🔐 Access Request</button>
                        <button class="kb-tab-btn" onclick="bookmarkApp.showHelpTab(this, 'support')">🛠️ Support</button>
                        ${helpInfo.knowledgeBase ? `<button class="kb-tab-btn" onclick="bookmarkApp.showHelpTab(this, 'training')">📚 Training</button>` : ''}
                        ${helpInfo.knowledgeBase ? `<button class="kb-tab-btn" onclick="bookmarkApp.showHelpTab(this, 'resources')">📖 Resources</button>` : ''}
                    </div>
                    
                    <div class="kb-tab-content">
                        <!-- Access Request Tab -->
                        <div id="help-access-request" class="kb-tab-panel active">
                            <div class="form-group">
                                <h4>📋 What this tool does:</h4>
                                <p>${helpInfo.description}</p>
                                <p><strong>🎯 Purpose:</strong> ${helpInfo.purpose}</p>
                                <p><strong>🔐 Access Level:</strong> ${helpInfo.accessLevel}</p>
                            </div>
                            
                            ${helpInfo.requirements ? `
                            <div class="form-group">
                                <h4>⚠️ Requirements:</h4>
                                <ul>
                                    ${helpInfo.requirements.map(req => `<li>${req}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            
                            <div class="form-group">
                                <h4>${this.getAccessProcessTitle(helpInfo.accessProcess)} Access Process:</h4>
                                <p><strong>⏱️ Estimated Time:</strong> ${helpInfo.estimatedTime}</p>
                                ${this.generateContactMethodHTML(helpInfo.contactMethod, bookmark)}
                            </div>
                            
                            ${helpInfo.approvalProcess ? `
                            <div class="form-group">
                                <h4>📋 Process:</h4>
                                <p>${helpInfo.approvalProcess}</p>
                            </div>
                            ` : ''}
                            
                            ${helpInfo.restrictions || helpInfo.renewalRequired || helpInfo.additionalInfo ? `
                            <div class="form-group">
                                <h4>ℹ️ Additional Information:</h4>
                                ${helpInfo.restrictions ? `<p><strong>Restrictions:</strong> ${helpInfo.restrictions}</p>` : ''}
                                ${helpInfo.renewalRequired ? `<p><strong>Renewal:</strong> ${helpInfo.renewalRequired}</p>` : ''}
                                ${helpInfo.additionalInfo ? `<p>${helpInfo.additionalInfo}</p>` : ''}
                            </div>
                            ` : ''}
                            
                            ${helpInfo.usageNotes ? `
                            <div class="form-group">
                                <h4>💡 Usage Notes:</h4>
                                <ul>
                                    ${helpInfo.usageNotes.map(note => `<li>${note}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- Support Tab -->
                        <div id="help-support" class="kb-tab-panel">
                            <div class="form-group">
                                <h4>🛠️ Technical Support</h4>
                                <p>Need help with using <strong>${bookmark.name}</strong>? Get technical support for issues, troubleshooting, and general assistance.</p>
                            </div>
                            
                            <div class="form-group">
                                <h4>📧 Support Request Email</h4>
                                <p>Use this template to request technical support:</p>
                                <div class="support-email-template">
                                    <div class="email-template-header">
                                        <strong>To:</strong> ${this.getSupportEmail(helpInfo)}<br>
                                        <strong>Subject:</strong> Technical Support Request - ${bookmark.name}
                                    </div>
                                    <div class="email-template-body">
                                        <strong>Email Body:</strong>
                                        <textarea readonly class="support-email-body">${this.generateSupportEmailTemplate(bookmark, helpInfo)}</textarea>
                                    </div>
                                    <div class="email-template-actions">
                                        <button class="btn-primary" onclick="bookmarkApp.sendSupportEmail('${bookmark.name}', '${bookmark.url}', '${this.getSupportEmail(helpInfo)}')">📧 Send Support Email</button>
                                        <button class="btn-secondary" onclick="bookmarkApp.copySupportEmailTemplate('${bookmark.name}', '${this.getSupportEmail(helpInfo)}')">📋 Copy Template</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <h4>🔧 Common Support Topics</h4>
                                <div class="support-topics">
                                    <div class="support-topic-item">
                                        <strong>🔑 Login Issues</strong>
                                        <p>Problems accessing the tool, password resets, authentication errors</p>
                                    </div>
                                    <div class="support-topic-item">
                                        <strong>⚡ Performance Issues</strong>
                                        <p>Slow loading, timeouts, browser compatibility problems</p>
                                    </div>
                                    <div class="support-topic-item">
                                        <strong>🔧 Feature Questions</strong>
                                        <p>How to use specific features, configuration help, best practices</p>
                                    </div>
                                    <div class="support-topic-item">
                                        <strong>🐛 Bug Reports</strong>
                                        <p>Unexpected behavior, errors, missing functionality</p>
                                    </div>
                                    <div class="support-topic-item">
                                        <strong>📊 Data Issues</strong>
                                        <p>Missing data, incorrect information, export/import problems</p>
                                    </div>
                                </div>
                            </div>
                            
                            ${this.generateSupportContactInfo(helpInfo)}
                        </div>
                        
                        ${helpInfo.knowledgeBase ? this.generateKnowledgeBaseTabsHTML(helpInfo.knowledgeBase) : ''}
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <div class="action-buttons-group">
                            ${this.generateActionButton(helpInfo.contactMethod, bookmark)}
                            <button type="button" class="btn-primary support-btn" onclick="bookmarkApp.sendSupportEmail('${bookmark.name}', '${bookmark.url}', '${this.getSupportEmail(helpInfo)}')">🛠️ Get Support</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    getAccessTypeIcon(accessProcess) {
        const icons = {
            'meeting': '📅',
            'email': '📧',
            'phone': '📞',
            'self-service': '🚀',
            'complex': '🔒'
        };
        return icons[accessProcess] || '❓';
    }

    getAccessProcessTitle(accessProcess) {
        const titles = {
            'meeting': '📅 Meeting Required',
            'email': '📧 Email Ticket',
            'phone': '📞 Phone Call Required',
            'self-service': '🚀 Self-Service',
            'complex': '🔄 Multi-Step'
        };
        return titles[accessProcess] || '❓ Access';
    }

    generateContactMethodHTML(contactMethod, bookmark) {
        switch (contactMethod.type) {
            case 'meeting':
                return `
                    <div class="contact-method-box">
                        <h5>📞 Schedule Security Meeting</h5>
                        <p><strong>Contact:</strong> ${contactMethod.contact}</p>
                        <p><strong>Available:</strong> ${contactMethod.availableSlots.join(', ')}</p>
                        <div class="contact-actions">
                            <button class="btn-primary" onclick="bookmarkApp.initiateEmailContact('${contactMethod.email}', '${contactMethod.meetingSubject}', '${bookmark.name}')">📧 Email Request</button>
                            <button class="btn-secondary" onclick="window.location.href='tel:${contactMethod.phone}'">📞 Call Now</button>
                        </div>
                    </div>
                `;
            
            case 'email':
                return `
                    <div class="contact-method-box">
                        <h5>📨 Send Access Request Email</h5>
                        <p><strong>To:</strong> ${contactMethod.email}</p>
                        <p><strong>Contact:</strong> ${contactMethod.contact}</p>
                        <div class="contact-actions">
                            <button class="btn-primary" onclick="bookmarkApp.sendTemplatedEmail('${contactMethod.email}', '${contactMethod.ticketSubject}', '${contactMethod.ticketTemplate}', '${bookmark.name}')">📝 Send Email</button>
                        </div>
                    </div>
                `;
            
            case 'phone':
                return `
                    <div class="contact-method-box">
                        <h5>📞 Call Network Operations Center</h5>
                        <p><strong>Phone:</strong> ${contactMethod.phone}${contactMethod.extension ? ` ext. ${contactMethod.extension}` : ''}</p>
                        <p><strong>Hours:</strong> ${contactMethod.hours}</p>
                        ${contactMethod.emergencyPhone ? `<p><strong>Emergency:</strong> ${contactMethod.emergencyPhone} (24/7)</p>` : ''}
                        ${contactMethod.callScript ? `
                        <div class="call-script">
                            <h6>💬 What to say:</h6>
                            <p><em>"${contactMethod.callScript}"</em></p>
                        </div>
                        ` : ''}
                        <div class="contact-actions">
                            <button class="btn-primary" onclick="window.location.href='tel:${contactMethod.phone}'">📞 Call Now</button>
                            ${contactMethod.callScript ? `<button class="btn-secondary" onclick="bookmarkApp.copyToClipboard('${contactMethod.callScript}')">📋 Copy Script</button>` : ''}
                        </div>
                    </div>
                `;
            
            case 'self-service':
                return `
                    <div class="contact-method-box">
                        <h5>✅ Ready to Use</h5>
                        <p>${contactMethod.message}</p>
                        ${contactMethod.supportNote ? `<p><strong>Support:</strong> ${contactMethod.supportNote}</p>` : ''}
                        <div class="contact-actions">
                            <button class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">🌐 Open Tool</button>
                            ${contactMethod.supportContact ? `<button class="btn-secondary" onclick="window.location.href='mailto:${contactMethod.supportContact}'">📧 Contact Support</button>` : ''}
                        </div>
                    </div>
                `;
            
            case 'multi-step':
                return `
                    <div class="contact-method-box">
                        <h5>📋 ${contactMethod.steps.length}-Step Approval Process</h5>
                        <div class="process-steps">
                            ${contactMethod.steps.map((step, index) => `
                                <div class="process-step">
                                    <span class="step-number">${step.step}</span>
                                    <div class="step-content">
                                        <strong>${step.action}</strong>
                                        ${step.contact ? `<br>Contact: ${step.contact}` : ''}
                                        ${step.estimatedTime ? `<br>Time: ${step.estimatedTime}` : ''}
                                        ${step.duration ? `<br>Duration: ${step.duration}` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="contact-actions">
                            <button class="btn-primary" onclick="bookmarkApp.initiateEmailContact('${contactMethod.steps[0].contact}', 'Security Tool Access Request', '${bookmark.name}')">📧 Start Process</button>
                        </div>
                    </div>
                `;
            
            default:
                return '<p>Contact method not specified.</p>';
        }
    }

    generateActionButton(contactMethod, bookmark) {
        switch (contactMethod.type) {
            case 'meeting':
                return `<button type="button" class="btn-primary" onclick="bookmarkApp.initiateEmailContact('${contactMethod.email}', '${contactMethod.meetingSubject}', '${bookmark.name}')">Request Access</button>`;
            case 'email':
                return `<button type="button" class="btn-primary" onclick="bookmarkApp.sendTemplatedEmail('${contactMethod.email}', '${contactMethod.ticketSubject}', '${contactMethod.ticketTemplate}', '${bookmark.name}')">Request Access</button>`;
            case 'phone':
                return `<button type="button" class="btn-primary" onclick="window.location.href='tel:${contactMethod.phone}'">Call Now</button>`;
            case 'self-service':
                return `<button type="button" class="btn-primary" onclick="window.open('${bookmark.url}', '_blank')">Open Tool</button>`;
            case 'multi-step':
                return `<button type="button" class="btn-primary" onclick="bookmarkApp.initiateEmailContact('${contactMethod.steps[0].contact}', 'Security Tool Access Request', '${bookmark.name}')">Start Process</button>`;
            default:
                return '';
        }
    }

    // Enhanced email functions
    initiateEmailContact(email, subject, toolName) {
        const body = `Hello,\n\nI would like to request access to ${toolName}.\n\nPlease let me know what information you need from me to proceed with this request.\n\nThank you,\n[Your Name]`;
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    sendTemplatedEmail(email, subjectTemplate, bodyTemplate, toolName) {
        const userName = '[Your Name]';
        const subject = subjectTemplate.replace('{userName}', userName);
        const body = bodyTemplate
            .replace('{userName}', userName)
            .replace('{businessUnit}', '[Your Business Unit]')
            .replace('{projectName}', '[Your Project]')
            .replace('{resourceList}', '[Required Resources]')
            .replace('{managerEmail}', '[Manager Email]')
            .replace('{justification}', '[Business Justification]');
        
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showSuccessMessage('Copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy to clipboard:', err);
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showSuccessMessage('Copied to clipboard!');
        } catch (err) {
            console.error('Could not copy to clipboard:', err);
            this.showSuccessMessage('Could not copy to clipboard. Please copy manually.');
        }
        document.body.removeChild(textArea);
    }

    // Desktop Application Info Modal
    showDesktopAppInfo(appName, appId, appDescription, event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Find the bookmark to get full details
        const bookmark = this.findBookmarkByUrl(appId);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">🖥️ ${appName} - Desktop Application</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <div class="form-group">
                        <h4>📋 Application Information:</h4>
                        <p><strong>Name:</strong> ${appName}</p>
                        <p><strong>Type:</strong> Desktop Application</p>
                        <p><strong>Application ID:</strong> ${appId}</p>
                        <p><strong>Description:</strong> ${appDescription}</p>
                        ${bookmark && bookmark.tags && bookmark.tags.length > 0 ? `<p><strong>Tags:</strong> ${bookmark.tags.join(', ')}</p>` : ''}
                    </div>
                    
                    <div class="form-group">
                        <h4>🖥️ Desktop Application Access:</h4>
                        <div style="background-color: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 6px; padding: 12px; color: #1e40af;">
                            <strong>💻 Local Installation Required</strong><br>
                            This is a desktop application that must be installed on your computer. It cannot be accessed through a web browser.
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <h4>🔧 How to Access:</h4>
                        <ul>
                            <li>🔍 Check if the application is already installed on your computer</li>
                            <li>📂 Look in your Start Menu (Windows) or Applications folder (Mac)</li>
                            <li>🖱️ Search for "${appName}" in your system search</li>
                            <li>📧 Contact IT support if you need the application installed</li>
                        </ul>
                    </div>
                    
                    <div class="form-group">
                        <h4>💡 Installation Help:</h4>
                        <p>If you don't have this application installed or need assistance:</p>
                        <div class="action-buttons-group">
                            <button class="btn-primary" onclick="bookmarkApp.requestDesktopAppHelp('${appName}', '${appId}', '${appDescription}'); this.closest('.modal-overlay').remove();">📧 Request Installation</button>
                            <button class="btn-secondary" onclick="bookmarkApp.requestHelp('${appName.replace(/'/g, "\\'")}', '${appId}', '${appDescription.replace(/'/g, "\\'")}', event); this.closest('.modal-overlay').remove();">❓ Get Help</button>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="bookmarkApp.requestDesktopAppHelp('${appName}', '${appId}', '${appDescription}'); this.closest('.modal-overlay').remove();">📧 Request Installation</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    requestDesktopAppHelp(appName, appId, appDescription) {
        const supportEmail = this.getDefaultSupportEmail();
        const subject = `Desktop Application Request - ${appName}`;
        const browserInfo = this.getBrowserInfo();
        const hostname = this.getHostname();
        const timestamp = new Date().toLocaleString();
        
        const body = `Hello IT Support,

I need assistance with the desktop application: ${appName}

Application Information:
- Name: ${appName}
- Application ID: ${appId}
- Description: ${appDescription}

Request Type:
☐ New Installation - I don't have this application installed
☐ Reinstallation - The application was removed or corrupted
☐ Update/Upgrade - I need a newer version
☐ Access Issues - The application is installed but won't start
☐ License Issues - License expired or not activated
☐ Other - Please specify below

Business Justification:
[Please explain why you need this application for your work]

Installation Preference:
☐ Standard Installation (IT installs remotely)
☐ Self-Service Installation (if available)
☐ Scheduled Installation (arrange a time)

System Information:
- Computer Name: ${hostname}
- Operating System: ${this.getOperatingSystem()}
- Current User: [Your Username]
- Date/Time: ${timestamp}
- Department: [Your Department]

Additional Information:
[Any specific requirements, version preferences, or other details]

Manager Approval (if required):
- Manager Name: [Manager's Name]
- Manager Email: [Manager's Email]
- Approval Status: [Approved/Pending]

Thank you for your assistance.

Best regards,
[Your Name]
[Your Email]
[Your Phone Number]`;

        const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    // Generic help email (fallback) - now uses inline form
    showGenericHelpEmail(serviceName, serviceUrl, serviceDescription) {
        // Get help desk configuration from bookmarks data
        const helpConfig = this.bookmarksData?.settings?.helpDesk;
        if (!helpConfig) {
            console.warn('Help desk configuration not found');
            this.showSuccessMessage('Help desk configuration not available');
            return;
        }
        
        // Generate email content
        const emailData = this.generateHelpEmail(serviceName, serviceUrl, serviceDescription, helpConfig);
        
        // Show inline email form instead of mailto
        this.showInlineEmailForm(emailData, serviceName);
    }

    generateHelpEmail(serviceName, serviceUrl, serviceDescription, helpConfig) {
        // Get browser information
        const browserInfo = this.getBrowserInfo();
        
        // Get hostname information
        const hostname = this.getHostname();
        
        // Get current timestamp
        const timestamp = new Date().toLocaleString();
        
        // Get user name (try to extract from environment or use placeholder)
        const userName = this.getUserName();
        
        // Generate subject using template
        const subject = helpConfig.emailSubjectTemplate.replace('{serviceName}', serviceName);
        
        // Generate body using template
        let body = helpConfig.emailBodyTemplate
            .replace('{serviceName}', serviceName)
            .replace('{serviceUrl}', serviceUrl)
            .replace('{serviceDescription}', serviceDescription)
            .replace('{browserInfo}', browserInfo)
            .replace('{hostname}', hostname)
            .replace('{timestamp}', timestamp)
            .replace('{userName}', userName);
        
        return {
            to: 'propakit@cpcfoods.com', // Always use corporate support email
            subject: subject,
            body: body
        };
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        
        // Detect browser
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
            browserName = 'Chrome';
            const match = userAgent.match(/Chrome\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Edg')) {
            browserName = 'Edge';
            const match = userAgent.match(/Edg\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
            const match = userAgent.match(/Firefox\/(\d+)/);
            if (match) browserVersion = match[1];
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserName = 'Safari';
            const match = userAgent.match(/Version\/(\d+)/);
            if (match) browserVersion = match[1];
        }
        
        return `${browserName} ${browserVersion} on ${navigator.platform}`;
    }

    getHostname() {
        try {
            // Debug logging to see what's happening
            console.log('Attempting to get hostname...');
            
            // Try to get hostname from window.location first
            if (window.location && window.location.hostname) {
                console.log('Window location hostname:', window.location.hostname);
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.hostname !== '') {
                    return window.location.hostname;
                }
            }
            
            // Try to get computer name from user agent or other browser info
            const userAgent = navigator.userAgent;
            console.log('User agent:', userAgent);
            
            // Try to extract hostname from various browser sources
            if (navigator.platform) {
                console.log('Navigator platform:', navigator.platform);
                if (userAgent.includes('Windows NT')) {
                    // Try to get Windows computer name (this won't work in browser for security)
                    // But we can provide a more descriptive fallback
                    return `Windows-PC-${Date.now().toString().slice(-4)}`;
                } else if (userAgent.includes('Mac OS X') || userAgent.includes('Macintosh')) {
                    return `Mac-${Date.now().toString().slice(-4)}`;
                } else if (userAgent.includes('Linux')) {
                    return `Linux-PC-${Date.now().toString().slice(-4)}`;
                }
            }
            
            // Final fallback with timestamp to make it unique
            const fallback = `Workstation-${Date.now().toString().slice(-4)}`;
            console.log('Using fallback hostname:', fallback);
            return fallback;
            
        } catch (error) {
            console.error('Error determining hostname:', error);
            const errorFallback = `Unknown-PC-${Date.now().toString().slice(-4)}`;
            console.log('Using error fallback hostname:', errorFallback);
            return errorFallback;
        }
    }

    getUserName() {
        // Try to get username from environment variables (Windows)
        try {
            // This won't work in browser for security reasons, but we can try
            return process?.env?.USERNAME || process?.env?.USER || '[Your Name]';
        } catch {
            // Fallback to a placeholder
            return '[Your Name]';
        }
    }

    getLocalIPAddress() {
        // Browser security prevents direct access to local IP
        // Return a placeholder that IT can use to identify the user
        return '[Local IP - IT can identify from email headers]';
    }

    getScreenResolution() {
        try {
            return `${screen.width}x${screen.height}`;
        } catch {
            return '[Screen Resolution Not Available]';
        }
    }

    getOperatingSystem() {
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        
        if (userAgent.includes('Windows NT 10.0')) {
            return 'Windows 10/11';
        } else if (userAgent.includes('Windows NT 6.3')) {
            return 'Windows 8.1';
        } else if (userAgent.includes('Windows NT 6.1')) {
            return 'Windows 7';
        } else if (userAgent.includes('Windows')) {
            return 'Windows (Unknown Version)';
        } else if (userAgent.includes('Mac OS X')) {
            const match = userAgent.match(/Mac OS X (\d+[._]\d+[._]\d+)/);
            if (match) {
                const version = match[1].replace(/_/g, '.');
                return `macOS ${version}`;
            }
            return 'macOS (Unknown Version)';
        } else if (userAgent.includes('Linux')) {
            if (userAgent.includes('Ubuntu')) {
                return 'Ubuntu Linux';
            } else if (userAgent.includes('CentOS')) {
                return 'CentOS Linux';
            } else if (userAgent.includes('Red Hat')) {
                return 'Red Hat Linux';
            }
            return 'Linux (Unknown Distribution)';
        } else if (platform) {
            return platform;
        }
        
        return 'Unknown Operating System';
    }

    showHelpEmailModal(emailData) {
        // Create modal for email details (fallback if mailto doesn't work)
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">📧 Help Request Email</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <p>Your email client should have opened with a pre-filled help request. If it didn't, you can copy the details below:</p>
                    
                    <div class="form-group">
                        <label><strong>To:</strong></label>
                        <input type="text" value="${emailData.to}" readonly style="width: 100%; margin-top: 4px;">
                    </div>
                    
                    <div class="form-group">
                        <label><strong>Subject:</strong></label>
                        <input type="text" value="${emailData.subject}" readonly style="width: 100%; margin-top: 4px;">
                    </div>
                    
                    <div class="form-group">
                        <label><strong>Message:</strong></label>
                        <textarea readonly style="width: 100%; height: 200px; margin-top: 4px; font-family: monospace; font-size: 12px;">${emailData.body}</textarea>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="bookmarkApp.copyEmailToClipboard('${emailData.to}', '${emailData.subject}', \`${emailData.body.replace(/`/g, '\\`')}\`)">Copy Email Details</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    copyEmailToClipboard(to, subject, body) {
        const emailText = `To: ${to}\nSubject: ${subject}\n\n${body}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailText).then(() => {
                this.showSuccessMessage('Email details copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy to clipboard:', err);
                this.showSuccessMessage('Could not copy to clipboard. Please copy manually.');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = emailText;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showSuccessMessage('Email details copied to clipboard!');
            } catch (err) {
                console.error('Could not copy to clipboard:', err);
                this.showSuccessMessage('Could not copy to clipboard. Please copy manually.');
            }
            document.body.removeChild(textArea);
        }
    }

    // Inline Email Form System
    showInlineEmailForm(emailData, serviceName) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">📧 Support Request - ${serviceName}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <form id="inlineEmailForm">
                        <div class="form-group">
                            <label for="emailTo"><strong>To:</strong></label>
                            <input type="email" id="emailTo" value="${emailData.to}" readonly style="background-color: #f5f5f5;">
                        </div>
                        
                        <div class="form-group">
                            <label for="emailSubject"><strong>Subject:</strong></label>
                            <input type="text" id="emailSubject" value="${emailData.subject}" style="width: 100%;">
                        </div>
                        
                        <div class="form-group">
                            <label for="emailBody"><strong>Message:</strong></label>
                            <textarea id="emailBody" rows="15" style="width: 100%; font-family: monospace; font-size: 12px; resize: vertical;">${emailData.body}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <div class="inline-email-actions">
                                <button type="button" class="btn-primary" onclick="bookmarkApp.sendInlineEmail()">📧 Send Email</button>
                                <button type="button" class="btn-secondary" onclick="bookmarkApp.copyInlineEmailContent()">📋 Copy to Clipboard</button>
                                <button type="button" class="btn-secondary" onclick="bookmarkApp.previewInlineEmail()">👁️ Preview</button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="email-help-text">
                                <p><strong>💡 How to use:</strong></p>
                                <ul>
                                    <li><strong>Send Email:</strong> Opens your default email client with the message</li>
                                    <li><strong>Copy to Clipboard:</strong> Copies the email content for manual pasting</li>
                                    <li><strong>Preview:</strong> Shows how the email will look when sent</li>
                                </ul>
                                <p><em>You can edit the subject and message before sending.</em></p>
                            </div>
                        </div>
                    </form>
                    
                    <div class="modal-actions" style="margin-top: 20px;">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button type="button" class="btn-primary" onclick="bookmarkApp.sendInlineEmail()">📧 Send Support Request</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    sendInlineEmail() {
        const to = document.getElementById('emailTo').value;
        const subject = document.getElementById('emailSubject').value;
        const body = document.getElementById('emailBody').value;
        
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        try {
            window.location.href = mailtoLink;
            // Close the modal after attempting to send
            document.querySelector('.modal-overlay').remove();
            this.showSuccessMessage('Email client opened with your support request');
        } catch (error) {
            console.error('Could not open email client:', error);
            this.showSuccessMessage('Could not open email client. Please copy the content manually.');
        }
    }

    copyInlineEmailContent() {
        const to = document.getElementById('emailTo').value;
        const subject = document.getElementById('emailSubject').value;
        const body = document.getElementById('emailBody').value;
        
        const emailText = `To: ${to}\nSubject: ${subject}\n\n${body}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailText).then(() => {
                this.showSuccessMessage('Email content copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy to clipboard:', err);
                this.fallbackCopyToClipboard(emailText);
            });
        } else {
            this.fallbackCopyToClipboard(emailText);
        }
    }

    previewInlineEmail() {
        const to = document.getElementById('emailTo').value;
        const subject = document.getElementById('emailSubject').value;
        const body = document.getElementById('emailBody').value;
        
        const previewModal = document.createElement('div');
        previewModal.className = 'modal-overlay';
        previewModal.style.display = 'flex';
        previewModal.style.zIndex = '2002'; // Higher than the main modal
        
        previewModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">👁️ Email Preview</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-form">
                    <div class="email-preview">
                        <div class="email-preview-header">
                            <div class="email-field"><strong>To:</strong> ${to}</div>
                            <div class="email-field"><strong>Subject:</strong> ${subject}</div>
                            <div class="email-field"><strong>Date:</strong> ${new Date().toLocaleString()}</div>
                        </div>
                        <div class="email-preview-body">
                            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.4; margin: 0;">${body}</pre>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close Preview</button>
                        <button type="button" class="btn-primary" onclick="this.closest('.modal-overlay').remove(); bookmarkApp.sendInlineEmail();">📧 Send This Email</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(previewModal);
    }

    // Knowledge Base Integration Functions
    generateKnowledgeBaseTabsHTML(knowledgeBase) {
        let html = '';
        
        // Training Materials Tab
        if (knowledgeBase.trainingMaterials && knowledgeBase.trainingMaterials.length > 0) {
            html += `
                <div id="kb-training" class="kb-tab-panel">
                    <div class="form-group">
                        <h4>📚 Training Materials</h4>
                        <p>Comprehensive training resources to help you master this tool:</p>
                        <div class="knowledge-base-items">
                            ${knowledgeBase.trainingMaterials.map(material => `
                                <div class="kb-item">
                                    <div class="kb-item-header">
                                        <h5>📖 ${material.title}</h5>
                                        <div class="kb-item-meta">
                                            <span class="kb-badge">${material.type}</span>
                                            ${material.level ? `<span class="kb-level">${material.level}</span>` : ''}
                                            ${material.estimatedTime ? `<span class="kb-time">⏱️ ${material.estimatedTime}</span>` : ''}
                                        </div>
                                    </div>
                                    <p class="kb-item-description">${material.description}</p>
                                    ${material.prerequisites ? `<p class="kb-prerequisites"><strong>Prerequisites:</strong> ${material.prerequisites}</p>` : ''}
                                    <div class="kb-item-actions">
                                        <button class="btn-primary" onclick="bookmarkApp.openKnowledgeBaseDocument('${material.url}')">📖 Open Guide</button>
                                        ${material.url.startsWith('./') ? `<button class="btn-secondary" onclick="bookmarkApp.downloadKnowledgeBaseDocument('${material.url}', '${material.title}')">💾 Download</button>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Resources Tab
        html += `
            <div id="kb-resources" class="kb-tab-panel">
                <div class="form-group">
                    <h4>📖 Additional Resources</h4>
                    <div class="knowledge-base-sections">
        `;
        
        // Quick Reference Materials
        if (knowledgeBase.quickReference && knowledgeBase.quickReference.length > 0) {
            html += `
                <div class="kb-section">
                    <h5>⚡ Quick Reference</h5>
                    <div class="knowledge-base-items">
                        ${knowledgeBase.quickReference.map(ref => `
                            <div class="kb-item compact">
                                <div class="kb-item-header">
                                    <h6>📋 ${ref.title}</h6>
                                    <span class="kb-badge">${ref.type}</span>
                                </div>
                                <p class="kb-item-description">${ref.description}</p>
                                <div class="kb-item-actions">
                                    <button class="btn-primary" onclick="bookmarkApp.openKnowledgeBaseDocument('${ref.url}')">📋 View Reference</button>
                                    ${ref.url.startsWith('./') ? `<button class="btn-secondary" onclick="bookmarkApp.downloadKnowledgeBaseDocument('${ref.url}', '${ref.title}')">💾 Download</button>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Policies
        if (knowledgeBase.policies && knowledgeBase.policies.length > 0) {
            html += `
                <div class="kb-section">
                    <h5>📋 Policies & Procedures</h5>
                    <div class="knowledge-base-items">
                        ${knowledgeBase.policies.map(policy => `
                            <div class="kb-item compact">
                                <div class="kb-item-header">
                                    <h6>📄 ${policy.title}</h6>
                                    <span class="kb-badge">${policy.type}</span>
                                </div>
                                <p class="kb-item-description">${policy.description}</p>
                                <div class="kb-item-actions">
                                    <button class="btn-primary" onclick="bookmarkApp.openKnowledgeBaseDocument('${policy.url}')">📄 Read Policy</button>
                                    ${policy.url.startsWith('./') ? `<button class="btn-secondary" onclick="bookmarkApp.downloadKnowledgeBaseDocument('${policy.url}', '${policy.title}')">💾 Download</button>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // External Links
        if (knowledgeBase.externalLinks && knowledgeBase.externalLinks.length > 0) {
            html += `
                <div class="kb-section">
                    <h5>🌐 External Resources</h5>
                    <div class="knowledge-base-items">
                        ${knowledgeBase.externalLinks.map(link => `
                            <div class="kb-item compact">
                                <div class="kb-item-header">
                                    <h6>🔗 ${link.title}</h6>
                                    <span class="kb-badge">External</span>
                                </div>
                                <p class="kb-item-description">${link.description}</p>
                                <div class="kb-item-actions">
                                    <button class="btn-primary" onclick="window.open('${link.url}', '_blank')">🌐 Open Link</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    // New function to handle both knowledge base and help tabs
    showHelpTab(tabButton, tabId) {
        // Remove active class from all tab buttons
        document.querySelectorAll('.kb-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Hide all tab panels
        document.querySelectorAll('.kb-tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Activate clicked tab button
        tabButton.classList.add('active');
        
        // Show corresponding tab panel
        const targetPanel = document.getElementById(`help-${tabId}`) || document.getElementById(`kb-${tabId}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    showKnowledgeBaseTab(tabButton, tabId) {
        // Remove active class from all tab buttons
        document.querySelectorAll('.kb-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Hide all tab panels
        document.querySelectorAll('.kb-tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Activate clicked tab button
        tabButton.classList.add('active');
        
        // Show corresponding tab panel
        const targetPanel = document.getElementById(`kb-${tabId}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    }

    // Support system functions
    getSupportEmail(helpInfo) {
        // Try to get support email from contact method or fall back to default
        if (helpInfo.contactMethod && helpInfo.contactMethod.email) {
            return helpInfo.contactMethod.email;
        }
        
        // Fall back to help desk default email
        const helpConfig = this.bookmarksData?.settings?.helpDesk;
        return helpConfig?.defaultEmail || 'it-support@company.com';
    }

    generateSupportEmailTemplate(bookmark, helpInfo) {
        const browserInfo = this.getBrowserInfo();
        const timestamp = new Date().toLocaleString();
        
        return `Hello Support Team,

I need technical assistance with ${bookmark.name}.

Tool Information:
- Name: ${bookmark.name}
- URL: ${bookmark.url}
- Description: ${bookmark.description}

Issue Details:
[Please describe your technical issue here]

What I was trying to do:
[Describe what you were attempting when the issue occurred]

Error messages (if any):
[Copy any error messages you received]

Steps to reproduce:
1. [First step]
2. [Second step]
3. [Third step]

System Information:
- Browser: ${browserInfo}
- Date/Time: ${timestamp}
- User: [Your Name]

Additional Information:
[Any other relevant details]

Thank you for your assistance.

Best regards,
[Your Name]`;
    }

    sendSupportEmail(toolName, toolUrl, supportEmail) {
        const subject = `Technical Support Request - ${toolName}`;
        const bookmark = { name: toolName, url: toolUrl, description: `Support request for ${toolName}` };
        const body = this.generateSupportEmailTemplate(bookmark, {});
        
        const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    copySupportEmailTemplate(toolName, supportEmail) {
        const subject = `Technical Support Request - ${toolName}`;
        const bookmark = { name: toolName, url: '', description: `Support request for ${toolName}` };
        const body = this.generateSupportEmailTemplate(bookmark, {});
        
        const emailText = `To: ${supportEmail}\nSubject: ${subject}\n\n${body}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailText).then(() => {
                this.showSuccessMessage('Support email template copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy to clipboard:', err);
                this.fallbackCopyToClipboard(emailText);
            });
        } else {
            this.fallbackCopyToClipboard(emailText);
        }
    }

    generateSupportContactInfo(helpInfo) {
        // Generate additional support contact information if available
        let html = '';
        
        if (helpInfo.contactMethod && helpInfo.contactMethod.type !== 'self-service') {
            html += `
                <div class="form-group">
                    <h4>📞 Additional Support Contacts</h4>
                    <div class="support-contact-info">
            `;
            
            if (helpInfo.contactMethod.phone) {
                html += `
                    <div class="support-contact-item">
                        <strong>📞 Phone Support:</strong> ${helpInfo.contactMethod.phone}
                        ${helpInfo.contactMethod.hours ? `<br><small>Hours: ${helpInfo.contactMethod.hours}</small>` : ''}
                    </div>
                `;
            }
            
            if (helpInfo.contactMethod.contact && helpInfo.contactMethod.contact !== 'IT Support Team') {
                html += `
                    <div class="support-contact-item">
                        <strong>👥 Team:</strong> ${helpInfo.contactMethod.contact}
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    openKnowledgeBaseDocument(url) {
        if (url.startsWith('./')) {
            // Local document - open in new tab
            const fullUrl = new URL(url, window.location.href).href;
            window.open(fullUrl, '_blank');
        } else {
            // External URL
            window.open(url, '_blank');
        }
    }

    downloadKnowledgeBaseDocument(url, title) {
        if (!url.startsWith('./')) {
            this.showSuccessMessage('Download not available for external resources');
            return;
        }
        
        // Fetch the document and trigger download
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                // Create download link
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                
                // Determine file extension from URL
                const extension = url.split('.').pop() || 'md';
                const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
                
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
                
                this.showSuccessMessage(`Downloaded: ${filename}`);
            })
            .catch(error => {
                console.error('Download failed:', error);
                this.showSuccessMessage('Download failed. Please try opening the document instead.');
            });
    }

    hideLoadingSpinner() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    showError() {
        const spinner = document.getElementById('loadingSpinner');
        const errorMessage = document.getElementById('errorMessage');
        
        if (spinner) spinner.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'block';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookmarkApp = new BookmarkApp();
});
