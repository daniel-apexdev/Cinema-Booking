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
            this.normalizeShowtimeDates();
            this.normalizeComingSoonDates();
            this.generateMissingShowtimes();
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
    // ---- Prefer inline data (works with file:// and GitHub Pages) ----
    if (window.SAVANNAH_INLINE_DATA) {
        console.log('📦 Using inline data — no server needed');
        const d = window.SAVANNAH_INLINE_DATA;

        this.data.movies     = d.movies     || [];
        this.data.hero_slides = d.hero_slides || [];
        this.data.cinemas    = d.cinemas    || [];
        this.data.showtimes  = d.showtimes  || [];
        this.data.seats      = d.seats      || {};
        this.data.products   = d.products   || [];

        this.data.genres = this.extractGenres();
        return true;
    }

    // ---- Fallback: fetch from server (works on GH Pages too) ----
    try {
        const [movies, cinemas, showtimes, seats, products] = await Promise.all([
            fetch('data/movies.json').then(r => r.json()),
            fetch('data/cinemas.json').then(r => r.json()),
            fetch('data/showtimes.json').then(r => r.json()),
            fetch('data/seats.json').then(r => r.json()),
            fetch('data/products.json').then(r => r.json())
        ]);

        this.data.movies      = movies.movies || [];
        this.data.hero_slides = movies.hero_slides || [];
        this.data.cinemas     = cinemas.cinemas || [];
        this.data.showtimes   = showtimes.showtimes || [];
        this.data.seats       = seats.seat_layouts || {};
        this.data.products    = products.products || [];

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
    // SHOWTIME DATE NORMALIZATION
    // If every showtime in the catalog is in the past, shift the
    // whole schedule forward so the earliest showtime lands on
    // today. Preserves the relative layout of the schedule.
    // Idempotent: running it again with dates already in the
    // future is a no-op.
    // ========================================================
    normalizeShowtimeDates() {
        if (!this.data || !Array.isArray(this.data.showtimes) || !this.data.showtimes.length) {
            return;
        }

        // Use local midnight for "today" so we compare whole days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the earliest date among the showtimes
        let earliest = null;
        for (const s of this.data.showtimes) {
            if (!s.date) continue;
            const d = new Date(s.date + 'T00:00:00');
            if (isNaN(d.getTime())) continue;
            if (!earliest || d < earliest) earliest = d;
        }
        if (!earliest) return;

        // Already future-dated? Nothing to do.
        if (earliest >= today) return;

        // How many whole days to shift forward?
        const dayMs = 1000 * 60 * 60 * 24;
        const offsetDays = Math.round((today - earliest) / dayMs);
        if (offsetDays <= 0) return;

        // Rebase every showtime's date
        for (const s of this.data.showtimes) {
            if (!s.date) continue;
            const d = new Date(s.date + 'T00:00:00');
            if (isNaN(d.getTime())) continue;
            d.setDate(d.getDate() + offsetDays);
            // Preserve as YYYY-MM-DD in local time
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            s.date = `${yyyy}-${mm}-${dd}`;
        }

        console.log(`[SavannahApp] Showtime dates rebased +${offsetDays} day(s) so earliest = today`);
    },

        // ========================================================
    // COMING-SOON DATE NORMALIZATION
    // Ensures every movie marked status: "coming_soon" has a
    // release_date strictly in the future. Movies whose release
    // date has already passed get pushed forward by enough weeks
    // to land comfortably in the coming-soon window, preserving
    // their relative order.
    // Idempotent: already-future movies are untouched.
    // ========================================================
    normalizeComingSoonDates() {
        if (!this.data || !Array.isArray(this.data.movies)) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayMs = 1000 * 60 * 60 * 24;

        // How far out must a release be to count as "coming soon"?
        const minDaysAhead = 7;      // push anything too close to next week
        const minFuture = new Date(today.getTime() + minDaysAhead * dayMs);

        // Collect all coming-soon movies so we can preserve relative spacing
        const comingSoon = this.data.movies.filter(m => m.status === 'coming_soon');
        if (!comingSoon.length) return;

        // Find how far back the earliest past-dated coming-soon movie is
        let earliestPast = null;
        for (const m of comingSoon) {
            if (!m.release_date) continue;
            const d = new Date(m.release_date + 'T00:00:00');
            if (isNaN(d.getTime())) continue;
            if (d < minFuture && (!earliestPast || d < earliestPast)) {
                earliestPast = d;
            }
        }

        // If none are in the past/near-future, nothing to do
        if (!earliestPast) return;

        // Shift forward so the earliest coming-soon movie lands
        // exactly on minFuture, and everything else shifts by the same offset
        const offsetDays = Math.ceil((minFuture - earliestPast) / dayMs);

        for (const m of comingSoon) {
            if (!m.release_date) continue;
            const d = new Date(m.release_date + 'T00:00:00');
            if (isNaN(d.getTime())) continue;

            // If this one is already comfortably in the future, leave it
            if (d >= minFuture) continue;

            d.setDate(d.getDate() + offsetDays);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            m.release_date = `${yyyy}-${mm}-${dd}`;
            m.release_year = yyyy;
        }

        console.log(`[SavannahApp] Coming-soon dates rebased +${offsetDays} day(s)`);
    },

        // ========================================================
    // AUTO-GENERATE SHOWTIMES
    // For any now_showing movie that has no showtimes, generate
    // a small weekly schedule across the branches. Idempotent:
    // movies that already have showtimes are skipped.
    // ========================================================
    generateMissingShowtimes() {
        if (!this.data || !Array.isArray(this.data.movies)) return;
        if (!Array.isArray(this.data.showtimes)) this.data.showtimes = [];

        const nowShowing = this.data.movies.filter(m => m.status === 'now_showing');
        const branches = (this.data.cinemas && this.data.cinemas[0] && this.data.cinemas[0].branches) || [];
        if (!branches.length) return;

        // Which movies already have at least one showtime?
        const coveredMovieIds = new Set(this.data.showtimes.map(s => s.movie_id));

        // Which screens are available per branch? Use the seats map.
        const screensByBranch = {};
        for (const branch of branches) {
            screensByBranch[branch.branch_id] = [];
        }
        // Map screens to branches based on the existing showtimes' pattern
        // (each screen belongs to one branch based on its number)
        const screenBranchMap = {
            SCR001: 'BR001', SCR002: 'BR001', SCR003: 'BR001', SCR004: 'BR001',
            SCR005: 'BR001', SCR006: 'BR001', SCR007: 'BR001', SCR008: 'BR001',
            SCR009: 'BR002', SCR010: 'BR002', SCR011: 'BR002', SCR012: 'BR002',
            SCR013: 'BR002', SCR014: 'BR002',
            SCR015: 'BR003', SCR016: 'BR003', SCR017: 'BR003', SCR018: 'BR003',
            SCR019: 'BR004', SCR020: 'BR004', SCR021: 'BR004'
        };
        Object.entries(screenBranchMap).forEach(([sid, bid]) => {
            if (!screensByBranch[bid]) screensByBranch[bid] = [];
            const seatLayout = this.data.seats && this.data.seats[sid];
            if (seatLayout) {
                screensByBranch[bid].push({ screen_id: sid, ...seatLayout });
            }
        });

        // Time slots to use per day
        const slots = [
            { start: '10:00', session: 'MORNING' },
            { start: '13:00', session: 'MATINEE' },
            { start: '16:00', session: 'MATINEE' },
            { start: '19:00', session: 'EVENING' },
            { start: '21:30', session: 'LATE_NIGHT' }
        ];

        // Base prices by screen type
        const priceByScreenType = {
            IMAX:         { base: 25, premium: 32, vip: 40 },
            DOLBY_ATMOS:  { base: 22, premium: 28, vip: 35 },
            DOLBY:        { base: 20, premium: 26, vip: 32 },
            VIP:          { base: 35, premium: 45, vip: 55 },
            STANDARD:     { base: 15, premium: 20, vip: 25 }
        };

        // Build the next 7 days starting from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(today.getTime() + i * 86400000);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            days.push(`${yyyy}-${mm}-${dd}`);
        }

        // Existing showtime IDs — start a counter above the highest STxxx
        let nextId = 1;
        for (const s of this.data.showtimes) {
            const match = String(s.showtime_id || '').match(/^ST(\d+)$/);
            if (match) nextId = Math.max(nextId, parseInt(match[1], 10) + 1);
        }

        // Add a helper to compute end_time from start_time + duration
        const addMinutes = (hhmm, minutes) => {
            const [h, m] = hhmm.split(':').map(Number);
            const total = h * 60 + m + minutes;
            const eh = Math.floor(total / 60) % 24;
            const em = total % 60;
            return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
        };

        // For each uncovered now-showing movie, generate a schedule
        for (const movie of nowShowing) {
            if (coveredMovieIds.has(movie.movie_id)) continue;
            const runtime = movie.duration_minutes || 110;

            // Pick 2 branches (rotate through them) and 2 screens each
            const branchIds = Object.keys(screensByBranch).filter(b => screensByBranch[b].length);
            if (!branchIds.length) continue;

            // Deterministic assignment based on movie_id hash so the
            // layout stays stable across reloads
            const hash = movie.movie_id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const chosenBranches = [
                branchIds[hash % branchIds.length],
                branchIds[(hash + 1) % branchIds.length]
            ];

            for (const bid of chosenBranches) {
                const screens = screensByBranch[bid];
                // Pick 2 screens deterministically
                const s1 = screens[hash % screens.length];
                const s2 = screens[(hash + 2) % screens.length];

                const chosenScreens = s1.screen_id === s2.screen_id ? [s1] : [s1, s2];

                for (const screen of chosenScreens) {
                    // 3 showtimes spread across the 7-day window
                    const picks = [
                        { dayIdx: 0, slotIdx: 1 },       // today, matinee
                        { dayIdx: 2, slotIdx: 3 },       // +2 days, evening
                        { dayIdx: 5, slotIdx: 2 }        // +5 days, afternoon
                    ];

                    for (const { dayIdx, slotIdx } of picks) {
                        const slot = slots[slotIdx];
                        const prices = priceByScreenType[screen.screen_type] || priceByScreenType.STANDARD;
                        const totalSeats = screen.total_seats || 200;
                        const available = totalSeats - Math.floor(Math.random() * 30);

                        this.data.showtimes.push({
                            showtime_id: 'ST' + String(nextId++).padStart(3, '0'),
                            movie_id: movie.movie_id,
                            branch_id: bid,
                            screen_id: screen.screen_id,
                            screen_name: screen.screen_name,
                            screen_type: screen.screen_type,
                            date: days[dayIdx],
                            start_time: slot.start,
                            end_time: addMinutes(slot.start, runtime),
                            session_type: slot.session,
                            base_price: prices.base,
                            vip_price: prices.vip,
                            premium_price: prices.premium,
                            available_seats: available,
                            total_seats: totalSeats,
                            status: 'OPEN'
                        });
                    }
                }
            }
        }

        console.log(`[SavannahApp] Auto-generated showtimes for ${nowShowing.length - coveredMovieIds.size} movie(s)`);
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