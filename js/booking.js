// ============================================================
// SAVANNAH CINEMA - Complete Booking Flow
// ============================================================

const SavannahBooking = {
    
    // ========================================================
    // CURRENT BOOKING STATE
    // ========================================================
    currentBooking: {
        movie: null,
        branch: null,
        cinema: null,
        showtime: null,
        seats: [],
        concessions: [],
        customer: {
            name: '',
            email: '',
            phone: ''
        },
        paymentMethod: 'cash',
        subtotal: 0,
        tax: 0,
        bookingFee: 0,
        totalAmount: 0,
        step: 1,                  // 1=movie, 2=showtime, 3=seats, 4=concessions, 5=checkout
        bookingReference: null
    },
    
    // ========================================================
    // BOOKING LIMITS
    // ========================================================
    limits: {
        maxSeats: 10,
        maxConcessionQty: 20,
        holdExpiryMinutes: 15
    },
    
    // ========================================================
    // STEP 1: SELECT MOVIE
    // ========================================================
    selectMovie(movieId) {
        const movie = SavannahApp.getMovieById(movieId);
        if (!movie) {
            SavannahApp.showError('Movie not found');
            return false;
        }
        
        this.currentBooking.movie = movie;
        this.currentBooking.step = 1;
        this.saveBookingState();
        
        window.location.href = `showtimes.html?movie=${movieId}`;
        return true;
    },
    
    // ========================================================
    // STEP 2: SELECT SHOWTIME
    // ========================================================
    selectShowtime(showtimeId) {
        const showtime = SavannahApp.getShowtimeById(showtimeId);
        if (!showtime) {
            SavannahApp.showError('Showtime not found');
            return false;
        }
        
        // Validate showtime is available
        if (showtime.status !== 'OPEN') {
            SavannahApp.showError('This showtime is not available for booking');
            return false;
        }
        
        // Check if there are seats available
        if (showtime.available_seats <= 0) {
            SavannahApp.showError('This showtime is sold out');
            return false;
        }
        
        // Set showtime and related data
        this.currentBooking.showtime = showtime;
        this.currentBooking.branch = SavannahApp.getBranchById(showtime.branch_id);
        
        // Find the cinema this branch belongs to
        for (const cinema of SavannahApp.data.cinemas) {
            const branch = cinema.branches?.find(b => b.branch_id === showtime.branch_id);
            if (branch) {
                this.currentBooking.cinema = cinema;
                break;
            }
        }
        
        this.currentBooking.step = 2;
        
        // Clear any previously selected seats
        this.currentBooking.seats = [];
        
        this.saveBookingState();
        
        window.location.href = `seats.html?showtime=${showtimeId}`;
        return true;
    },
    
    // ========================================================
    // STEP 3: SELECT SEATS
    // ========================================================
    selectSeat(seatId, price) {
        // Enforce max seats
        if (this.currentBooking.seats.length >= this.limits.maxSeats) {
            const existing = this.currentBooking.seats.find(s => s.seat_id === seatId);
            if (!existing) {
                SavannahApp.showError(`Maximum ${this.limits.maxSeats} seats per booking`);
                return false;
            }
        }
        
        const existingIndex = this.currentBooking.seats.findIndex(
            s => s.seat_id === seatId
        );
        
        if (existingIndex >= 0) {
            // Deselect
            this.currentBooking.seats.splice(existingIndex, 1);
        } else {
            // Select
            this.currentBooking.seats.push({
                seat_id: seatId,
                price: price
            });
        }
        
        this.recalculateTotals();
        this.saveBookingState();
        
        return this.currentBooking.seats;
    },
    
    removeSeat(seatId) {
        const index = this.currentBooking.seats.findIndex(s => s.seat_id === seatId);
        if (index >= 0) {
            this.currentBooking.seats.splice(index, 1);
            this.recalculateTotals();
            this.saveBookingState();
        }
        return this.currentBooking.seats;
    },
    
    clearSeats() {
        this.currentBooking.seats = [];
        this.recalculateTotals();
        this.saveBookingState();
    },
    
    isSeatSelected(seatId) {
        return this.currentBooking.seats.some(s => s.seat_id === seatId);
    },
    
    getSelectedSeatIds() {
        return this.currentBooking.seats.map(s => s.seat_id);
    },
    
    // ========================================================
    // STEP 4: ADD CONCESSIONS
    // ========================================================
    addConcession(productId, quantity = 1) {
        const product = SavannahApp.getProductById(productId);
        if (!product) {
            SavannahApp.showError('Product not found');
            return false;
        }
        
        const existing = this.currentBooking.concessions.find(
            c => c.product_id === productId
        );
        
        if (existing) {
            existing.quantity += quantity;
            if (existing.quantity > this.limits.maxConcessionQty) {
                existing.quantity = this.limits.maxConcessionQty;
            }
        } else {
            this.currentBooking.concessions.push({
                product_id: product.product_id,
                product_name: product.product_name,
                price: product.price,
                quantity: Math.min(quantity, this.limits.maxConcessionQty)
            });
        }
        
        this.recalculateTotals();
        this.saveBookingState();
        
        return this.currentBooking.concessions;
    },
    
    removeConcession(productId) {
        this.currentBooking.concessions = this.currentBooking.concessions.filter(
            c => c.product_id !== productId
        );
        this.recalculateTotals();
        this.saveBookingState();
        return this.currentBooking.concessions;
    },
    
    updateConcessionQuantity(productId, quantity) {
        const concession = this.currentBooking.concessions.find(
            c => c.product_id === productId
        );
        
        if (concession) {
            if (quantity <= 0) {
                return this.removeConcession(productId);
            }
            concession.quantity = Math.min(quantity, this.limits.maxConcessionQty);
            this.recalculateTotals();
            this.saveBookingState();
        }
        
        return this.currentBooking.concessions;
    },
    
    clearConcessions() {
        this.currentBooking.concessions = [];
        this.recalculateTotals();
        this.saveBookingState();
    },
    
    // ========================================================
    // CALCULATE TOTALS
    // ========================================================
    recalculateTotals() {
        // Seat subtotal
        const seatTotal = this.currentBooking.seats.reduce(
            (sum, s) => sum + parseFloat(s.price || 0),
            0
        );
        
        // Concession subtotal
        const concessionTotal = this.currentBooking.concessions.reduce(
            (sum, c) => sum + (parseFloat(c.price || 0) * c.quantity),
            0
        );
        
        // Booking fee (per ticket)
        const bookingFee = this.currentBooking.seats.length * SavannahApp.config.bookingFee;
        
        // Subtotal
        const subtotal = seatTotal + concessionTotal;
        
        // Tax (VAT)
        const tax = subtotal * SavannahApp.config.taxRate;
        
        // Total
        const total = subtotal + tax + bookingFee;
        
        // Update state
        this.currentBooking.subtotal = subtotal;
        this.currentBooking.tax = tax;
        this.currentBooking.bookingFee = bookingFee;
        this.currentBooking.totalAmount = total;
        
        return {
            seatTotal,
            concessionTotal,
            subtotal,
            tax,
            bookingFee,
            total
        };
    },
    
    getTotals() {
        return this.recalculateTotals();
    },
    
    // ========================================================
    // STEP 5: FINALIZE BOOKING
    // ========================================================
    async finalizeBooking(customerInfo) {
        // Validate required data
        if (!this.currentBooking.movie) {
            SavannahApp.showError('Please select a movie');
            return false;
        }
        
        if (!this.currentBooking.showtime) {
            SavannahApp.showError('Please select a showtime');
            return false;
        }
        
        if (this.currentBooking.seats.length === 0) {
            SavannahApp.showError('Please select at least one seat');
            return false;
        }
        
        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            SavannahApp.showError('Please fill in all customer details');
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerInfo.email)) {
            SavannahApp.showError('Please enter a valid email address');
            return false;
        }
        
        // Validate phone format (Ghana)
        const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
        if (!phoneRegex.test(customerInfo.phone)) {
            SavannahApp.showError('Please enter a valid phone number');
            return false;
        }
        
        // Generate booking reference
        const bookingReference = this.generateBookingReference();
        
        // Update customer info
        this.currentBooking.customer = customerInfo;
        this.currentBooking.bookingReference = bookingReference;
        this.currentBooking.step = 5;
        
        // Get totals
        const totals = this.getTotals();
        
        // Build booking data for confirmation
        const bookingData = {
            bookingReference: bookingReference,
            
            // Customer
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            
            // Movie
            movieId: this.currentBooking.movie.movie_id,
            movieTitle: this.currentBooking.movie.title,
            moviePoster: this.currentBooking.movie.poster_url,
            
            // Location
            cinemaName: this.currentBooking.cinema?.cinema_name || 'Savannah Cinema',
            branchName: this.currentBooking.branch?.branch_name || 'N/A',
            branchCity: this.currentBooking.branch?.city || '',
            
            // Showtime
            screenName: this.currentBooking.showtime.screen_name,
            screenType: this.currentBooking.showtime.screen_type,
            showtimeDate: this.currentBooking.showtime.date,
            showtimeStart: this.currentBooking.showtime.start_time,
            showtimeEnd: this.currentBooking.showtime.end_time,
            showtimeFormatted:
                `${SavannahApp.formatDate(this.currentBooking.showtime.date)} at ${SavannahApp.formatTime(this.currentBooking.showtime.start_time)}`,
            
            // Seats
            seats: this.currentBooking.seats.map(s => s.seat_id),
            seatCount: this.currentBooking.seats.length,
            seatDetails: this.currentBooking.seats,
            
            // Concessions
            concessions: this.currentBooking.concessions,
            
            // Financials
            subtotal: SavannahApp.formatCurrency(totals.subtotal),
            tax: SavannahApp.formatCurrency(totals.tax),
            bookingFee: SavannahApp.formatCurrency(totals.bookingFee),
            totalAmount: SavannahApp.formatCurrency(totals.total),
            totalAmountRaw: totals.total,
            
            // Metadata
            bookingDate: new Date().toISOString(),
            paymentMethod: this.currentBooking.paymentMethod
        };
        
        try {
            // Save last booking for confirmation page
            SavannahStorage.set(
                SavannahStorage.KEYS.LAST_BOOKING,
                bookingData
            );
            
            // Send simulated email
            if (typeof SavannahEmail !== 'undefined') {
                await SavannahEmail.sendBookingEmail(bookingData);
            }
            
            // Clear cart
            SavannahStorage.clearCart();
            
            // Add to booking history
            const history = SavannahStorage.get(SavannahStorage.KEYS.BOOKING_HISTORY, []);
            history.unshift(bookingData);
            SavannahStorage.set(SavannahStorage.KEYS.BOOKING_HISTORY, history.slice(0, 50));
            
            // Navigate to confirmation
            window.location.href = `confirmation.html?ref=${bookingReference}`;
            
            return bookingData;
        } catch (error) {
            console.error('Booking finalization error:', error);
            SavannahApp.showError('Failed to complete booking. Please try again.');
            return false;
        }
    },
    
    // ========================================================
    // BOOKING REFERENCE GENERATOR
    // ========================================================
    generateBookingReference() {
        const prefix = 'SVN';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    },
    
    // ========================================================
    // STATE MANAGEMENT
    // ========================================================
    saveBookingState() {
        SavannahStorage.setBookingData(this.currentBooking);
    },
    
    loadBookingState() {
        const saved = SavannahStorage.getBookingData();
        
        if (saved && saved.movie) {
            this.currentBooking = {
                ...this.currentBooking,
                ...saved
            };
        }
        
        return this.currentBooking;
    },
    
    reset() {
        this.currentBooking = {
            movie: null,
            branch: null,
            cinema: null,
            showtime: null,
            seats: [],
            concessions: [],
            customer: {
                name: '',
                email: '',
                phone: ''
            },
            paymentMethod: 'cash',
            subtotal: 0,
            tax: 0,
            bookingFee: 0,
            totalAmount: 0,
            step: 1,
            bookingReference: null
        };
        
        SavannahStorage.clearCart();
    },
    
    // ========================================================
    // VALIDATION HELPERS
    // ========================================================
    canProceedToSeatSelection() {
        return this.currentBooking.movie && this.currentBooking.showtime;
    },
    
    canProceedToCheckout() {
        return this.canProceedToSeatSelection() && this.currentBooking.seats.length > 0;
    },
    
    getBookingSummary() {
        const totals = this.getTotals();
        
        return {
            movie: this.currentBooking.movie?.title || 'Not selected',
            branch: this.currentBooking.branch?.branch_name || 'Not selected',
            showtime: this.currentBooking.showtime
                ? `${SavannahApp.formatDate(this.currentBooking.showtime.date)} at ${SavannahApp.formatTime(this.currentBooking.showtime.start_time)}`
                : 'Not selected',
            screen: this.currentBooking.showtime?.screen_name || 'Not selected',
            seats: this.currentBooking.seats.map(s => s.seat_id).join(', ') || 'None',
            seatCount: this.currentBooking.seats.length,
            concessions: this.currentBooking.concessions.length,
            concessionItems: this.currentBooking.concessions.map(c => 
                `${c.quantity}x ${c.product_name}`
            ).join(', ') || 'None',
            subtotal: SavannahApp.formatCurrency(totals.subtotal),
            tax: SavannahApp.formatCurrency(totals.tax),
            bookingFee: SavannahApp.formatCurrency(totals.bookingFee),
            total: SavannahApp.formatCurrency(totals.total),
            totalRaw: totals.total
        };
    },
    
    // ========================================================
    // SEAT AVAILABILITY HELPERS
    // ========================================================
    getAvailableSeatsForShowtime() {
        if (!this.currentBooking.showtime) return [];
        
        const layout = SavannahApp.getScreenLayout(
            this.currentBooking.showtime.screen_id
        );
        
        if (!layout) return [];
        
        const allSeats = [];
        const occupied = new Set(layout.occupied_seats || []);
        
        layout.row_letters.forEach(row => {
            for (let i = 1; i <= layout.seats_per_row; i++) {
                const seatId = `${row}${String(i).padStart(2, '0')}`;
                allSeats.push({
                    seat_id: seatId,
                    row: row,
                    number: i,
                    isOccupied: occupied.has(seatId),
                    isPremium: layout.premium_rows.includes(row),
                    isVip: layout.vip_rows.includes(row),
                    isAccessible: layout.accessible_rows.includes(row)
                });
            }
        });
        
        return allSeats;
    },
    
    getSeatPrice(seat) {
        if (!this.currentBooking.showtime) return 0;
        
        const showtime = this.currentBooking.showtime;
        
        if (seat.isVip && showtime.vip_price) {
            return showtime.vip_price;
        }
        
        if (seat.isPremium && showtime.premium_price) {
            return showtime.premium_price;
        }
        
        return showtime.base_price || 0;
    }
};