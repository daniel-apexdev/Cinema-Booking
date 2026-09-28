// ============================================================
// NAV AVATAR — User avatar + dropdown menu
// Injects the avatar button + dropdown into .nav-right
// ============================================================

const NavWishlist = {

    // ========================================================
    // INIT
    // ========================================================
    init() {
        this.renderAvatar();

        // React to storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'savannah_watchlist') this.updateDropdownWishlistCount();
            if (e.key === 'savannah_avatars') this.renderAvatar();
        });

        // Refresh on focus
        window.addEventListener('focus', () => {
            this.renderAvatar();
        });
    },

    // Called externally after avatar changes
    refresh() {
        this.renderAvatar();
    },

    // ========================================================
    // AVATAR WITH DROPDOWN MENU
    // ========================================================
    renderAvatar() {
        const navRight = document.querySelector('.nav-right');
        if (!navRight) return;

        const user = (typeof SavannahStorage !== 'undefined') ? SavannahStorage.getUser() : null;

        // Remove previous injected avatar wrap
        const existing = document.getElementById('navAvatarWrap');
        if (existing) existing.remove();

        // Clean up any legacy elements (from old versions)
        const legacyWishlist = document.getElementById('navWishlistBtn');
        if (legacyWishlist) legacyWishlist.remove();

        const legacyAvatar = document.getElementById('navAvatarBtn');
        if (legacyAvatar) legacyAvatar.remove();

        // Show/hide static sign-in
        const signin = navRight.querySelector('.btn-signin');
        if (signin && signin.getAttribute('href') === 'login.html') {
            signin.style.display = user ? 'none' : '';
        }

        if (!user) return;

        const displayName = user.name || `${user.forenames || ''} ${user.surname || ''}`.trim() || 'Guest';
        const email = user.email || '';
        const wishlistCount = (typeof SavannahStorage !== 'undefined') ? SavannahStorage.getWatchlist().length : 0;

        // Wrap
        const wrap = document.createElement('div');
        wrap.id = 'navAvatarWrap';
        wrap.className = 'nav-avatar-wrap';
        wrap.style.cssText = 'position:relative;';

        wrap.innerHTML = `
            <button class="nav-avatar-btn" id="navAvatarBtn" aria-label="Account menu" aria-haspopup="true" aria-expanded="false">
                ${(typeof NavAvatar !== 'undefined')
                    ? NavAvatar.renderHTML(user, 38)
                    : '<div style="width:38px;height:38px;border-radius:50%;background:var(--gold);"></div>'}
            </button>

            <div class="nav-dropdown" id="navDropdown" role="menu">
                <div class="nav-dropdown-header">
                    <div class="nav-dropdown-avatar">
                        ${(typeof NavAvatar !== 'undefined')
                            ? NavAvatar.renderHTML(user, 46)
                            : ''}
                    </div>
                    <div class="nav-dropdown-user">
                        <div class="nav-dropdown-name">${displayName}</div>
                        <div class="nav-dropdown-email">${email || 'Savannah Member'}</div>
                    </div>
                </div>

                <div class="nav-dropdown-body">
                    <a href="profile.html" class="nav-dropdown-item" role="menuitem">
                        <i class="fas fa-user"></i>
                        <span>My Profile</span>
                    </a>
                    <a href="bookings.html" class="nav-dropdown-item" role="menuitem">
                        <i class="fas fa-ticket-alt"></i>
                        <span>My Bookings</span>
                    </a>
                    <a href="watchlist.html" class="nav-dropdown-item" role="menuitem">
                        <i class="fas fa-bookmark"></i>
                        <span>Watchlist</span>
                        <span class="nav-dropdown-badge" id="navDropdownWishlistCount" ${wishlistCount > 0 ? '' : 'style="display:none;"'}>
                            ${wishlistCount > 99 ? '99+' : wishlistCount}
                        </span>
                    </a>

                    <div class="nav-dropdown-divider"></div>

                    <button type="button" class="nav-dropdown-item nav-dropdown-logout" id="navLogoutBtn" role="menuitem">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        `;

        navRight.insertBefore(wrap, navRight.firstChild);

        this.injectDropdownStyles();
        this.wireDropdownEvents();
    },

    updateDropdownWishlistCount() {
        const badge = document.getElementById('navDropdownWishlistCount');
        if (!badge) return;

        const count = (typeof SavannahStorage !== 'undefined')
            ? SavannahStorage.getWatchlist().length
            : 0;

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = '';
        } else {
            badge.style.display = 'none';
        }
    },

    // ========================================================
    // DROPDOWN STYLES
    // ========================================================
    injectDropdownStyles() {
        if (document.getElementById('navAvatarDropdownStyles')) return;

        const style = document.createElement('style');
        style.id = 'navAvatarDropdownStyles';
        style.textContent = `
            /* ---------- AVATAR BUTTON ---------- */
            .nav-avatar-btn {
                width: 42px;
                height: 42px;
                padding: 2px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
                border: 2px solid transparent;
                cursor: pointer;
                transition: 0.3s ease;
                box-sizing: border-box;
                overflow: hidden;
            }
            .nav-avatar-btn > div {
                width: 38px !important;
                height: 38px !important;
                border-radius: 50%;
                overflow: hidden;
            }
            .nav-avatar-btn:hover {
                border-color: var(--gold-dim);
                background: rgba(232,179,76,0.05);
            }
            .nav-avatar-btn[aria-expanded="true"] {
                border-color: var(--gold);
            }

            /* ---------- DROPDOWN ---------- */
            .nav-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                width: 260px;
                background: var(--ink-raised);
                border: 1px solid var(--ink-line);
                border-radius: 14px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-8px);
                transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
                z-index: 9999;
            }
            .nav-avatar-wrap.is-open .nav-dropdown {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            /* ---------- HEADER ---------- */
            .nav-dropdown-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                border-bottom: 1px solid var(--ink-line);
                background: linear-gradient(135deg, rgba(232,179,76,0.08) 0%, rgba(179,57,81,0.04) 100%);
            }
            .nav-dropdown-avatar {
                flex-shrink: 0;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid var(--gold-dim);
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
            }
            .nav-dropdown-avatar > div {
                width: 46px !important;
                height: 46px !important;
                border-radius: 50%;
                overflow: hidden;
            }
            .nav-dropdown-user {
                min-width: 0;
                flex: 1;
            }
            .nav-dropdown-name {
                font-family: 'Oswald', Impact, sans-serif;
                font-size: 15px;
                font-weight: 500;
                color: var(--paper);
                line-height: 1.2;
                margin-bottom: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .nav-dropdown-email {
                font-family: 'IBM Plex Mono', monospace;
                font-size: 11px;
                color: var(--paper-dim);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* ---------- BODY ---------- */
            .nav-dropdown-body {
                padding: 6px 0;
            }

            .nav-dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 11px 18px;
                font-family: 'Inter', sans-serif;
                font-size: 13px;
                font-weight: 400;
                color: var(--paper-dim);
                background: transparent;
                border: none;
                width: 100%;
                text-align: left;
                cursor: pointer;
                transition: 0.2s ease;
                text-decoration: none;
                box-sizing: border-box;
            }
            .nav-dropdown-item:hover {
                background: rgba(232,179,76,0.06);
                color: var(--gold);
            }
            .nav-dropdown-item i {
                width: 18px;
                text-align: center;
                font-size: 14px;
                color: var(--paper-dim);
                transition: 0.2s ease;
                flex-shrink: 0;
            }
            .nav-dropdown-item:hover i {
                color: var(--gold);
            }
            .nav-dropdown-item > span:first-of-type {
                flex: 1;
            }

            .nav-dropdown-badge {
                min-width: 20px;
                height: 20px;
                padding: 0 6px;
                background: var(--gold);
                color: var(--ink);
                border-radius: 10px;
                font-family: 'IBM Plex Mono', monospace;
                font-size: 10px;
                font-weight: 700;
                line-height: 20px;
                text-align: center;
                box-sizing: border-box;
            }

            .nav-dropdown-divider {
                height: 1px;
                background: var(--ink-line);
                margin: 6px 0;
            }

            .nav-dropdown-logout {
                color: var(--rust);
            }
            .nav-dropdown-logout i {
                color: var(--rust);
            }
            .nav-dropdown-logout:hover {
                background: rgba(179,57,81,0.08);
                color: var(--rust-hover);
            }
            .nav-dropdown-logout:hover i {
                color: var(--rust-hover);
            }

            /* ---------- MOBILE ---------- */
            @media (max-width: 640px) {
                .nav-dropdown {
                    width: 240px;
                    right: -8px;
                }
                .nav-dropdown-header {
                    padding: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    },

    // ========================================================
    // DROPDOWN EVENTS
    // ========================================================
    wireDropdownEvents() {
        const wrap = document.getElementById('navAvatarWrap');
        const btn = document.getElementById('navAvatarBtn');
        const logoutBtn = document.getElementById('navLogoutBtn');

        if (!wrap || !btn) return;

        let closeTimer = null;

        const openMenu = () => {
            clearTimeout(closeTimer);
            wrap.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
        };

        const closeMenu = () => {
            wrap.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        };

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            wrap.classList.contains('is-open') ? closeMenu() : openMenu();
        });

        wrap.addEventListener('mouseenter', () => {
            clearTimeout(closeTimer);
            openMenu();
        });
        wrap.addEventListener('mouseleave', () => {
            closeTimer = setTimeout(() => closeMenu(), 250);
        });

        document.addEventListener('click', (e) => {
            if (!wrap.contains(e.target)) closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });

        logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!confirm('Are you sure you want to sign out?')) return;

            if (typeof SavannahStorage !== 'undefined') {
                SavannahStorage.logout();
            }
            window.location.href = 'index.html';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => NavWishlist.init());