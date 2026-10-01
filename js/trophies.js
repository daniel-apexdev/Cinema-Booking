// ============================================================
// js/trophies.js
// Savannah Cinemas — Trophy, Points & Streak Engine
// Depends on: SavannahStorage, SavannahApp, SAVANNAH_TROPHIES
// ============================================================

const SavannahTrophies = {

    // ========================================================
    // STORAGE KEYS (extend SavannahStorage.KEYS if missing)
    // ========================================================
    KEYS: {
        USER_TROPHIES:      'svn_user_trophies_v1',      // { [trophyId]: { unlockedAt, featured } }
        POINTS_LEDGER:      'svn_points_ledger_v1',      // [{ id, ts, delta, reason, meta }]
        POINTS_BALANCE:     'svn_points_balance_v1',     // number
        USER_STATS:         'svn_user_stats_v1',         // lifetime counters + streaks
        UNLOCK_QUEUE:       'svn_unlock_queue_v1'        // trophies unlocked but not yet celebrated
    },

    // ========================================================
    // INIT
    // ========================================================
    init() {
        this._ensureKeys();
        this._ensureStatsShape();
    },

    _ensureKeys() {
        if (typeof SavannahStorage === 'undefined') return;
        SavannahStorage.KEYS = SavannahStorage.KEYS || {};
        Object.entries(this.KEYS).forEach(([k, v]) => {
            if (!SavannahStorage.KEYS[k]) SavannahStorage.KEYS[k] = v;
        });
    },

    _ensureStatsShape() {
        const stats = this.getStats();
        const defaults = this._defaultStats();
        let changed = false;
        Object.keys(defaults).forEach(k => {
            if (stats[k] === undefined) { stats[k] = defaults[k]; changed = true; }
        });
        if (changed) this._setStats(stats);
    },

    _defaultStats() {
        return {
            lifetimeMoviesWatched: 0,
            lifetimeBookings: 0,
            lifetimeSpentRaw: 0,
            lifetimePointsEarned: 0,
            lifetimePointsSpent: 0,
            genreCounts: {},          // { Action: 4, Comedy: 2, ... }
            franchiseCounts: {},      // { Marvel: 3, ... }
            collectionCounts: {},     // { hp: 5, ... } — by collection id
            distinctScreens: {},      // { screen_id: true }
            distinctBranches: {},     // { branch_id: true }
            eveningScreenings: 0,
            afternoonScreenings: 0,
            firstOfDayCount: 0,
            lastOfDayCount: 0,
            moviesPerDay: {},         // { 'YYYY-MM-DD': count }
            weekVisitStamps: [],      // ['2026-W40', ...] deduped
            monthVisitStamps: [],     // ['2026-09', ...] deduped
            weekendVisitStamps: [],   // ['2026-W40'] weekends only
            currentWeekStreak: 0,
            longestWeekStreak: 0,
            currentWeekendStreak: 0,
            longestWeekendStreak: 0,
            currentMonthStreak: 0,
            longestMonthStreak: 0,
            lastVisitDate: null,
            firstVisitDate: null,
            concessionsPurchaseCount: 0,
            popcornPurchaseCount: 0,
            reviewsWritten: 0,
            referralCount: 0,
            groupBookingMax: 0,
            withFriendCounts: {},     // { friendUserId: count } — future
            watchlistAddsTotal: 0,
            processedBookingRefs: {}  // dedupe so we never double-count a booking
        };
    },

    // ========================================================
    // STATS ACCESS
    // ========================================================
    getStats() {
        return SavannahStorage.get(this.KEYS.USER_STATS, this._defaultStats());
    },

    _setStats(stats) {
        SavannahStorage.set(this.KEYS.USER_STATS, stats);
    },

    // ========================================================
    // POINTS
    // ========================================================
    getPointsBalance() {
        return Number(SavannahStorage.get(this.KEYS.POINTS_BALANCE, 0)) || 0;
    },

    getPointsLedger() {
        return SavannahStorage.get(this.KEYS.POINTS_LEDGER, []) || [];
    },

    /**
     * Award points. Positive delta = earn, negative = spend.
     * reason is a short machine-ish string ('booking', 'trophy', 'redeem').
     */
    awardPoints(delta, reason, meta = {}) {
        const d = Number(delta) || 0;
        if (!d) return this.getPointsBalance();

        const ledger = this.getPointsLedger();
        ledger.unshift({
            id: `pts_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            ts: new Date().toISOString(),
            delta: d,
            reason,
            meta
        });

        // Keep ledger reasonable
        const trimmed = ledger.slice(0, 500);
        SavannahStorage.set(this.KEYS.POINTS_LEDGER, trimmed);

        const balance = this.getPointsBalance() + d;
        SavannahStorage.set(this.KEYS.POINTS_BALANCE, balance);

        const stats = this.getStats();
        if (d > 0) stats.lifetimePointsEarned += d;
        else stats.lifetimePointsSpent += Math.abs(d);
        this._setStats(stats);

        return balance;
    },

    // ========================================================
    // TROPHY ACCESS
    // ========================================================
    getUserTrophies() {
        return SavannahStorage.get(this.KEYS.USER_TROPHIES, {}) || {};
    },

    hasTrophy(trophyId) {
        return !!this.getUserTrophies()[trophyId];
    },

    getTrophyDefinition(trophyId) {
        return (SAVANNAH_TROPHIES.TROPHIES || []).find(t => t.id === trophyId) || null;
    },

    getMasterForSet(setId) {
        const set = SAVANNAH_TROPHIES.SETS?.[setId];
        return set?.master || null;
    },

    getAllDefinitions() {
        // Combines base trophies + set masters so the cabinet can render both
        const base = (SAVANNAH_TROPHIES.TROPHIES || []).slice();
        const masters = Object.values(SAVANNAH_TROPHIES.SETS || {})
            .map(s => s.master)
            .filter(Boolean);
        return base.concat(masters);
    },

    getUnlockedCount() {
        return Object.keys(this.getUserTrophies()).length;
    },

    getTotalCount() {
        return this.getAllDefinitions().filter(t => this._isAvailable(t)).length;
    },

    // ========================================================
    // UNLOCK LOGIC
    // ========================================================
    _isAvailable(def) {
        if (!def) return false;
        if (def.active === false) return false;
        if (def.window) {
            const w = SAVANNAH_TROPHIES.WINDOWS?.[def.window];
            if (!w) return false;
            const today = this._todayISODate();
            if (today < w.start || today > w.end) return false;
        }
        return true;
    },

    _unlockTrophy(trophyId, meta = {}) {
        if (this.hasTrophy(trophyId)) return false;
        const def = this.getTrophyDefinition(trophyId) || this.getMasterForSet(trophyId);
        if (!def) return false;

        const userTrophies = this.getUserTrophies();
        userTrophies[trophyId] = {
            unlockedAt: new Date().toISOString(),
            featured: false,
            ...meta
        };
        SavannahStorage.set(this.KEYS.USER_TROPHIES, userTrophies);

        // Queue for celebration UI
        const queue = SavannahStorage.get(this.KEYS.UNLOCK_QUEUE, []) || [];
        queue.push({ trophyId, unlockedAt: new Date().toISOString() });
        SavannahStorage.set(this.KEYS.UNLOCK_QUEUE, queue);

        // Points reward
        const rarity = SAVANNAH_TROPHIES.RARITIES?.[def.rarity];
        const rarityBonus = SAVANNAH_TROPHIES.POINTS?.rarity_bonus?.[def.rarity] || 0;
        const trophyPoints = (def.reward_type === 'reward' && def.points) ? def.points : 0;
        const totalPoints = trophyPoints + (rarityBonus && def.reward_type !== 'recognition' ? rarityBonus : 0);

        if (totalPoints > 0) {
            this.awardPoints(totalPoints, 'trophy', { trophyId, rarity: def.rarity });
        }

        // If this trophy completes a set → unlock the master
        this._checkSetCompletion(def.set);

        return { def, pointsAwarded: totalPoints };
    },

    _checkSetCompletion(setId) {
        if (!setId) return;
        const set = SAVANNAH_TROPHIES.SETS?.[setId];
        if (!set) return;

        const allMembersOwned = set.members.every(m => this.hasTrophy(m));
        if (!allMembersOwned) return;
        if (!set.master) return;
        if (this.hasTrophy(set.master.id)) return;

        // Recurse safely — masters have no .set
        this._unlockTrophy(set.master.id);
    },

    /**
     * Drain the unlock queue — used by the notification UI.
     */
    drainUnlockQueue() {
        const queue = SavannahStorage.get(this.KEYS.UNLOCK_QUEUE, []) || [];
        SavannahStorage.set(this.KEYS.UNLOCK_QUEUE, []);
        return queue;
    },

    // ========================================================
    // BOOKING INGESTION
    // Called when a booking's showtime has passed.
    // Deduped by bookingReference.
    // ========================================================
    ingestBooking(booking) {
        if (!booking || !booking.bookingReference) return [];

        const stats = this.getStats();
        if (stats.processedBookingRefs?.[booking.bookingReference]) {
            return []; // already counted
        }
        stats.processedBookingRefs = stats.processedBookingRefs || {};
        stats.processedBookingRefs[booking.bookingReference] = true;

        // -------- Lifetime counters --------
        const seatCount = Number(booking.seatCount) || (booking.seats?.length || 0);
        stats.lifetimeMoviesWatched += 1;   // 1 booking = 1 watched film
        stats.lifetimeBookings += 1;
        stats.lifetimeSpentRaw += Number(booking.totalAmountRaw) || 0;

        // -------- Genre / franchise / collection --------
        const movie = (typeof SavannahApp !== 'undefined' && booking.movieId)
            ? SavannahApp.getMovieById(booking.movieId)
            : null;

        if (movie) {
            const genres = Array.isArray(movie.genre) ? movie.genre : [];
            genres.forEach(g => {
                stats.genreCounts[g] = (stats.genreCounts[g] || 0) + 1;
            });

            const franchise = movie.franchise || movie.collection || null;
            if (franchise) {
                stats.franchiseCounts[franchise] = (stats.franchiseCounts[franchise] || 0) + 1;
            }
            if (movie.collection_id) {
                stats.collectionCounts[movie.collection_id] =
                    (stats.collectionCounts[movie.collection_id] || 0) + 1;
            }
        }

        // -------- Screens / branches --------
        if (booking.screenName) stats.distinctScreens[booking.screenName] = true;
        if (booking.branchName) stats.distinctBranches[booking.branchName] = true;

        // -------- Time-of-day --------
        const startHHMM = booking.showtimeStart || '';
        if (startHHMM) {
            const [hStr] = startHHMM.split(':');
            const h = parseInt(hStr, 10);
            if (!isNaN(h)) {
                if (h >= 18) stats.eveningScreenings += 1;
                if (h < 15)  stats.afternoonScreenings += 1;
            }
        }

                // -------- First / last of day (lazy) --------
        if (booking.showtimeStart && booking.showtimeDate && booking.branchName) {
            const fl = this._firstAndLastOfDay(
                booking.branchName,
                booking.showtimeDate
            );
            if (fl.first === booking.showtimeStart) stats.firstOfDayCount += 1;
            if (fl.last  === booking.showtimeStart) stats.lastOfDayCount += 1;
        }

        // -------- Movies per day --------
        const day = booking.showtimeDate || this._todayISODate();
        stats.moviesPerDay[day] = (stats.moviesPerDay[day] || 0) + 1;

        // -------- Streaks (week / month / weekend) --------
        this._updateStreaks(stats, day);

        // -------- Group booking --------
        stats.groupBookingMax = Math.max(stats.groupBookingMax, seatCount);

        // -------- Concessions --------
        if (Array.isArray(booking.concessions) && booking.concessions.length) {
            stats.concessionsPurchaseCount += 1;
            const hasPopcorn = booking.concessions.some(c =>
                /popcorn/i.test(c.product_name || '')
            );
            if (hasPopcorn) stats.popcornPurchaseCount += 1;
        }

        // -------- First visit --------
        if (!stats.firstVisitDate) stats.firstVisitDate = day;
        stats.lastVisitDate = day;

        this._setStats(stats);

        // -------- Points: base + bonuses --------
        const base = (Number(booking.totalAmountRaw) || 0)
            * (SAVANNAH_TROPHIES.POINTS?.per_currency_unit || 1);

        let multiplier = 1;
        const bonuses = SAVANNAH_TROPHIES.POINTS?.bonuses || {};
        if (this._isWeekend(day)) multiplier += bonuses.weekend || 0;
        if (startHHMM && parseInt(startHHMM.split(':')[0], 10) < 15) {
            multiplier += bonuses.matinee || 0;
        }
        const hasPremium = Array.isArray(booking.seatDetails) &&
            booking.seatDetails.some(s => /^[A-C]/.test(s.seat_id || ''));
        if (hasPremium) multiplier += bonuses.premium_seat || 0;

        const earned = Math.round(base * multiplier);
        if (earned > 0) {
            this.awardPoints(earned, 'booking', {
                bookingReference: booking.bookingReference,
                movieTitle: booking.movieTitle
            });
        }

        // -------- Evaluate trophies --------
        const newlyUnlocked = this.evaluateTrophies();
        return newlyUnlocked;
    },

    _updateStreaks(stats, dayISO) {
        // Week key: ISO-ish "YYYY-Www"
        const weekKey = this._weekKey(dayISO);
        const monthKey = dayISO.slice(0, 7); // 'YYYY-MM'

        if (!stats.weekVisitStamps.includes(weekKey)) {
            stats.weekVisitStamps.push(weekKey);
            stats.weekVisitStamps = stats.weekVisitStamps.slice(-104);
        }
        if (!stats.monthVisitStamps.includes(monthKey)) {
            stats.monthVisitStamps.push(monthKey);
            stats.monthVisitStamps = stats.monthVisitStamps.slice(-60);
        }
        if (this._isWeekend(dayISO) && !stats.weekendVisitStamps.includes(weekKey)) {
            stats.weekendVisitStamps.push(weekKey);
            stats.weekendVisitStamps = stats.weekendVisitStamps.slice(-104);
        }

        stats.currentWeekStreak    = this._computeConsecutive(stats.weekVisitStamps);
        stats.longestWeekStreak    = Math.max(stats.longestWeekStreak, stats.currentWeekStreak);
        stats.currentWeekendStreak = this._computeConsecutive(stats.weekendVisitStamps);
        stats.longestWeekendStreak = Math.max(stats.longestWeekendStreak, stats.currentWeekendStreak);
        stats.currentMonthStreak   = this._computeConsecutive(stats.monthVisitStamps);
        stats.longestMonthStreak   = Math.max(stats.longestMonthStreak, stats.currentMonthStreak);
    },

    // Counts the trailing consecutive periods in a sorted list of keys.
    _computeConsecutive(sortedKeys) {
        if (!Array.isArray(sortedKeys) || !sortedKeys.length) return 0;
        const keys = sortedKeys.slice().sort();
        let run = 1, best = 1;
        for (let i = 1; i < keys.length; i++) {
            if (this._isNextPeriod(keys[i - 1], keys[i])) run += 1;
            else run = 1;
            best = Math.max(best, run);
        }
        return best;
    },

    _isNextPeriod(prev, next) {
        if (prev.length === 7 && next.length === 7 && prev[4] === 'W') {
            // YYYY-Www
            const [py, pw] = [parseInt(prev.slice(0, 4), 10), parseInt(prev.slice(5), 10)];
            const [ny, nw] = [parseInt(next.slice(0, 4), 10), parseInt(next.slice(5), 10)];
            if (py === ny && nw === pw + 1) return true;
            if (ny === py + 1 && pw >= 52 && nw === 1) return true;
            return false;
        }
        // 'YYYY-MM'
        const [py, pm] = [parseInt(prev.slice(0, 4), 10), parseInt(prev.slice(5), 10)];
        const [ny, nm] = [parseInt(next.slice(0, 4), 10), parseInt(next.slice(5), 10)];
        if (py === ny && nm === pm + 1) return true;
        if (ny === py + 1 && pm === 12 && nm === 1) return true;
        return false;
    },

    // ========================================================
    // TROPHY EVALUATION
    // Runs every requirement against current stats.
    // Returns array of newly unlocked trophy ids.
    // ========================================================
    evaluateTrophies() {
        const stats = this.getStats();
        const newly = [];

        // Base trophies
        (SAVANNAH_TROPHIES.TROPHIES || []).forEach(def => {
            if (!this._isAvailable(def)) return;
            if (this.hasTrophy(def.id)) return;
            if (this._meetsRequirement(def.requirement, stats)) {
                const r = this._unlockTrophy(def.id);
                if (r) newly.push(def.id);
            }
        });

        return newly;
    },

    _meetsRequirement(req, stats) {
        if (!req || !req.type) return false;
        const v = Number(req.value) || 0;

        switch (req.type) {
            case 'movies_watched':
                return stats.lifetimeMoviesWatched >= v;

            case 'genre_watched':
                return (stats.genreCounts[req.filter] || 0) >= v;

            case 'genre_variety': {
                // req.value = min per genre, req.filter = number of genres
                const minPerGenre = v;
                const genreTarget = Number(req.filter) || 0;
                const qualifying = Object.values(stats.genreCounts)
                    .filter(c => c >= minPerGenre).length;
                return qualifying >= genreTarget;
            }

            case 'franchise_watched':
                return (stats.franchiseCounts[req.filter] || 0) >= v;

            case 'collection_complete': {
                // Not yet supported without movie.collection_id data
                return false;
            }

            case 'weekend_streak':
                return stats.longestWeekendStreak >= v;

            case 'week_streak':
                return stats.longestWeekStreak >= v;

            case 'month_streak':
                return stats.longestMonthStreak >= v;

            case 'evening_screenings':
                return stats.eveningScreenings >= v;

            case 'afternoon_screenings':
                return stats.afternoonScreenings >= v;

            case 'first_of_day':
                return stats.firstOfDayCount >= v;

            case 'last_of_day':
                return stats.lastOfDayCount >= v;

            case 'movies_in_one_day':
                return Object.values(stats.moviesPerDay).some(c => c >= v);

            case 'group_booking':
                return stats.groupBookingMax >= v;

            case 'with_friend':
                // Requires a friends system — 0 until built
                return false;

            case 'referrals':
                return stats.referralCount >= v;

            case 'concessions_purchases':
                return stats.concessionsPurchaseCount >= v;

            case 'reviews_written':
                return stats.reviewsWritten >= v;

            case 'screens_visited':
                return Object.keys(stats.distinctScreens).length >= v;

            case 'date_window': {
                // Season-limited trophies: count movies watched inside the window
                const w = SAVANNAH_TROPHIES.WINDOWS?.[req.filter];
                if (!w) return false;
                const inWindow = Object.entries(stats.moviesPerDay)
                    .filter(([d]) => d >= w.start && d <= w.end)
                    .reduce((sum, [, c]) => sum + c, 0);
                return inWindow >= v;
            }

            default:
                return false;
        }
    },

    // ========================================================
    // FEATURED TROPHIES
    // ========================================================
    setFeatured(trophyId, on = true) {
        const owned = this.getUserTrophies();
        if (!owned[trophyId]) return false;
        owned[trophyId].featured = !!on;
        SavannahStorage.set(this.KEYS.USER_TROPHIES, owned);
        return true;
    },

    getFeatured(limit = 4) {
        const owned = this.getUserTrophies();
        return Object.entries(owned)
            .filter(([, v]) => v.featured)
            .slice(0, limit)
            .map(([id]) => id);
    },

    // ========================================================
    // CABINET VIEW MODEL — used by trophies.html
    // ========================================================
    getCabinetViewModel() {
        const owned = this.getUserTrophies();
        const all = this.getAllDefinitions();
        const byCategory = {};

        all.forEach(def => {
            const cat = def.category || (def.id.endsWith('_master') ? 'legendary' : 'milestones');
            byCategory[cat] = byCategory[cat] || [];
            const unlocked = !!owned[def.id];
            const hidden = def.secret && !unlocked;

            byCategory[cat].push({
                id: def.id,
                name: hidden ? '???' : def.name,
                description: hidden ? 'Something special is waiting…' : def.description,
                icon: hidden ? '❓' : def.icon,
                rarity: def.rarity,
                category: cat,
                reward_type: def.reward_type,
                points: def.points || 0,
                perk: def.perk || null,
                secret: !!def.secret,
                hidden,
                unlocked,
                unlockedAt: unlocked ? owned[def.id].unlockedAt : null,
                featured: unlocked ? !!owned[def.id].featured : false,
                set: def.set || null
            });
        });

        return {
            unlockedCount: this.getUnlockedCount(),
            totalCount: this.getTotalCount(),
            pointsBalance: this.getPointsBalance(),
            stats: this.getStats(),
            categories: byCategory
        };
    },

    // ========================================================
    // DATE HELPERS (Africa/Accra default)
    // ========================================================
    _todayISODate() {
        return new Date().toISOString().slice(0, 10);
    },

    _isWeekend(iso) {
        const d = new Date(iso + 'T12:00:00Z');
        const dow = d.getUTCDay(); // 0=Sun, 6=Sat
        return dow === 0 || dow === 6;
    },

        /**
     * Given a branch name and a date ('YYYY-MM-DD'), return the earliest
     * and latest start_time among OPEN showtimes for that branch/day.
     * Uses SavannahApp.data.showtimes as the source of truth.
     */
    _firstAndLastOfDay(branchName, dateISO) {
        const empty = { first: null, last: null };
        if (typeof SavannahApp === 'undefined') return empty;
        const showtimes = SavannahApp?.data?.showtimes || [];

        // Resolve branch_id from branch name once per call
        const branch = (SavannahApp.data.branches || []).find(
            b => b.branch_name === branchName
        );
        if (!branch) return empty;

        const todays = showtimes.filter(s =>
            s.branch_id === branch.branch_id &&
            s.date === dateISO &&
            s.status === 'OPEN'
        );
        if (!todays.length) return empty;

        let first = todays[0].start_time;
        let last  = todays[0].start_time;
        for (const s of todays) {
            if (s.start_time < first) first = s.start_time;
            if (s.start_time > last)  last  = s.start_time;
        }
        return { first, last };
    },

    _weekKey(iso) {
        // ISO 8601 week number
        const d = new Date(iso + 'T12:00:00Z');
        const day = (d.getUTCDay() + 6) % 7; // Mon=0
        d.setUTCDate(d.getUTCDate() - day + 3); // Thursday of week
        const year = d.getUTCFullYear();
        const jan4 = new Date(Date.UTC(year, 0, 4));
        const jan4Day = (jan4.getUTCDay() + 6) % 7;
        jan4.setUTCDate(jan4.getUTCDate() - jan4Day + 3);
        const week = 1 + Math.round((d - jan4) / (7 * 24 * 3600 * 1000));
        return `${year}-W${String(week).padStart(2, '0')}`;
    },

    // ========================================================
    // BACKFILL — run once on first load for existing accounts
    // ========================================================
    backfillFromHistory() {
        if (typeof SavannahStorage === 'undefined') return;
        const history = SavannahStorage.get(
            SavannahStorage.KEYS.BOOKING_HISTORY, []
        ) || [];
        if (!history.length) return;

        const stats = this.getStats();
        const now = new Date();
        const past = history
            .filter(b => {
                const d = b.showtimeDate ? new Date(b.showtimeDate + 'T23:59:59') : null;
                return d && d < now;
            })
            .sort((a, b) => new Date(a.showtimeDate) - new Date(b.showtimeDate));

        past.forEach(b => {
            if (stats.processedBookingRefs?.[b.bookingReference]) return;
            // Reuse ingest but suppress duplicate point awards by zeroing totalAmountRaw
            const clone = { ...b, totalAmountRaw: 0 };
            this.ingestBooking(clone);
        });
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.SavannahTrophies = SavannahTrophies;
}