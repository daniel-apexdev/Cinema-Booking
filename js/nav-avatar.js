// ============================================================
// NAV AVATAR — Shared avatar rendering for all pages
// Reads avatar from localStorage and renders image or initials
// ============================================================

const NavAvatar = {

    // ========================================================
    // INITIALS — first 2 letters of first name + first 2 of last
    // ========================================================
    getInitials(user) {
        if (!user) return 'SV';

        const first = (user.forenames || user.first_name || user.name || '').trim();
        const last = (user.surname || user.last_name || '').trim();

        if (first && last) {
            const f = first.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            const l = last.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            return (f + l) || 'SV';
        }

        const full = (user.name || first || '').trim();
        if (!full) return 'SV';

        const parts = full.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            const f = parts[0].replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            const l = parts[parts.length - 1].replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            return (f + l) || 'SV';
        }

        const single = parts[0].replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
        return single || 'SV';
    },

    // ========================================================
    // AVATAR URL — from per-email storage
    // ========================================================
    getAvatarUrl(user) {
        if (!user || !user.email) return null;
        const avatars = this.getAvatarStore();
        return avatars[user.email.toLowerCase()] || null;
    },

    getAvatarStore() {
        try {
            const raw = localStorage.getItem('savannah_avatars');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    },

    setAvatarUrl(email, url) {
        const store = this.getAvatarStore();
        if (!email) return;

        if (url) {
            store[email.toLowerCase()] = url;
        } else {
            delete store[email.toLowerCase()];
        }

        try {
            localStorage.setItem('savannah_avatars', JSON.stringify(store));
        } catch (e) {
            console.error('Failed to save avatar:', e);
        }
    },

    // ========================================================
    // RENDER HTML — self-contained avatar
    // ========================================================
    renderHTML(user, size = 34, fontSize = 11) {
        const initials = this.getInitials(user);
        const url = this.getAvatarUrl(user);

        // Font-size scales with the size unless caller specifies
        const computedFontSize = fontSize || Math.round(size * 0.36);

        // Common container styles — bulletproof centering
        const containerStyle = [
            `width:${size}px`,
            `height:${size}px`,
            `min-width:${size}px`,
            `min-height:${size}px`,
            `border-radius:50%`,
            `background:linear-gradient(135deg, #E8B34C 0%, #C69436 100%)`,
            `color:#14141C`,
            `display:inline-flex`,
            `align-items:center`,
            `justify-content:center`,
            `font-family:'Oswald', Impact, sans-serif`,
            `font-weight:500`,
            `font-size:${computedFontSize}px`,
            `line-height:1`,
            `letter-spacing:0.02em`,
            `overflow:hidden`,
            `text-align:center`,
            `user-select:none`,
            `flex-shrink:0`,
            `box-sizing:border-box`,
            `padding:0`,
            `margin:0`
        ].join(';');

        if (url) {
            return `<div style="${containerStyle}"><img src="${url}" alt="${initials}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:50%;"></div>`;
        }

        return `<div style="${containerStyle}">${initials}</div>`;
    },

    // ========================================================
    // RENDER INTO ELEMENT
    // ========================================================
    render(user, element, size = 34, fontSize = 11) {
        if (!element) return;
        element.innerHTML = this.renderHTML(user, size, fontSize);
    },

    // ========================================================
    // IMAGE CROP — canvas-based square crop
    // ========================================================
    async cropToSquare(file, targetSize = 400, quality = 0.85) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Not an image file'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const size = Math.min(img.width, img.height);
                        const sx = (img.width - size) / 2;
                        const sy = (img.height - size) / 2;

                        const canvas = document.createElement('canvas');
                        canvas.width = targetSize;
                        canvas.height = targetSize;
                        const ctx = canvas.getContext('2d');

                        ctx.drawImage(
                            img,
                            sx, sy, size, size,
                            0, 0, targetSize, targetSize
                        );

                        const dataUrl = canvas.toDataURL('image/jpeg', quality);
                        resolve(dataUrl);
                    } catch (err) {
                        reject(err);
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
};