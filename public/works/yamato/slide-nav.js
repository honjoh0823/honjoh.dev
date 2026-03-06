/**
 * SlideNav — Wheel accumulation + touch swipe navigation.
 * Designed for trackpad (many small deltaY events with inertia).
 *
 * Usage:
 *   new SlideNav(document, { onNext: () => …, onPrev: () => … });
 */
(() => {
    class SlideNav {
        /**
         * @param {EventTarget} el        — element to listen on (usually document)
         * @param {Object}      opts
         * @param {Function}    opts.onNext
         * @param {Function}    opts.onPrev
         * @param {number}      [opts.wheelThreshold=60]  — accumulated px to trigger
         * @param {number}      [opts.resetDelay=150]     — ms to reset accumulator after last event
         * @param {number}      [opts.swipeThreshold=40]  — px minimum swipe distance
         */
        constructor(el, { onNext, onPrev, wheelThreshold = 60, resetDelay = 150, swipeThreshold = 40 } = {}) {
            this._el = el;
            this._onNext = onNext || (() => { });
            this._onPrev = onPrev || (() => { });
            this._wheelThreshold = wheelThreshold;
            this._resetDelay = resetDelay;
            this._swipeThreshold = swipeThreshold;

            this._accum = 0;
            this._resetTimer = null;
            this._touchStartY = null;
            this._touchStartX = null;

            // Bind handlers
            this._handleWheel = this._handleWheel.bind(this);
            this._handleTouchStart = this._handleTouchStart.bind(this);
            this._handleTouchEnd = this._handleTouchEnd.bind(this);

            this._el.addEventListener('wheel', this._handleWheel, { passive: false });
            this._el.addEventListener('touchstart', this._handleTouchStart, { passive: true });
            this._el.addEventListener('touchend', this._handleTouchEnd, { passive: true });
        }

        _handleWheel(e) {
            e.preventDefault();

            // Normalize deltaY: deltaMode 0=px, 1=lines(*32), 2=pages(*viewportH)
            let dy = e.deltaY;
            if (e.deltaMode === 1) dy *= 32;
            else if (e.deltaMode === 2) dy *= window.innerHeight;

            this._accum += dy;

            // Reset accumulator if user stops scrolling
            clearTimeout(this._resetTimer);
            this._resetTimer = setTimeout(() => { this._accum = 0; }, this._resetDelay);

            if (Math.abs(this._accum) >= this._wheelThreshold) {
                if (this._accum > 0) this._onNext();
                else this._onPrev();
                this._accum = 0;
            }
        }

        _handleTouchStart(e) {
            if (e.touches.length !== 1) return;
            this._touchStartY = e.touches[0].clientY;
            this._touchStartX = e.touches[0].clientX;
        }

        _handleTouchEnd(e) {
            if (this._touchStartY === null) return;
            const touch = e.changedTouches[0];
            if (!touch) return;

            const dy = this._touchStartY - touch.clientY;
            const dx = this._touchStartX - touch.clientX;
            const startX = this._touchStartX;

            this._touchStartY = null;
            this._touchStartX = null;

            const absDy = Math.abs(dy);
            const absDx = Math.abs(dx);

            // If movement is below threshold, treat as a tap (mobile only)
            if (absDy < this._swipeThreshold && absDx < this._swipeThreshold) {
                if (window.innerWidth <= 600) {
                    if (startX < window.innerWidth / 2) this._onPrev();
                    else this._onNext();
                }
                return;
            }

            // Require minimum swipe distance in the dominant direction
            if (absDy >= absDx) {
                // Vertical swipe
                if (absDy < this._swipeThreshold) return;
                if (dy > 0) this._onNext();
                else this._onPrev();
            } else {
                // Horizontal swipe
                if (absDx < this._swipeThreshold) return;
                if (dx > 0) this._onNext();  // swipe left → next
                else this._onPrev();          // swipe right → prev
            }
        }

        destroy() {
            this._el.removeEventListener('wheel', this._handleWheel);
            this._el.removeEventListener('touchstart', this._handleTouchStart);
            this._el.removeEventListener('touchend', this._handleTouchEnd);
            clearTimeout(this._resetTimer);
        }
    }

    window.SlideNav = SlideNav;
})();
