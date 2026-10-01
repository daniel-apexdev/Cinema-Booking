// ============================================================
// data/trophies-definitions.js
// Savannah Cinemas — Trophies, Sets, Rarities, Rewards
// Pure data. No logic. Edit freely.
// ============================================================

const SAVANNAH_TROPHIES = {

    // --------------------------------------------------------
    // RARITY TIERS
    // --------------------------------------------------------
    RARITIES: {
        common:    { id: 'common',    label: 'Common',    icon: '🥉', color: '#B08D57', points: 0,   order: 1 },
        rare:      { id: 'rare',      label: 'Rare',      icon: '🥈', color: '#9FB4C7', points: 0,   order: 2 },
        epic:      { id: 'epic',      label: 'Epic',      icon: '🥇', color: '#E8B34C', points: 0,   order: 3 },
        legendary: { id: 'legendary', label: 'Legendary', icon: '💎', color: '#B33951', points: 0,   order: 4 }
    },

    // --------------------------------------------------------
    // REWARD TYPES
    //  recognition = cosmetic only
    //  reward      = trophy + points
    //  unlock      = trophy + non-point perk (labeled in `perk`)
    // --------------------------------------------------------
    REWARD_TYPES: {
        recognition: { id: 'recognition', label: 'Recognition', icon: '🏆' },
        reward:      { id: 'reward',      label: 'Reward',      icon: '⭐' },
        unlock:      { id: 'unlock',      label: 'Unlock',      icon: '🎁' }
    },

    // --------------------------------------------------------
    // REQUIREMENT TYPES
    // The unlock engine in js/trophies.js resolves these
    // against the user's booking history + derived stats.
    // --------------------------------------------------------
    REQUIREMENT_TYPES: {
        movies_watched:        'Total films watched',
        genre_watched:         'Films watched in a genre (value = count, filter = genre)',
        genre_variety:         'Distinct genres seen at least N times',
        franchise_watched:     'Films watched in a franchise (filter = franchise)',
        collection_complete:   'Watch every film in a defined list (filter = collection id)',
        weekend_streak:        'Consecutive weekends with a visit',
        week_streak:           'Consecutive weeks with a visit',
        month_streak:          'Consecutive months with at least one visit',
        evening_screenings:    'Evening screenings attended',
        afternoon_screenings:  'Afternoon screenings attended',
        first_of_day:          'First screening of the day attended',
        last_of_day:           'Last screening of the day attended',
        movies_in_one_day:     'Films watched in a single day',
        group_booking:         'Seats booked in a single booking',
        with_friend:           'Films watched with a linked friend',
        referrals:             'Friends referred who completed a first booking',
        concessions_purchases: 'Concession purchases',
        reviews_written:       'Reviews written',
        screens_visited:       'Distinct screens visited',
        date_window:           'Films watched within a date range (filter = window id)'
    },

    // --------------------------------------------------------
    // SEASONAL / LIMITED WINDOWS
    // Used by date_window requirements and seasonal sets.
    // year is included so seasons can repeat year over year.
    // --------------------------------------------------------
    WINDOWS: {
        halloween_2026:  { id: 'halloween_2026',  label: 'Halloween 2026',  start: '2026-10-01', end: '2026-10-31' },
        valentines_2027: { id: 'valentines_2027', label: "Valentine's 2027", start: '2027-02-10', end: '2027-02-14' },
        christmas_2026:  { id: 'christmas_2026',  label: 'Christmas 2026',  start: '2026-12-01', end: '2026-12-31' },
        summer_2027:     { id: 'summer_2027',     label: 'Summer 2027',     start: '2027-06-01', end: '2027-08-31' }
    },

    // --------------------------------------------------------
    // FRANCHISES
    // Filter values for franchise_watched requirements.
    // Match against movie.franchise or movie.collection.
    // --------------------------------------------------------
    FRANCHISES: {
        marvel:   'Marvel',
        dc:       'DC',
        starwars: 'Star Wars',
        hp:       'Harry Potter',
        fast:     'Fast & Furious'
    },

    // --------------------------------------------------------
    // GENRES
    // Canonical genre strings the engine will match against
    // movie.genre[] (case-insensitive).
    // --------------------------------------------------------
    GENRES: {
        action:    'Action',
        comedy:    'Comedy',
        horror:    'Horror',
        romance:   'Romance',
        scifi:     'Sci-Fi',
        thriller:  'Thriller',
        drama:     'Drama',
        animation: 'Animation',
        ghanaian:  'Ghanaian'
    },

    // ========================================================
    // TROPHY DEFINITIONS
    // ========================================================
    // Fields:
    //   id              unique key
    //   name            display name
    //   description     user-facing requirement text
    //   icon            emoji / short label
    //   category        grouping key (matches CATEGORIES below)
    //   rarity          common | rare | epic | legendary
    //   reward_type     recognition | reward | unlock
    //   points          bonus points on unlock (reward_type = reward)
    //   perk            optional text (reward_type = unlock)
    //   requirement     { type, value, filter? }
    //   set             set id this trophy belongs to (optional)
    //   secret          true = hidden until unlocked
    //   window          window id (for limited-edition)
    //   active          false disables the trophy
    // ========================================================
    TROPHIES: [

        // ----------------------------------------------------
        // CINEMA MILESTONES
        // ----------------------------------------------------
        {
            id: 'first_screening',
            name: 'First Screening',
            description: 'Watch your first movie at Savannah Cinemas.',
            icon: '🎬',
            category: 'milestones',
            rarity: 'common',
            reward_type: 'reward',
            points: 100,
            requirement: { type: 'movies_watched', value: 1 },
            set: 'movie_lover'
        },
        {
            id: 'movie_buff',
            name: 'Movie Buff',
            description: 'Watch 5 movies.',
            icon: '🍿',
            category: 'milestones',
            rarity: 'common',
            reward_type: 'reward',
            points: 250,
            requirement: { type: 'movies_watched', value: 5 },
            set: 'movie_lover'
        },
        {
            id: 'film_enthusiast',
            name: 'Film Enthusiast',
            description: 'Watch 10 movies.',
            icon: '🎞️',
            category: 'milestones',
            rarity: 'rare',
            reward_type: 'reward',
            points: 500,
            requirement: { type: 'movies_watched', value: 10 },
            set: 'movie_lover'
        },
        {
            id: 'cinema_regular',
            name: 'Cinema Regular',
            description: 'Watch 25 movies at Savannah Cinemas.',
            icon: '🎥',
            category: 'milestones',
            rarity: 'epic',
            reward_type: 'reward',
            points: 500,
            requirement: { type: 'movies_watched', value: 25 },
            set: 'movie_lover'
        },
        {
            id: 'silver_screen_veteran',
            name: 'Silver Screen Veteran',
            description: 'Watch 50 movies.',
            icon: '🎦',
            category: 'milestones',
            rarity: 'epic',
            reward_type: 'recognition',
            requirement: { type: 'movies_watched', value: 50 },
            set: 'movie_lover'
        },
        {
            id: 'savannah_legend',
            name: 'Savannah Legend',
            description: 'Watch 100 movies.',
            icon: '👑',
            category: 'milestones',
            rarity: 'legendary',
            reward_type: 'unlock',
            perk: 'Permanent Legendary badge on your profile',
            requirement: { type: 'movies_watched', value: 100 },
            set: 'movie_lover'
        },

        // ----------------------------------------------------
        // GENRE TROPHIES
        // ----------------------------------------------------
        {
            id: 'action_hero',
            name: 'Action Hero',
            description: 'Watch 10 action movies.',
            icon: '💥',
            category: 'genre',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'genre_watched', value: 10, filter: 'Action' },
            set: 'genre_explorer'
        },
        {
            id: 'comedy_king',
            name: 'Comedy King',
            description: 'Watch 10 comedies.',
            icon: '😂',
            category: 'genre',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'genre_watched', value: 10, filter: 'Comedy' },
            set: 'genre_explorer'
        },
        {
            id: 'fearless',
            name: 'Fearless',
            description: 'Watch 10 horror movies.',
            icon: '👻',
            category: 'genre',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'genre_watched', value: 10, filter: 'Horror' },
            set: 'genre_explorer'
        },
        {
            id: 'romantic',
            name: 'Romantic',
            description: 'Watch 10 romance movies.',
            icon: '💕',
            category: 'genre',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'genre_watched', value: 10, filter: 'Romance' },
            set: 'genre_explorer'
        },
        {
            id: 'beyond_earth',
            name: 'Beyond Earth',
            description: 'Watch 10 sci-fi movies.',
            icon: '🚀',
            category: 'genre',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'genre_watched', value: 10, filter: 'Sci-Fi' },
            set: 'genre_explorer'
        },
        {
            id: 'detective',
            name: 'Detective',
            description: 'Watch 10 mystery or thriller movies.',
            icon: '🕵️',
            category: 'genre',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'genre_watched', value: 10, filter: 'Thriller' },
            set: 'genre_explorer'
        },
        {
            id: 'genre_collector',
            name: 'Genre Collector',
            description: 'Watch at least 5 movies from 8 different genres.',
            icon: '🌍',
            category: 'genre',
            rarity: 'epic',
            reward_type: 'reward',
            points: 750,
            requirement: { type: 'genre_variety', value: 5, filter: 8 },
            set: 'genre_explorer'
        },

        // ----------------------------------------------------
        // FRANCHISE / COLLECTION
        // ----------------------------------------------------
        {
            id: 'marvel_collector',
            name: 'Marvel Collector',
            description: 'Watch 5 Marvel movies.',
            icon: '🦸',
            category: 'franchise',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'franchise_watched', value: 5, filter: 'Marvel' }
        },
        {
            id: 'dc_collector',
            name: 'DC Collector',
            description: 'Watch 5 DC movies.',
            icon: '🦇',
            category: 'franchise',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'franchise_watched', value: 5, filter: 'DC' }
        },
        {
            id: 'franchise_fan',
            name: 'Franchise Fan',
            description: 'Watch every movie in a selected franchise.',
            icon: '🧙',
            category: 'franchise',
            rarity: 'epic',
            reward_type: 'reward',
            points: 1000,
            requirement: { type: 'collection_complete', value: 1 }
        },

        // ----------------------------------------------------
        // ATTENDANCE
        // ----------------------------------------------------
        {
            id: 'weekend_warrior',
            name: 'Weekend Warrior',
            description: 'Watch movies on 3 consecutive weekends.',
            icon: '📅',
            category: 'attendance',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'weekend_streak', value: 3 },
            set: 'streak'
        },
        {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Attend 5 evening screenings.',
            icon: '🌙',
            category: 'attendance',
            rarity: 'rare',
            reward_type: 'reward',
            points: 250,
            requirement: { type: 'evening_screenings', value: 5 }
        },
        {
            id: 'early_bird',
            name: 'Early Bird',
            description: 'Attend 5 afternoon screenings.',
            icon: '☀️',
            category: 'attendance',
            rarity: 'rare',
            reward_type: 'reward',
            points: 250,
            requirement: { type: 'afternoon_screenings', value: 5 }
        },
        {
            id: 'cinema_streak',
            name: 'Cinema Streak',
            description: 'Visit Savannah 4 weeks in a row.',
            icon: '🔥',
            category: 'attendance',
            rarity: 'epic',
            reward_type: 'reward',
            points: 600,
            requirement: { type: 'week_streak', value: 4 },
            set: 'streak'
        },
        {
            id: 'monthly_regular',
            name: 'Monthly Regular',
            description: 'Watch at least one movie every month for 6 months.',
            icon: '🗓️',
            category: 'attendance',
            rarity: 'epic',
            reward_type: 'reward',
            points: 800,
            requirement: { type: 'month_streak', value: 6 },
            set: 'streak'
        },

        // ----------------------------------------------------
        // SOCIAL
        // ----------------------------------------------------
        {
            id: 'movie_buddy',
            name: 'Movie Buddy',
            description: 'Watch 5 movies with another Savannah user.',
            icon: '👥',
            category: 'social',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'with_friend', value: 5 },
            set: 'social'
        },
        {
            id: 'dynamic_duo',
            name: 'Dynamic Duo',
            description: 'Watch 3 movies with the same friend.',
            icon: '👫',
            category: 'social',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'with_friend', value: 3, filter: 'same_friend' },
            set: 'social'
        },
        {
            id: 'group_screening',
            name: 'Group Screening',
            description: 'Book 4 or more seats in a single booking.',
            icon: '👨‍👩‍👧‍👦',
            category: 'social',
            rarity: 'common',
            reward_type: 'reward',
            points: 200,
            requirement: { type: 'group_booking', value: 4 },
            set: 'social'
        },
        {
            id: 'the_connector',
            name: 'The Connector',
            description: 'Refer 5 friends who complete their first booking.',
            icon: '🎟️',
            category: 'social',
            rarity: 'epic',
            reward_type: 'reward',
            points: 1000,
            requirement: { type: 'referrals', value: 5 },
            set: 'social'
        },

        // ----------------------------------------------------
        // SEASONAL CHALLENGES
        // ----------------------------------------------------
        {
            id: 'halloween_horror_hunter',
            name: 'Halloween Horror Hunter',
            description: 'Watch 3 horror movies in October.',
            icon: '🎃',
            category: 'challenge',
            rarity: 'rare',
            reward_type: 'reward',
            points: 500,
            requirement: { type: 'date_window', value: 3, filter: 'halloween_2026' },
            window: 'halloween_2026',
            set: 'seasonal'
        },
        {
            id: 'cinema_cupid',
            name: 'Cinema Cupid',
            description: "Watch a romance movie between February 10–14.",
            icon: '❤️',
            category: 'challenge',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'date_window', value: 1, filter: 'valentines_2027' },
            window: 'valentines_2027',
            set: 'seasonal'
        },
        {
            id: 'christmas_movie_buff',
            name: 'Christmas Movie Buff',
            description: 'Watch 2 Christmas movies.',
            icon: '🎄',
            category: 'challenge',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'date_window', value: 2, filter: 'christmas_2026' },
            window: 'christmas_2026',
            set: 'seasonal'
        },
        {
            id: 'made_in_ghana',
            name: 'Made in Ghana',
            description: 'Watch 5 Ghanaian films.',
            icon: '🇬🇭',
            category: 'challenge',
            rarity: 'epic',
            reward_type: 'reward',
            points: 750,
            requirement: { type: 'genre_watched', value: 5, filter: 'Ghanaian' },
            set: 'ghana_cinema'
        },

        // ----------------------------------------------------
        // HIDDEN / SECRET
        // ----------------------------------------------------
        {
            id: 'the_marathoner',
            name: 'The Marathoner',
            description: 'Watch 3 movies in one day.',
            icon: '🏃',
            category: 'secret',
            rarity: 'epic',
            reward_type: 'reward',
            points: 750,
            requirement: { type: 'movies_in_one_day', value: 3 },
            secret: true
        },
        {
            id: 'first_in_line',
            name: 'First in Line',
            description: 'Attend the first screening of the day 5 times.',
            icon: '🥇',
            category: 'secret',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'first_of_day', value: 5 },
            secret: true
        },
        {
            id: 'last_one_standing',
            name: 'Last One Standing',
            description: 'Attend the final screening of the day 5 times.',
            icon: '🌌',
            category: 'secret',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'last_of_day', value: 5 },
            secret: true
        },
        {
            id: 'popcorn_addict',
            name: 'Popcorn Addict',
            description: 'Purchase popcorn 10 times.',
            icon: '🍿',
            category: 'secret',
            rarity: 'rare',
            reward_type: 'reward',
            points: 300,
            requirement: { type: 'concessions_purchases', value: 10 },
            secret: true,
            set: 'concessions'
        },
        {
            id: 'the_critic',
            name: 'The Critic',
            description: 'Review 10 movies.',
            icon: '📝',
            category: 'secret',
            rarity: 'rare',
            reward_type: 'reward',
            points: 400,
            requirement: { type: 'reviews_written', value: 10 },
            secret: true
        },
        {
            id: 'explorer',
            name: 'Explorer',
            description: 'Watch a movie in every available screen.',
            icon: '🧭',
            category: 'secret',
            rarity: 'epic',
            reward_type: 'reward',
            points: 600,
            requirement: { type: 'screens_visited', value: 6 },
            secret: true
        }
    ],

    // ========================================================
    // TROPHY SETS
    // Completing a full set unlocks the master trophy below.
    // ========================================================
    SETS: {
        movie_lover: {
            id: 'movie_lover',
            name: 'Movie Lover Set',
            icon: '🎬',
            description: 'Collect every milestone trophy.',
            members: ['first_screening', 'movie_buff', 'film_enthusiast', 'cinema_regular', 'silver_screen_veteran', 'savannah_legend'],
            master: {
                id: 'movie_lover_master',
                name: 'Movie Lover Master',
                description: 'Complete the Movie Lover Set.',
                icon: '💎',
                rarity: 'legendary',
                reward_type: 'unlock',
                perk: 'Exclusive Movie Lover Master badge'
            }
        },
        genre_explorer: {
            id: 'genre_explorer',
            name: 'Genre Explorer Set',
            icon: '🌍',
            description: 'Collect every genre trophy.',
            members: ['action_hero', 'comedy_king', 'fearless', 'romantic', 'beyond_earth', 'detective', 'genre_collector'],
            master: {
                id: 'genre_explorer_master',
                name: 'Genre Explorer Master',
                description: 'Complete the Genre Explorer Set.',
                icon: '💎',
                rarity: 'legendary',
                reward_type: 'unlock',
                perk: 'Exclusive Genre Explorer Master badge'
            }
        },
        streak: {
            id: 'streak',
            name: 'Streak Set',
            icon: '🔥',
            description: 'Collect every attendance streak trophy.',
            members: ['weekend_warrior', 'cinema_streak', 'monthly_regular'],
            master: {
                id: 'streak_master',
                name: 'Streak Master',
                description: 'Complete the Streak Set.',
                icon: '💎',
                rarity: 'legendary',
                reward_type: 'unlock',
                perk: 'Exclusive Streak Master badge'
            }
        },
        social: {
            id: 'social',
            name: 'Social Set',
            icon: '👥',
            description: 'Collect every social trophy.',
            members: ['movie_buddy', 'dynamic_duo', 'group_screening', 'the_connector'],
            master: {
                id: 'social_master',
                name: 'Social Master',
                description: 'Complete the Social Set.',
                icon: '💎',
                rarity: 'legendary',
                reward_type: 'unlock',
                perk: 'Exclusive Social Master badge'
            }
        },
        concessions: {
            id: 'concessions',
            name: 'Concessions Set',
            icon: '🍿',
            description: 'Collect every concessions trophy.',
            members: ['popcorn_addict'],
            master: {
                id: 'concessions_master',
                name: 'Concessions Master',
                description: 'Complete the Concessions Set.',
                icon: '💎',
                rarity: 'epic',
                reward_type: 'unlock',
                perk: 'Free popcorn on your next visit'
            }
        },
        ghana_cinema: {
            id: 'ghana_cinema',
            name: 'Ghana Cinema Set',
            icon: '🇬🇭',
            description: 'Celebrate Ghanaian cinema.',
            members: ['made_in_ghana'],
            master: {
                id: 'ghana_cinema_master',
                name: 'Ghana Cinema Master',
                description: 'Complete the Ghana Cinema Set.',
                icon: '💎',
                rarity: 'legendary',
                reward_type: 'unlock',
                perk: 'Exclusive Ghana Cinema Master badge'
            }
        },
        seasonal: {
            id: 'seasonal',
            name: 'Seasonal Set',
            icon: '🎃',
            description: 'Collect every seasonal challenge trophy.',
            members: ['halloween_horror_hunter', 'cinema_cupid', 'christmas_movie_buff'],
            master: {
                id: 'seasonal_master',
                name: 'Seasonal Master',
                description: 'Complete the Seasonal Set.',
                icon: '💎',
                rarity: 'legendary',
                reward_type: 'unlock',
                perk: 'Exclusive Seasonal Master badge'
            }
        },
        legendary: {
            id: 'legendary',
            name: 'Legendary Set',
            icon: '💎',
            description: 'Collect every Legendary trophy.',
            members: ['savannah_legend'],
            master: {
                id: 'legendary_master',
                name: 'Legendary Master',
                description: 'Complete the Legendary Set.',
                icon: '👑',
                rarity: 'legendary',
                reward_type: 'unlock',
                perk: 'Permanent place in the Savannah Hall of Fame'
            }
        }
    },

    // ========================================================
    // CATEGORIES (for Trophy Cabinet grouping / tabs)
    // ========================================================
    CATEGORIES: {
        milestones:    { id: 'milestones',    label: 'Cinema Milestones', icon: '🎬', order: 1 },
        genre:         { id: 'genre',         label: 'Genre',             icon: '🎭', order: 2 },
        franchise:     { id: 'franchise',     label: 'Collections',       icon: '🦸', order: 3 },
        attendance:    { id: 'attendance',    label: 'Attendance',        icon: '📅', order: 4 },
        social:        { id: 'social',        label: 'Social',            icon: '👥', order: 5 },
        challenge:     { id: 'challenge',     label: 'Challenges',        icon: '🎯', order: 6 },
        secret:        { id: 'secret',        label: 'Secret',            icon: '❓', order: 7 }
    },

    // ========================================================
    // POINTS ENGINE CONFIG
    // ========================================================
    POINTS: {
        // Base earning rate: points awarded per unit of currency spent.
        // Awarded when a booking's showtime has passed (watched = true).
        per_currency_unit: 1,

        // Bonus multipliers (stack additively)
        bonuses: {
            weekend:     0.10,   // +10% for Sat/Sun showtimes
            matinee:     0.05,   // +5% for showtimes before 15:00
            premium_seat: 0.15   // +15% if any seat is premium/VIP
        },

        // Milestone bonus: +N points per trophy unlocked in this rarity
        rarity_bonus: {
            common:    0,
            rare:      50,
            epic:      150,
            legendary: 500
        }
    },

    // ========================================================
    // STREAK ENGINE CONFIG
    // ========================================================
    STREAKS: {
        // A "week" is Sunday–Saturday. A visit in a week counts.
        week_reset_day: 0,     // 0 = Sunday
        // Streak is broken if no visit within N days
        grace_days: 7,
        // Timezone for all date math
        timezone: 'Africa/Accra'
    },

    // ========================================================
    // MISSION TEMPLATES (for future use / prompt display)
    // Missions are dynamic and stored in USER_MISSIONS.
    // These are seed definitions you can wire later.
    // ========================================================
    MISSION_TEMPLATES: [
        {
            id: 'weekend_2',
            title: 'Weekend Challenge',
            description: 'Watch 2 movies this weekend.',
            reward_trophy: 'weekend_warrior',
            reward_points: 300,
            requirement: { type: 'movies_in_window', value: 2, filter: 'this_weekend' }
        },
        {
            id: 'genre_try',
            title: 'Try Something New',
            description: 'Watch a movie in a genre you have never seen.',
            reward_points: 200,
            requirement: { type: 'new_genre', value: 1 }
        }
    ]
};

// Expose for non-module script loaders
if (typeof window !== 'undefined') {
    window.SAVANNAH_TROPHIES = SAVANNAH_TROPHIES;
}