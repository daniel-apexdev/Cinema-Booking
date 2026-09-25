// ============================================================
// STORAGE - Local Storage Management
// ============================================================

const SavannahStorage = {
    
    KEYS: {
        CART: 'savannah_cart',
        BOOKING: 'savannah_booking',
        USER: 'savannah_user',
        WATCHED: 'savannah_watched',
        LAST_BOOKING: 'savannah_last_booking'
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
        localStorage.removeItem(key);
    },
    
    clear() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    },
    
    // ========================================================
    // CART MANAGEMENT
    // ========================================================
    getCart() {
        return this.get(this.KEYS.CART, {
            tickets: [],
            concessions: [],
            total: 0
        });
    },
    
    addTicket(ticket) {
        const cart = this.getCart();
        cart.tickets.push(ticket);
        this.recalculateCart(cart);
        this.set(this.KEYS.CART, cart);
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
        this.set(this.KEYS.CART, cart);
        return cart;
    },
    
    removeConcession(productId) {
        const cart = this.getCart();
        cart.concessions = cart.concessions.filter(c => c.product_id !== productId);
        this.recalculateCart(cart);
        this.set(this.KEYS.CART, cart);
        return cart;
    },
    
    recalculateCart(cart) {
        const ticketTotal = cart.tickets.reduce((sum, t) => sum + (t.price * t.quantity), 0);
        const concessionTotal = cart.concessions.reduce((sum, c) => sum + (c.price * c.quantity), 0);
        cart.total = ticketTotal + concessionTotal;
        return cart;
    },
    
    clearCart() {
        this.remove(this.KEYS.CART);
    },
    
    // ========================================================
    // BOOKING DATA
    // ========================================================
    setBookingData(data) {
        this.set(this.KEYS.BOOKING, data);
    },
    
    getBookingData() {
        return this.get(this.KEYS.BOOKING, {});
    },
    
    // ========================================================
    // USER
    // ========================================================
    setUser(user) {
        this.set(this.KEYS.USER, user);
    },
    
    getUser() {
        return this.get(this.KEYS.USER, null);
    },
    
    isLoggedIn() {
        return this.getUser() !== null;
    },
    
    logout() {
        this.remove(this.KEYS.USER);
    },
    
    // ========================================================
    // WATCHED MOVIES
    // ========================================================
    addWatched(movieId) {
        const watched = this.get(this.KEYS.WATCHED, []);
        if (!watched.includes(movieId)) {
            watched.push(movieId);
            this.set(this.KEYS.WATCHED, watched);
        }
        return watched;
    },
    
    getWatched() {
        return this.get(this.KEYS.WATCHED, []);
    }
};