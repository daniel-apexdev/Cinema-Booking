// ============================================================
// NAV WISHLIST INDICATOR
// Injects a bookmark icon with live count into any .nav-right
// ============================================================

const NavWishlist = {
    // Call this after the DOM is ready on every page
        init() {
        this.inject();
        this.renderAvatar();   // ← add this line

        window.addEventListener('storage', (e) => {
            if (e.key === 'savannah_watchlist') this.updateCount();
            if (e.key === 'savannah_avatars') this.renderAvatar();   // ← add
        });

        window.addEventListener('focus', () => {
            this.updateCount();
            this.renderAvatar();   // ← add
        });

        setInterval(() => this.updateCount(), 2000);
    },

    inject() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;
        if (document.getElementById('navWishlistBtn')) return;

        // Create the button
        const btn = document.createElement('a');
        btn.id = 'navWishlistBtn';
        btn.href = 'watchlist.html';
        btn.title = 'My Watchlist';
        btn.setAttribute('aria-label', 'My Watchlist');
        btn.innerHTML = `
            <i class="fas fa-bookmark"></i>
            <span class="wishlist-count" id="navWishlistCount" style="display:none;">0</span>
        `;
        btn.style.cssText = `
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--paper-dim);
            transition: 0.3s ease;
            background: transparent;
        `;

        // Insert as the FIRST child of nav-right
        navRight.insertBefore(btn, navRight.firstChild);

        // Add hover effect via CSS injected once
        if (!document.getElementById('navWishlistStyles')) {
            const style = document.createElement('style');
            style.id = 'navWishlistStyles';
            style.textContent = `
                #navWishlistBtn:hover {
                    background: rgba(232,179,76,0.1);
                    color: var(--gold);
                }
                #navWishlistBtn .wishlist-count {
                    position: absolute;
                    top: 2px;
                    right: 2px;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    background: var(--gold);
                    color: var(--ink);
                    border-radius: 10px;
                    font-family: 'IBM Plex Mono', monospace;
                    font-size: 10px;
                    font-weight: 700;
                    line-height: 18px;
                    text-align: center;
                    border: 2px solid var(--ink);
                    box-sizing: content-box;
                    animation: wishlistPop 0.3s ease;
                }
                @keyframes wishlistPop {
                    0% { transform: scale(0); }
                    60% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                @media (max-width: 900px) {
                    #navWishlistBtn { display: none !important; }
                }
            `;
            document.head.appendChild(style);
        }

        this.updateCount();
    },

    updateCount() {
        const countEl = document.getElementById('navWishlistCount');
        const btn = document.getElementById('navWishlistBtn');
        if (!countEl || !btn) return;

        const count = (typeof SavannahStorage !== 'undefined')
            ? SavannahStorage.getWatchlist().length
            : 0;

        if (count > 0) {
            countEl.textContent = count > 99 ? '99+' : count;
            countEl.style.display = '';
            btn.style.color = 'var(--gold)';
        } else {
            countEl.style.display = 'none';
            btn.style.color = 'var(--paper-dim)';
        }
    },

        // Called whenever avatar may change
    refresh() {
        this.renderAvatar();
        this.updateCount();
    },

        // ========================================================
    // RENDER USER AVATAR INTO NAV
    // Called automatically on init; also updates on focus
    // ========================================================
    renderAvatar() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        // Skip if not logged in
        const user = (typeof SavannahStorage !== 'undefined') ? SavannahStorage.getUser() : null;

        // Remove any existing injected avatar
        const existing = document.getElementById('navAvatarBtn');
        if (existing) existing.remove();

        // Also remove any existing sign-in button if logged in
        if (user) {
            // Hide any static sign-in link
            const signin = navRight.querySelector('.btn-signin');
            if (signin && signin.getAttribute('href') === 'login.html') {
                signin.style.display = 'none';
            }

            // Create avatar button
            const btn = document.createElement('a');
            btn.id = 'navAvatarBtn';
            btn.href = 'profile.html';
            btn.title = 'My Profile';
            btn.setAttribute('aria-label', 'My Profile');
            btn.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: 0.3s ease;
                text-decoration: none;
                flex-shrink: 0;
            `;

            if (typeof NavAvatar !== 'undefined') {
                btn.innerHTML = NavAvatar.renderHTML(user, 34, 11);
            }

            // Insert before existing Sign In or at the beginning
            navRight.insertBefore(btn, navRight.firstChild);

            // Hover: scale slightly
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        }
    },
};

document.addEventListener('DOMContentLoaded', () => NavWishlist.init());