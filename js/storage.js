// ============================================================
// SAVANNAH CINEMA - Storage Management
// LocalStorage wrapper for cart, booking, user, and history
// ============================================================

const SavannahStorage = {
    
    // ========================================================
    // STORAGE KEYS
    // ========================================================
    KEYS: {
        CART: 'savannah_cart',
        BOOKING: 'savannah_booking',
        USER: 'savannah_user',
        WATCHED: 'savannah_watched',
        WATCHLIST: 'savannah_watchlist',
        LAST_BOOKING: 'savannah_last_booking',
        BOOKING_HISTORY: 'savannah_booking_history',
        PREFERENCES: 'savannah_preferences',
        RECENT_SEARCHES: 'savannah_recent_searches',
        SELECTED_BRANCH: 'savannah_selected_branch'
    },
    
    // ========================================================
    // GENERIC METHODS
    // ========================================================
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
    
    exists(key) {
        return localStorage.getItem(key) !== null;
    },
    
    clear() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    },
    
    clearAll() {
        localStorage.clear();
    },
    
    // ========================================================
    // CART MANAGEMENT
    // ========================================================
    getCart() {
        return this.get(this.KEYS.CART, {
            tickets: [],
            concessions: [],
            subtotal: 0,
            total: 0,
            lastUpdated: null
        });
    },
    
    setCart(cart) {
        cart.lastUpdated = new Date().toISOString();
        return this.set(this.KEYS.CART, cart);
    },
    
    addTicket(ticket) {
        const cart = this.getCart();
        
        // Ensure ticket has quantity (default 1)
        const normalizedTicket = {
            ...ticket,
            quantity: ticket.quantity || 1
        };
        
        cart.tickets.push(normalizedTicket);
        this.recalculateCart(cart);
        this.setCart(cart);
        return cart;
    },
    
    removeTicket(ticketId) {
        const cart = this.getCart();
        cart.tickets = cart.tickets.filter(t => t.ticket_id !== ticketId);
        this.recalculateCart(cart);
        this.setCart(cart);
        return cart;
    },
    
    addConcession(product, quantity = 1) {
        const cart = this.getCart();
        const existing = cart.concessions.find(c => c.product_id === product.product_id);
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.concessions.push({
                product_id: product.product_id,
                product_name: product.product_name,
                price: product.price,
                quantity: quantity
            });
        }
        
        this.recalculateCart(cart);
        this.setCart(cart);
        return cart;
    },
    
    updateConcessionQuantity(productId, quantity) {
        const cart = this.getCart();
        const concession = cart.concessions.find(c => c.product_id === productId);
        
        if (concession) {
            if (quantity <= 0) {
                return this.removeConcession(productId);
            }
            concession.quantity = quantity;
            this.recalculateCart(cart);
            this.setCart(cart);
        }
        
        return cart;
    },
    
    removeConcession(productId) {
        const cart = this.getCart();
        cart.concessions = cart.concessions.filter(c => c.product_id !== productId);
        this.recalculateCart(cart);
        this.setCart(cart);
        return cart;
    },
    
    recalculateCart(cart) {
        const ticketTotal = cart.tickets.reduce(
            (sum, t) => sum + (parseFloat(t.price || 0) * (t.quantity || 1)),
            0
        );
        
        const concessionTotal = cart.concessions.reduce(
            (sum, c) => sum + (parseFloat(c.price || 0) * c.quantity),
            0
        );
        
        cart.subtotal = ticketTotal + concessionTotal;
        cart.total = cart.subtotal;
        
        return cart;
    },
    
    clearCart() {
        this.remove(this.KEYS.CART);
    },
    
    // ========================================================
    // BOOKING DATA (CURRENT/IN-PROGRESS)
    // ========================================================
    setBookingData(data) {
        return this.set(this.KEYS.BOOKING, data);
    },
    
    getBookingData() {
        return this.get(this.KEYS.BOOKING, {});
    },
    
    updateBookingData(partialData) {
        const current = this.getBookingData();
        const updated = { ...current, ...partialData };
        this.setBookingData(updated);
        return updated;
    },
    
    clearBooking() {
        this.remove(this.KEYS.BOOKING);
    },
    
    // ========================================================
    // LAST BOOKING (JUST COMPLETED)
    // ========================================================
    setLastBooking(booking) {
        return this.set(this.KEYS.LAST_BOOKING, booking);
    },
    
    getLastBooking() {
        return this.get(this.KEYS.LAST_BOOKING, null);
    },
    
    clearLastBooking() {
        this.remove(this.KEYS.LAST_BOOKING);
    },
    
    // ========================================================
    // BOOKING HISTORY (ALL COMPLETED BOOKINGS)
    // ========================================================
    getBookingHistory() {
        return this.get(this.KEYS.BOOKING_HISTORY, []);
    },
    
    addBookingToHistory(booking) {
        const history = this.getBookingHistory();
        history.unshift(booking);   // Newest first
        
        // Keep only last 50 bookings
        const trimmed = history.slice(0, 50);
        this.set(this.KEYS.BOOKING_HISTORY, trimmed);
        
        return trimmed;
    },
    
    clearBookingHistory() {
        this.remove(this.KEYS.BOOKING_HISTORY);
    },
    
    getBookingByReference(reference) {
        const history = this.getBookingHistory();
        return history.find(b => b.bookingReference === reference) || null;
    },
    
    // ========================================================
    // USER MANAGEMENT
    // ========================================================
    setUser(user) {
        return this.set(this.KEYS.USER, user);
    },
    
    getUser() {
        return this.get(this.KEYS.USER, null);
    },
    
    isLoggedIn() {
        const user = this.getUser();
        return user !== null && user !== undefined;
    },
    
    updateUser(partialData) {
        const user = this.getUser();
        if (!user) return null;
        
        const updated = { ...user, ...partialData };
        this.setUser(updated);
        return updated;
    },
    
    logout() {
        this.remove(this.KEYS.USER);
    },
    
    // ========================================================
    // WATCHED MOVIES
    // ========================================================
    getWatched() {
        return this.get(this.KEYS.WATCHED, []);
    },
    
    addWatched(movieId) {
        const watched = this.getWatched();
        if (!watched.includes(movieId)) {
            watched.push(movieId);
            this.set(this.KEYS.WATCHED, watched);
        }
        return watched;
    },
    
    removeWatched(movieId) {
        const watched = this.getWatched();
        const filtered = watched.filter(id => id !== movieId);
        this.set(this.KEYS.WATCHED, filtered);
        return filtered;
    },
    
    isWatched(movieId) {
        return this.getWatched().includes(movieId);
    },
    
    clearWatched() {
        this.remove(this.KEYS.WATCHED);
    },
    
    // ========================================================
    // WATCHLIST (SAVED FOR LATER)
    // ========================================================
    getWatchlist() {
        return this.get(this.KEYS.WATCHLIST, []);
    },
    
    addToWatchlist(movieId) {
        const watchlist = this.getWatchlist();
        if (!watchlist.includes(movieId)) {
            watchlist.push(movieId);
            this.set(this.KEYS.WATCHLIST, watchlist);
        }
        return watchlist;
    },
    
    removeFromWatchlist(movieId) {
        const watchlist = this.getWatchlist();
        const filtered = watchlist.filter(id => id !== movieId);
        this.set(this.KEYS.WATCHLIST, filtered);
        return filtered;
    },
    
    isInWatchlist(movieId) {
        return this.getWatchlist().includes(movieId);
    },
    
    clearWatchlist() {
        this.remove(this.KEYS.WATCHLIST);
    },
    
    // ========================================================
    // USER PREFERENCES
    // ========================================================
    getPreferences() {
        return this.get(this.KEYS.PREFERENCES, {
            favoriteGenres: [],
            preferredBranch: null,
            language: 'en',
            currency: 'GHS',
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true
        });
    },
    
    setPreferences(preferences) {
        return this.set(this.KEYS.PREFERENCES, preferences);
    },
    
    updatePreferences(partialData) {
        const current = this.getPreferences();
        const updated = { ...current, ...partialData };
        this.setPreferences(updated);
        return updated;
    },
    
    // ========================================================
    // RECENT SEARCHES
    // ========================================================
    getRecentSearches() {
        return this.get(this.KEYS.RECENT_SEARCHES, []);
    },
    
    addRecentSearch(query) {
        if (!query || query.trim().length === 0) return this.getRecentSearches();
        
        const trimmed = query.trim();
        let searches = this.getRecentSearches();
        
        // Remove duplicates
        searches = searches.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
        
        // Add to front
        searches.unshift(trimmed);
        
        // Keep only last 10
        searches = searches.slice(0, 10);
        
        this.set(this.KEYS.RECENT_SEARCHES, searches);
        return searches;
    },
    
    clearRecentSearches() {
        this.remove(this.KEYS.RECENT_SEARCHES);
    },
    
    // ========================================================
    // SELECTED BRANCH (USER PREFERENCE)
    // ========================================================
    setSelectedBranch(branchId) {
        return this.set(this.KEYS.SELECTED_BRANCH, branchId);
    },
    
    getSelectedBranch() {
        return this.get(this.KEYS.SELECTED_BRANCH, null);
    },
    
    clearSelectedBranch() {
        this.remove(this.KEYS.SELECTED_BRANCH);
    },
    
    // ========================================================
    // STATISTICS & UTILITIES
    // ========================================================
    getStorageStats() {
        const stats = {};
        
        for (const [name, key] of Object.entries(this.KEYS)) {
            const value = this.get(key);
            const size = localStorage.getItem(key)?.length || 0;
            
            stats[name] = {
                key: key,
                exists: value !== null,
                size: size,
                sizeKB: (size / 1024).toFixed(2)
            };
        }
        
        // Total usage
        const totalSize = Object.values(stats).reduce((sum, s) => sum + s.size, 0);
        stats._total = {
            size: totalSize,
            sizeKB: (totalSize / 1024).toFixed(2),
            sizeMB: (totalSize / (1024 * 1024)).toFixed(3)
        };
        
        return stats;
    },
    
    isAvailable() {
        try {
            const testKey = '__savannah_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    // ========================================================
    // EXPORT / IMPORT (For backup)
    // ========================================================
    export() {
        const data = {};
        Object.entries(this.KEYS).forEach(([name, key]) => {
            data[name] = this.get(key);
        });
        return data;
    },
    
    import(data) {
        if (!data || typeof data !== 'object') return false;
        
        try {
            Object.entries(this.KEYS).forEach(([name, key]) => {
                if (data[name] !== undefined && data[name] !== null) {
                    this.set(key, data[name]);
                }
            });
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};