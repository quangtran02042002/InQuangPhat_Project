# Mobile UI/UX Optimization Rules for In Quang Phát Project

## 1. Zero Horizontal Scroll (Không Cuộn Ngang)
- **Constraint**: The horizontal scrollbar must never appear on mobile screen sizes (widths under 640px/768px).
- **Table Rule**: Standard tables (`<table>`) must be hidden on mobile (`hidden lg:block` or `hidden md:block`) and replaced by a responsive card list (`lg:hidden` or `md:hidden`) which renders step-by-step or detail-by-detail vertically.

## 2. Micro-scaling (Tinh giản Tỷ Lệ & Padding)
- **Padding**: Mobile screens should use tight spacing to prevent wasting valuable screen space.
  - Page wrapper padding: `p-3` or `p-4` (never `p-8`).
  - Modal content padding: `px-3 py-3` or `px-4 py-4` (never `px-8 py-6`).
- **Input Sizing**: Textboxes, dropdowns, and textareas should be compact.
  - Recommended sizing on mobile: `py-1.5 px-2.5 text-xs` or `sm:text-sm`.
- **Typography**: Scale down text sizes appropriately.
  - Headers: `text-base` or `text-lg`.
  - Body text/labels: `text-xs` or `text-[11px]` (with bold labels for readability).

## 3. Responsive Stacking & Grid
- Multi-column layouts must wrap.
  - Standard inputs: Stack vertically (`grid-cols-1`) or use at most 2 columns on mobile (`grid-cols-2`).
  - Sections/cards: Stack linearly.

## 4. Compact Actions & Touch Targets
- Action button groups (View, Edit, Delete, Approve) must be grouped on a single row or flex container with `flex-wrap` and minimal gap.
- Use iconography (`FaEye`, `FaEdit`, etc.) alongside tight labels (`text-[10px]` or `text-[11px]`) to save screen width.
