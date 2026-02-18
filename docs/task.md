# A.html Refactoring

## Phase 1: Label Dual-Definition Fix (High Priority)
- [x] Remove HTML nav labels, let JS `SEC_LABELS` be the single source of truth
- [x] `updateLabel()` initializes labels on page load

## Phase 2: CSS / JS / HTML Separation (Medium Priority)
- [x] Extract CSS to `A.css`
- [x] Extract JS to `A.js`
- [ ] Verify page works identically after separation

## Phase 3: Typing Compare Engine Module Separation (Medium Priority)
- [x] Extract `tc*` functions to `typing-compare.js`
- [x] Expose minimal API for main script integration
- [ ] Verify typing compare animation works
