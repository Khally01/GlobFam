# GlobFam Brand Guidelines

## Brand Overview

GlobFam is a premium fintech platform for international families, combining the sophistication of Stripe's design with warm, approachable elements that reflect family values and global connectivity.

### Brand Personality
- **Professional** yet **Approachable**
- **Modern** and **Trustworthy**
- **Global** but **Personal**
- **Sophisticated** yet **Simple**

## Color System

### Primary Colors
```css
/* Inspired by Stripe's purple-blue gradient with warmer tones */
--primary-50: #faf5ff;
--primary-100: #f3e8ff;
--primary-200: #e9d5ff;
--primary-300: #d8b4fe;
--primary-400: #c084fc;
--primary-500: #a855f7;  /* Main Primary */
--primary-600: #9333ea;
--primary-700: #7e22ce;
--primary-800: #6b21a8;
--primary-900: #581c87;
```

### Secondary Colors
```css
/* Warm accent colors for family-friendly touch */
--secondary-50: #fef3c7;
--secondary-100: #fde68a;
--secondary-200: #fcd34d;
--secondary-300: #fbbf24;
--secondary-400: #f59e0b;
--secondary-500: #ea7e0c;  /* Main Secondary */
--secondary-600: #d97706;
--secondary-700: #b45309;
--secondary-800: #92400e;
--secondary-900: #78350f;
```

### Neutral Colors
```css
/* Clean grays inspired by Stripe */
--gray-50: #fafafa;
--gray-100: #f4f4f5;
--gray-200: #e4e4e7;
--gray-300: #d4d4d8;
--gray-400: #a1a1aa;
--gray-500: #71717a;
--gray-600: #52525b;
--gray-700: #3f3f46;
--gray-800: #27272a;
--gray-900: #18181b;
```

### Semantic Colors
```css
/* Status colors with fintech precision */
--success: #10b981;    /* Green for positive metrics */
--warning: #f59e0b;    /* Amber for attention */
--error: #ef4444;      /* Red for errors/negative */
--info: #3b82f6;       /* Blue for information */
```

### Gradients
```css
/* Signature gradients */
--gradient-primary: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
--gradient-vibrant: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
--gradient-warm: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
--gradient-subtle: linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0) 100%);
```

## Typography

### Font Stack
```css
/* Primary Font - Modern and clean like Stripe */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace for numbers and codes */
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
```

### Type Scale
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Spacing System

Based on 4px grid for consistency:
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - Tight corners */
--radius-md: 0.375rem;  /* 6px - Default */
--radius-lg: 0.5rem;    /* 8px - Cards */
--radius-xl: 0.75rem;   /* 12px - Modals */
--radius-2xl: 1rem;     /* 16px - Large elements */
--radius-full: 9999px;  /* Pills and circles */
```

## Shadows

```css
/* Subtle shadows like Stripe */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Colored shadows for hover states */
--shadow-primary: 0 4px 14px 0 rgba(168, 85, 247, 0.25);
```

## Component Patterns

### Cards
- White background with subtle border
- Hover: slight shadow elevation
- Radius: 8px (radius-lg)
- Padding: 24px (space-6)

### Buttons
- **Primary**: Gradient background, white text
- **Secondary**: Gray background, dark text
- **Ghost**: Transparent with hover state
- Height: 40px (default), 32px (small)
- Radius: 6px (radius-md)
- Font weight: 500 (medium)

### Forms
- Input height: 40px
- Border: 1px solid gray-200
- Focus: primary-500 border with ring
- Radius: 6px (radius-md)

### Navigation
- Sidebar: 280px width
- Header: 64px height
- Clean lines, minimal shadows

## Motion & Animation

```css
/* Smooth, professional transitions */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;

/* Spring animations for delightful interactions */
--spring-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--spring-smooth: cubic-bezier(0.34, 1.56, 0.64, 1);
```

## Icons

- **Style**: Outlined, 1.5px stroke
- **Size**: 16px (small), 20px (default), 24px (large)
- **Library**: Lucide React (clean, consistent)

## Logo Usage

### Primary Logo
- Wordmark: "GlobFam" in custom typography
- Icon: Globe with family connection nodes
- Colors: Primary gradient or solid black/white

### Logo Variations
1. Full logo (icon + wordmark)
2. Icon only (small spaces)
3. Wordmark only (horizontal layouts)

## Voice & Tone

### Writing Principles
1. **Clear**: Use simple, direct language
2. **Confident**: Be authoritative about finance
3. **Friendly**: Warm and approachable
4. **Global**: Inclusive of all cultures

### Examples
- ❌ "Submit financial documentation"
- ✅ "Add your bank statement"

- ❌ "Transaction reconciliation failed"
- ✅ "We couldn't match this transaction"

## Implementation Notes

### CSS Variables
All colors and values should use CSS variables for consistency and theming:

```css
:root {
  /* Colors */
  --color-primary: var(--primary-500);
  --color-background: var(--gray-50);
  --color-surface: white;
  --color-text: var(--gray-900);
  --color-text-secondary: var(--gray-600);
  
  /* Borders */
  --border-color: var(--gray-200);
  --border-width: 1px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--gray-900);
    --color-surface: var(--gray-800);
    --color-text: white;
    --color-text-secondary: var(--gray-400);
    --border-color: var(--gray-700);
  }
}
```

### Accessibility
- Minimum contrast ratio: 4.5:1 for normal text
- Focus indicators on all interactive elements
- Semantic HTML structure
- ARIA labels where needed

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## Special Elements

### Data Visualization
- Use primary gradient for positive trends
- Muted colors for historical data
- High contrast for important metrics

### Empty States
- Friendly illustrations
- Clear call-to-action
- Helpful guidance text

### Loading States
- Skeleton screens over spinners
- Smooth fade-in animations
- Progress indicators for long operations

### Success States
- Green checkmarks with spring animation
- Celebratory but professional
- Clear next steps

This design system combines Stripe's clean, professional aesthetic with warmer touches that reflect GlobFam's family-oriented mission, creating a unique identity in the fintech space.