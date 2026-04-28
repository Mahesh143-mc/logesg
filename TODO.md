# Admin Panel UI Redesign - TODO

## Goals
1. Make admin panel fully responsive on mobile screens
2. Fix dark mode / night mode color schemes
3. Create a professional, clean design

## Plan Steps

### Step 1: Global CSS (`src/index.css`)
- [ ] Refine dark mode palette (better contrast slate-900 bg + slate-800 cards)
- [ ] Add smooth color transitions globally
- [ ] Fix dark mode scrollbar colors
- [ ] Reduce card border radius from extreme values (rounded-[48px] → rounded-2xl)
- [ ] Improve `.admin-card`, `.glass-panel`, `.btn-primary`, `.input-standard` consistency
- [ ] Better focus rings and hover states

### Step 2: Layout (`src/components/Layout.tsx`)
- [ ] Reduce mobile header height from h-28 to h-16
- [ ] Fix responsive content padding (p-4 mobile → p-6 tablet → p-8 desktop)
- [ ] Remove excessive bottom padding (pb-32 → pb-24 max)
- [ ] Improve mobile sidebar drawer width and animation

### Step 3: Navigation (`src/components/Navigation.tsx`)
- [ ] Bottom Nav: Add scrollable container + "More" menu for all 11 pages
- [ ] Sidebar: Cleaner design, better active states, consistent spacing
- [ ] Fix dark mode toggle switch (left-4.5 is invalid Tailwind)
- [ ] Replace ALL CAPS labels with Title Case/Normal
- [ ] Better badge styling for pending orders

### Step 4: Dashboard (`src/pages/Dashboard.tsx`)
- [ ] Replace cyber jargon with clear business terms
- [ ] Reduce border radius on cards to rounded-2xl
- [ ] Fix responsive padding
- [ ] Make stat cards responsive (grid-cols-2 mobile → grid-cols-4 desktop)
- [ ] Fix chart height on mobile (h-[250px] mobile, h-[380px] desktop)
- [ ] Improve Quick Action buttons

### Step 5: Billing (`src/pages/Billing.tsx`)
- [ ] Wrap table in horizontal scroll for mobile
- [ ] Reduce table cell padding for mobile
- [ ] Fix settlement panel stacking on mobile
- [ ] Reduce modal border radius
- [ ] Fix search input/button heights for mobile

### Step 6: Settings (`src/pages/Settings.tsx`)
- [ ] Reduce extreme border radius (rounded-[56px] → rounded-2xl)
- [ ] Fix tab buttons for mobile
- [ ] Reduce form input heights on mobile
- [ ] Replace tech jargon with clear labels
- [ ] Better mobile grid layout

## Testing
- [ ] Run `npm run dev` and verify in browser
- [ ] Test light mode and dark mode
- [ ] Test mobile responsiveness (iPhone SE, iPhone 14, iPad, Desktop)
- [ ] Verify all navigation accessible on mobile

