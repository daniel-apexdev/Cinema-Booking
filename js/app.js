// ============================================================
// SAVANNAH CINEMA - Main Application
// ============================================================

const SavannahApp = {
    
    // ========================================================
    // CONFIGURATION
    // ========================================================
    config: {
        siteName: 'Savannah Cinema',
        siteTagline: 'Where Stories Come to Life',
        currency: 'GHS',
        currencySymbol: '₵',
        supportEmail: 'support@savannahcinema.com',
        supportPhone: '+233 30 212 3456',
        taxRate: 0.125,                          // 12.5% VAT
        bookingFee: 2.00,                        // Per ticket booking fee
        maxSeatsPerBooking: 10,
        advanceBookingDays: 14,
        locale: 'en-GB',
        dateFormat: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }
    },
    
    // ========================================================
    // DATA CACHE
    // ========================================================
    data: {
        movies: [],
        cinemas: [],
        showtimes: [],
        seats: {},
        products: [],
        genres: []
    },
    
    // ========================================================
    // APPLICATION STATE
    // ========================================================
    state: {
        isInitialized: false,
        currentUser: null,
        selectedMovie: null,
        selectedShowtime: null,
        selectedBranch: null,
        isLoading: false
    },
    
    // ========================================================
    // INITIALIZATION
    // ========================================================
    async init() {
        if (this.state.isLoading) return;
        this.state.isLoading = true;
        
        try {
            console.log('🎬 Initializing Savannah Cinema App...');
            await this.loadAllData();
            this.setupEventListeners();
            this.state.isInitialized = true;
            console.log('✅ Savannah Cinema App initialized successfully');
            console.log('📊 Data loaded:', {
                movies: this.data.movies.length,
                cinemas: this.data.cinemas.length,
                showtimes: this.data.showtimes.length,
                products: this.data.products.length,
                screens: Object.keys(this.data.seats).length
            });
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to load application data. Please refresh the page.');
        } finally {
            this.state.isLoading = false;
        }
    },
    
    // ========================================================
    // DATA LOADING
    // ========================================================
    async loadAllData() {

    // ---- Prefer inline data (works with file:// no server needed) ----
    if (window.SAVANNAH_INLINE_DATA) {
        console.log('📦 Using inline data — no server needed');
        const d = window.SAVANNAH_INLINE_DATA;

        this.data.movies = d.movies || [];
        this.data.hero_slides = d.hero_slides || [];
        this.data.cinemas = d.cinemas || [];
        this.data.showtimes = d.showtimes || [];
        this.data.seats = d.seats || {};
        this.data.products = d.products || [];

        this.data.genres = this.extractGenres();
        return true;
    }

    // ---- Fallback: fetch from server ----
    try {
        const [movies, cinemas, showtimes, seats, products] = await Promise.all([
            fetch('data/movies.json').then(r => r.json()),
            fetch('data/cinemas.json').then(r => r.json()),
            fetch('data/showtimes.json').then(r => r.json()),
            fetch('data/seats.json').then(r => r.json()),
            fetch('data/products.json').then(r => r.json())
        ]);

        this.data.movies = movies.movies || [];
        this.data.hero_slides = movies.hero_slides || [];
        this.data.cinemas = cinemas.cinemas || [];
        this.data.showtimes = showtimes.showtimes || [];
        this.data.seats = seats.seat_layouts || {};
        this.data.products = products.products || [];

        this.data.genres = this.extractGenres();
        return true;
    } catch (error) {
        console.error('Data loading error:', error);
        throw error;
    }
},
    
    // ========================================================
    // HELPER METHODS - FORMATTING
    // ========================================================
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return '₵0.00';
        return `${this.config.currencySymbol}${parseFloat(amount).toFixed(2)}`;
    },
    
    formatDuration(minutes) {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    },
    
    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(this.config.locale, this.config.dateFormat);
        } catch (e) {
            return dateStr;
        }
    },
    
    formatDateShort(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(this.config.locale, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    },
    
    formatTime(timeStr) {
        if (!timeStr) return 'N/A';
        // Convert "14:30" to "2:30 PM"
        try {
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
        } catch (e) {
            return timeStr;
        }
    },
    
    // ========================================================
    // HELPER METHODS - DATA RETRIEVAL
    // ========================================================
    getMovieById(movieId) {
        return this.data.movies.find(m => m.movie_id === movieId) || null;
    },
    
    getBranchById(branchId) {
        for (const cinema of this.data.cinemas) {
            const branch = cinema.branches?.find(b => b.branch_id === branchId);
            if (branch) {
                return { ...branch, cinema_name: cinema.cinema_name };
            }
        }
        return null;
    },
    
    getCinemaById(cinemaId) {
        return this.data.cinemas.find(c => c.cinema_id === cinemaId) || null;
    },
    
    getShowtimeById(showtimeId) {
        return this.data.showtimes.find(s => s.showtime_id === showtimeId) || null;
    },
    
    getProductById(productId) {
        return this.data.products.find(p => p.product_id === productId) || null;
    },
    
    getScreenLayout(screenId) {
        return this.data.seats[screenId] || null;
    },
    
    // ========================================================
    // HELPER METHODS - FILTERING
    // ========================================================
    getShowtimesByMovie(movieId) {
        return this.data.showtimes.filter(s => s.movie_id === movieId);
    },
    
    getShowtimesByBranch(branchId) {
        return this.data.showtimes.filter(s => s.branch_id === branchId);
    },
    
    getShowtimesByDate(date) {
        return this.data.showtimes.filter(s => s.date === date);
    },
    
    getShowtimesByMovieAndBranch(movieId, branchId) {
        return this.data.showtimes.filter(s => 
            s.movie_id === movieId && s.branch_id === branchId
        );
    },
    
    getFeaturedMovies() {
        return this.data.movies.filter(m => m.is_featured);
    },
    
    getNowShowingMovies() {
        return this.data.movies.filter(m => m.status === 'now_showing');
    },
    
    getComingSoonMovies() {
        return this.data.movies.filter(m => m.status === 'coming_soon');
    },
    
    getMoviesByGenre(genre) {
        return this.data.movies.filter(m => 
            m.genre && m.genre.includes(genre)
        );
    },
    
    searchMovies(query) {
        if (!query) return this.data.movies;
        const q = query.toLowerCase();
        return this.data.movies.filter(m => 
            m.title.toLowerCase().includes(q) ||
            m.original_title?.toLowerCase().includes(q) ||
            m.synopsis?.toLowerCase().includes(q) ||
            m.genre?.some(g => g.toLowerCase().includes(q))
        );
    },
    
    // ========================================================
    // HELPER METHODS - GENRE EXTRACTION
    // ========================================================
    extractGenres() {
        const genreSet = new Set();
        this.data.movies.forEach(movie => {
            if (movie.genre && Array.isArray(movie.genre)) {
                movie.genre.forEach(g => genreSet.add(g));
            }
        });
        return Array.from(genreSet).sort();
    },
    
    // ========================================================
    // HELPER METHODS - SCREEN TYPE
    // ========================================================
    getScreenTypeLabel(type) {
        const labels = {
            'IMAX': 'IMAX',
            'DOLBY_ATMOS': 'Dolby Atmos',
            'DOLBY': 'Dolby',
            'VIP': 'VIP Experience',
            'STANDARD': 'Standard',
            '4DX': '4DX',
            'PREMIUM': 'Premium'
        };
        return labels[type] || type;
    },
    
    getScreenTypeBadge(type) {
        const badges = {
            'IMAX': '<span class="badge badge-imax">IMAX</span>',
            'DOLBY_ATMOS': '<span class="badge badge-atmos">DOLBY ATMOS</span>',
            'DOLBY': '<span class="badge badge-dolby">DOLBY</span>',
            'VIP': '<span class="badge badge-vip">VIP</span>',
            'STANDARD': '<span class="badge badge-standard">STANDARD</span>'
        };
        return badges[type] || `<span class="badge">${type}</span>`;
    },
    
    // ========================================================
    // HELPER METHODS - SESSION TYPE
    // ========================================================
    getSessionTypeLabel(type) {
        const labels = {
            'MORNING': 'Morning',
            'MATINEE': 'Matinee',
            'EVENING': 'Evening',
            'LATE_NIGHT': 'Late Night',
            'PREMIERE': 'Premiere',
            'SPECIAL': 'Special'
        };
        return labels[type] || type;
    },
    
    // ========================================================
    // EVENT LISTENERS
    // ========================================================
    setupEventListeners() {
        // Booking button clicks
        document.addEventListener('click', (e) => {
            // Book now button
            if (e.target.matches('.book-now-btn') || e.target.closest('.book-now-btn')) {
                const btn = e.target.matches('.book-now-btn') ? e.target : e.target.closest('.book-now-btn');
                const movieId = btn.dataset.movieId;
                if (movieId) this.startBooking(movieId);
            }
            
            // Movie card click
            if (e.target.matches('.movie-card') || e.target.closest('.movie-card')) {
                const card = e.target.matches('.movie-card') ? e.target : e.target.closest('.movie-card');
                const movieId = card.dataset.movieId;
                if (movieId && !e.target.matches('.book-now-btn')) {
                    this.viewMovieDetails(movieId);
                }
            }
        });
        
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    },
    
    // ========================================================
    // USER ACTIONS - BOOKING
    // ========================================================
    startBooking(movieId) {
        const movie = this.getMovieById(movieId);
        if (!movie) {
            this.showError('Movie not found');
            return;
        }
        
        // Store selected movie
        localStorage.setItem('selectedMovieId', movieId);
        this.state.selectedMovie = movie;
        
        // Navigate to showtimes page
        window.location.href = `showtimes.html?movie=${movieId}`;
    },
    
    viewMovieDetails(movieId) {
        window.location.href = `movie.html?id=${movieId}`;
    },
    
    handleSearch(query) {
        const results = this.searchMovies(query);
        
        // Dispatch custom event for pages to listen to
        document.dispatchEvent(new CustomEvent('searchResults', {
            detail: { query, results }
        }));
        
        return results;
    },
    
    // ========================================================
    // UTILITY METHODS
    // ========================================================
    showError(message) {
        console.error(message);
        
        // Check if there's an error container
        let errorContainer = document.getElementById('errorContainer');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'errorContainer';
            errorContainer.className = 'error-container';
            document.body.appendChild(errorContainer);
        }
        
        errorContainer.innerHTML = `
            <div class="error-message">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorContainer && errorContainer.parentElement) {
                errorContainer.remove();
            }
        }, 5000);
    },
    
    showSuccess(message) {
        let successContainer = document.getElementById('successContainer');
        if (!successContainer) {
            successContainer = document.createElement('div');
            successContainer.id = 'successContainer';
            successContainer.className = 'success-container';
            document.body.appendChild(successContainer);
        }
        
        successContainer.innerHTML = `
            <div class="success-message">
                <span class="success-icon">✅</span>
                <span class="success-text">${message}</span>
            </div>
        `;
        
        setTimeout(() => {
            if (successContainer && successContainer.parentElement) {
                successContainer.remove();
            }
        }, 3000);
    },
    
    // ========================================================
    // URL PARAMETER HELPERS
    // ========================================================
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    // ========================================================
    // SESSION STATE
    // ========================================================
    setSession(key, value) {
        try {
            sessionStorage.setItem(`savannah_${key}`, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Session storage error:', e);
            return false;
        }
    },
    
    getSession(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(`savannah_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Session retrieval error:', e);
            return defaultValue;
        }
    }
};

// ============================================================
// INITIALIZE ON PAGE LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', () => SavannahApp.init());

// ============================================================
// EXPORT FOR MODULE USE (Optional)
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SavannahApp;
}