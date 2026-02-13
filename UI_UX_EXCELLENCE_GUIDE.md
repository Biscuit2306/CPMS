# CPMS UI/UX Excellence Guide

## Overview
This document outlines the standards and best practices for creating professional, consistent, and user-friendly interfaces in the CPMS application.

---

## 1. DESIGN SYSTEM

### Color Palette
- **Primary**: `#667eea` (purple) - Primary actions and focus states
- **Admin Primary**: `#210F37` (dark purple) - Admin-specific actions
- **Success**: `#10b981` (green) - Confirmations, positive states
- **Error**: `#ef4444` (red) - Errors, destructive actions
- **Warning**: `#f59e0b` (amber) - Warnings, caution
- **Info**: `#3b82f6` (blue) - Information, tips
- **Text Primary**: `#1f2937` (dark gray) - Main text
- **Text Secondary**: `#64748b` (medium gray) - Secondary text
- **Neutrals**: White, light gray, dark gray for surfaces and borders

**Usage Rule**: Never hardcode colors. Always use CSS variables from `design-system.css`.

```css
/* ❌ DON'T */
.button { color: #667eea; }

/* ✅ DO */
.button { color: var(--color-primary); }
```

---

## 2. SPACING SYSTEM – 8px Base Scale

| Variable | Value | Use Cases |
|----------|-------|-----------|
| `--spacing-xs` | 4px | Tiny gaps, icon spacing |
| `--spacing-sm` | 8px | Small gaps, label spacing |
| `--spacing-md` | 16px | Default spacing, padding |
| `--spacing-lg` | 24px | Medium gaps, section spacing |
| `--spacing-xl` | 32px | Large gaps, card padding |
| `--spacing-2xl` | 40px | Larger sections |
| `--spacing-3xl` | 48px | Page margins |
| `--spacing-4xl` | 64px | Major layout sections |

**Rule**: Never use arbitrary pixel values for spacing.

```css
/* ❌ DON'T */
.form-group { margin-bottom: 22px; }

/* ✅ DO */
.form-group { margin-bottom: var(--spacing-lg); }
```

---

## 3. TYPOGRAPHY SCALE

| Variable | Size | Weight | Common Use |
|----------|------|--------|-----------|
| `--font-size-xs` | 12px | 400 | Labels, helpers |
| `--font-size-sm` | 14px | 500 | Form labels, captions |
| `--font-size-base` | 16px | 400/500 | Body text, default |
| `--font-size-lg` | 18px | 500/600 | Section headers |
| `--font-size-xl` | 20px | 600/700 | Subsection headers |
| `--font-size-2xl` | 24px | 700 | Page headers |
| `--font-size-3xl` | 32px | 800 | Main titles |

**Font Weights**:
- 400: Regular (body text)
- 500: Medium (strong emphasis)
- 600: Semibold (buttons, labels)
- 700: Bold (major headers)
- 800: Extrabold (page titles)

---

## 4. BORDER RADIUS – Max 2 Values

| Variable | Value | Use Cases |
|----------|-------|-----------|
| `--radius-sm` | 4px | Tight inputs, small elements |
| `--radius-md` | 8px | Default, form elements |
| `--radius-lg` | 12px | Cards, buttons, typical components |
| `--radius-xl` | 16px | Large cards, panels |
| `--radius-2xl` | 20px | Major card headers |
| `--radius-full` | 9999px | Badges, pills, circles |

**Rule**: Stick to 1-2 radius values per design. Don't mix them randomly.

```css
/* ❌ DON'T – Too many different radius values */
.component-1 { border-radius: 3px; }
.component-2 { border-radius: 9px; }
.component-3 { border-radius: 15px; }
.component-4 { border-radius: 22px; }

/* ✅ DO – Consistent system */
.small-element { border-radius: var(--radius-sm); }     /* 4px */
.normal-element { border-radius: var(--radius-lg); }    /* 12px */
.large-card { border-radius: var(--radius-xl); }        /* 16px */
```

---

## 5. SHADOWS

The app uses a consistent shadow system:

- `--shadow-xs`: Minimal depth
- `--shadow-sm`: Subtle elevation
- `--shadow-md`: Default (cards, buttons)
- `--shadow-lg`: Hover state
- `--shadow-xl`: Modals, dropdowns

```css
/* ✅ Shadow Progression */
.card { box-shadow: var(--shadow-md); }
.card:hover { box-shadow: var(--shadow-lg); }
```

---

## 6. TRANSITIONS & ANIMATIONS

All transitions must use the defined easing curves:

- `--transition-fast`: 150ms (quick feedback)
- `--transition-base`: 200ms (default, most interactions)
- `--transition-slow`: 300ms (complex animations)

**Rule**: Never hardcode transition values.

```css
/* ❌ DON'T */
button { transition: all 0.3s ease; }

/* ✅ DO */
button { transition: all var(--transition-base); }
```

**Micro-interaction Guidelines**:
1. **Hover**: Slight scale (1.02-1.05) or color change, elevated shadow
2. **Active/Click**: Scale down (0.98), shadow reduced
3. **Focus**: Visible focus ring (outline: 2px solid var(--color-primary))
4. **Disabled**: Opacity 0.6, cursor: not-allowed

```css
/* ✅ Complete Button Interaction Pattern */
.btn-primary {
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-sm);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
```

---

## 7. BUTTONS – 4 VARIANTS

### Primary Button
**Use**: Main actions, CTA, form submissions

```jsx
<button class="btn btn-primary">Save changes</button>
```

### Secondary Button
**Use**: Related sactions, less emphasis

```jsx
<button class="btn btn-secondary">Cancel</button>
```

### Outline Button
**Use**: Less important actions, open actions

```jsx
<button class="btn btn-outline">Learn more</button>
```

### Danger Button
**Use**: Destructive actions (delete, remove)

```jsx
<button class="btn btn-danger">Delete account</button>
```

### Sizes
```jsx
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
```

---

## 8. FORM ELEMENTS

### Input States

**Empty** → **Focus** → **Filled** → **Error**

```jsx
<!-- Default state -->
<input type="email" placeholder="your@email.com" />

<!-- Focus state (automatic with design system) -->
<input type="email" placeholder="your@email.com" :focus />

<!-- Error state -->
<input type="email" class="error" value="invalid" />

<!-- With helper text -->
<div class="form-group">
  <label>Email address</label>
  <input type="email" placeholder="your@email.com" />
  <span class="form-helper">We'll never share your email</span>
</div>

<!-- With error message -->
<div class="form-group">
  <label>Email address</label>
  <input type="email" class="error" value="test@" />
  <span class="form-error show">Email looks incomplete</span>
</div>
```

### Form Group
Always wrap inputs in form groups for consistent spacing:

```jsx
<div class="form-group">
  <label for="password" class="form-label-required">Password</label>
  <input type="password" id="password" />
  <span class="form-error">Password must be at least 8 characters</span>
</div>
```

---

## 9. EMPTY STATES

**Every empty page/section needs an empty state.** Don't show blank screens.

### Structure
1. **Icon** - Large, muted (20-30% opacity)
2. **Title** - What this space is for (friendly, not blame)
3. **Description** - Brief explanation
4. **CTA** - One primary action to get started

```jsx
<div class="empty-state">
  <svg class="empty-state-icon"><!-- icon --></svg>
  <h3 class="empty-state-title">No projects yet</h3>
  <p class="empty-state-description">
    Projects help you showcase your best work. Start adding your projects
    to build your portfolio.
  </p>
  <div class="empty-state-action">
    <button class="btn btn-primary">Create your first project</button>
  </div>
</div>
```

### Examples by Page

**Student Dashboard - No job drives**:
```
🎯
No job drives available
Check back soon for new opportunities. In the meantime, complete your 
profile to get matched with companies.

→ Complete your profile
```

**Recruiter - No scheduled interviews**:
```
📅
No interviews scheduled
You're all caught up! New interviews will appear here when candidates apply.

→ View applications
```

---

## 10. ERROR HANDLING & VALIDATION

### Inline Validation (Preferred)
Show errors **under the field** where the user can see them immediately.

```jsx
<div class="form-group">
  <label for="email">Email</label>
  <input 
    type="email" 
    id="email"
    class="error"
  />
  <span class="form-error show">
    Email looks incomplete
  </span>
</div>
```

### Tone
- ❌ "Invalid email address" (technical, blaming)
- ✅ "Email looks incomplete" (friendly, helpful)

- ❌ "Password too weak" (vague)
- ✅ "Password needs at least 8 characters" (specific)

### Alert Messages
Never use `alert()`. Use status badges instead:

```jsx
<!-- Success -->
<div class="alert alert-success">
  ✓ Profile updated successfully
</div>

<!-- Error -->
<div class="alert alert-error">
  ⚠ Failed to save changes. Please try again.
</div>

<!-- Warning -->
<div class="alert alert-warning">
  → Your session expires in 5 minutes
</div>
```

---

## 11. LOADING STATES

### Type 1: Skeleton Screens (Preferred)
Show a fake preview of the content loading:

```jsx
<div class="card">
  <div class="skeleton skeleton-text" style="width: 60%"></div>
  <div class="skeleton skeleton-text" style="width: 100%; margin-top: 1rem"></div>
  <div class="skeleton skeleton-text" style="width: 80%"></div>
</div>
```

### Type 2: Spinners
Use for action loading (form submission):

```jsx
<button disabled class="loading">
  <span class="spinner spinner-sm"></span>
  Saving...
</button>
```

### Type 3: Page Loading
Show skeleton grid while data loads:

```jsx
<div class="grid" style="gap: 1rem">
  {[1, 2, 3].map(() => (
    <div class="skeleton skeleton-card"></div>
  ))}
</div>
```

### Loading Rule
- **< 100ms**: Instant (no feedback needed)
- **100-300ms**: Show spinner
- **> 1s**: Show skeleton or message "Loading..."

---

## 12. ACCESSIBILITY (A11Y) – Minimum Standards

### 1. Focus States (Keyboard Navigation)
Every interactive element must have a visible focus ring:

```css
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### 2. Color Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum

**Check**: Use https://webaim.org/resources/contrastchecker/

### 3. Alt Text
All images must have descriptive alt text:

```jsx
<img 
  src="user-avatar.jpg" 
  alt="Profile picture of John Doe" 
/>
```

### 4. Button Labels
Never use icon-only buttons without text or aria-label:

```jsx
<!-- ❌ DON'T -->
<button>
  <svg><!-- delete icon --></svg>
</button>

<!-- ✅ DO -->
<button aria-label="Delete project">
  <svg><!-- delete icon --></svg>
  <span>Delete</span>
</button>
```

### 5. Semantic HTML
Use proper HTML elements:

```jsx
<!-- ❌ DON'T -->
<div onclick="...">Click here</div>

/* ✅ DO */
<button onclick="...">Click here</button>
```

### 6. ARIA Labels for Icon Buttons
```jsx
<button aria-label="Close menu">
  <span class="hamburger-menu"></span>
</button>
```

---

## 13. COPYWRITING FOR UX

### General Rules
1. **Short sentences** - Max 15 words per sentence
2. **Active voice** - "Save your profile" not "Your profile can be saved"
3. **No jargon** - Plain language over technical terms
4. **Confident tone** - No apologizing ("Sorry, we couldn't...")

### Button Labels
- ✅ Good: "Save changes", "Continue to next", "Remove from list"
- ❌ Bad: "Submit", "OK", "Yes", "Process"

### Error Messages
- ✅ Good: "Email looks incomplete"
- ❌ Bad: "ERR_INVALID_EMAIL_FORMAT"

### Empty States
- ✅ Good: "You haven't added any projects yet"
- ❌ Bad: "No data available"

### Loading States
- ✅ Good: "Saving your changes..."
- ❌ Bad: "Processing..."

---

## 14. DESIGN CONSISTENCY – Component Reuse

### Table Example
Instead of styling each table differently, use the `.table-container` and `table` classes:

```jsx
<div class="table-container">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td><span class="badge badge-success">Active</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

### Card Pattern
For consistent card styling:

```jsx
<div class="card">
  <div class="card-header">
    <h2>Card Title</h2>
  </div>
  <div class="card-body">
    Card content here
  </div>
  <div class="card-footer">
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </div>
</div>
```

---

## 15. PROFESSIONAL DETAILS

### Animations
- Button scale on hover: 1.02x
- Button scale on click: 0.98x
- Transitions: 150-300ms
- Never over-animate (less is more)

### Spacing Around Text
- Headings should have clear breathing room
- Cards: 32px padding (var(--spacing-xl))
- Form groups: 24px margins (var(--spacing-lg))

### Shadows
- Cards at rest: `var(--shadow-md)`
- Cards on hover: `var(--shadow-lg)`
- Dropdowns/modals: `var(--shadow-xl)`

---

## 16. CHECKLIST FOR EVERY PAGE

Before pushing code, verify:

- [ ] Colors use CSS variables (`var(--color-*)`)
- [ ] Spacing uses 8px scale (`var(--spacing-*)`)
- [ ] Typography follows size system (`var(--font-size-*)`)
- [ ] Border radius is consistent (`var(--radius-*)`)
- [ ] Buttons have proper hover/active/disabled states
- [ ] Forms have error states and helper text
- [ ] Empty states are implemented
- [ ] Loading states show (skeleton or spinner)
- [ ] Focus rings are visible on all interactive elements
- [ ] Alt text on all images
- [ ] No hardcoded colors, fonts, or spacing
- [ ] Mobile responsive (test at 480px, 768px, 1024px)
- [ ] Copywriting is friendly and clear

---

## 17. QUICK REFERENCE

### Import Design System
```css
@import './styles/design-system.css';
@import './styles/components.css';
```

### Common Class Names
- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-outline`
- Badges: `.badge`, `.badge-success`, `.badge-error`, `.badge-warning`
- Cards: `.card`, `.card-clickable`, `.card-gradient`
- Forms: `.form-group`, `.form-label-required`, `.form-error`, `.form-helper`
- Empty States: `.empty-state`, `.empty-state-icon`, `.empty-state-title`
- Tables: `.table-container`, `.table`
- Modals: `.modal-overlay`, `.modal-content`, `.modal-header`

---

## 18. RESOURCES & INSPIRATION

Check out how professionals handle these patterns:
- **Linear** - Focus on simplicity, micro-interactions
- **Notion** - Empty states, loading states, animations
- **Stripe Dashboard** - Professional tables and forms
- **Vercel** - Clean spacing, status badges
- **GitHub** - Icons, badges, action menus

DON'T copy layouts—copy behavior and patterns. Adapt to your brand.

---

## Questions?

If you encounter a design decision not covered here, ask:
1. Is there a system variable for this?
2. Does a similar component already exist?
3. Can I apply an existing pattern here?

**If in doubt, consistency wins over creativity. Always.**
