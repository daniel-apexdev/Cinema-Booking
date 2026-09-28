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

        // If we have separate first/last
        if (first && last) {
            const f = first.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            const l = last.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            return (f + l) || 'SV';
        }

        // Fallback: split full name
        const full = (user.name || first || '').trim();
        if (!full) return 'SV';

        const parts = full.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            const f = parts[0].replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            const l = parts[parts.length - 1].replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase();
            return (f + l) || 'SV';
        }

        // Single name: first 2 letters
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
    // RENDER — build the avatar HTML
    // ========================================================
    renderHTML(user, size = 34, fontSize = 11) {
        const initials = this.getInitials(user);
        const url = this.getAvatarUrl(user);

        const inner = url
            ? `<img src="${url}" alt="${initials}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;">`
            : initials;

        return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,var(--gold,#E8B34C),#C69436);color:var(--ink,#14141C);display:flex;align-items:center;justify-content:center;font-family:'Oswald',Impact,sans-serif;font-weight:500;font-size:${fontSize}px;overflow:hidden;letter-spacing:0.02em;flex-shrink:0;">${inner}</div>`;
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
    /**
     * Reads a File, crops it to a centered square, resizes to 400x400,
     * and returns a base64 JPEG data URL.
     * @param {File} file
     * @returns {Promise<string>}
     */
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
                        // Determine the square crop area (centered)
                        const size = Math.min(img.width, img.height);
                        const sx = (img.width - size) / 2;
                        const sy = (img.height - size) / 2;

                        // Create canvas
                        const canvas = document.createElement('canvas');
                        canvas.width = targetSize;
                        canvas.height = targetSize;
                        const ctx = canvas.getContext('2d');

                        // Draw center-cropped square
                        ctx.drawImage(
                            img,
                            sx, sy, size, size,
                            0, 0, targetSize, targetSize
                        );

                        // Convert to JPEG data URL
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