# GlobFam Brand Guidelines

## Brand Identity

### Mission
"Global Families, Local Wisdom" - Empowering international families to manage wealth across borders, currencies, and generations.

### Vision
To be the leading financial platform for international families, bridging cultural and geographical gaps in wealth management.

## Visual Identity

### Logo
- **Primary Icon**: 🌍 (Globe emoji) or custom globe icon
- **Logo Mark**: Circular gradient background with globe/family icon
- **Logo Text**: "GlobFam" in Inter font, bold weight
- **Tagline**: "Global Families, Local Wisdom" in smaller, medium weight

### Color Palette

#### Primary Colors
- **GlobFam Blue**: `#2563EB` - Trust, stability, global reach
- **Prosperity Green**: `#059669` - Growth, wealth, success
- **Primary Gradient**: `linear-gradient(135deg, #2563EB, #059669)`

#### Secondary Colors
- **Warm Gold**: `#D97706` - Premium, achievement, warmth
- **Mongolian Red**: `#DC2626` - Cultural heritage, energy
- **Australian Teal**: `#0891B2` - Ocean, connection, clarity
- **Neutral Gray**: `#6B7280` - Balance, professionalism

#### Semantic Colors
- **Success Light**: `#10B981` - Positive actions, growth
- **Warning Amber**: `#F59E0B` - Alerts, attention
- **Error Red**: `#EF4444` - Errors, critical actions
- **Info Blue**: `#3B82F6` - Information, guidance

#### Gradient Systems
- **Primary Gradient**: `linear-gradient(135deg, #2563EB, #059669)`
- **Warm Gradient**: `linear-gradient(135deg, #D97706, #059669)`
- **Cultural Gradient**: `linear-gradient(135deg, #DC2626, #0891B2)`

### Typography

#### Font Family
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

#### Type Scale
- **Hero Heading**: 3rem (48px), Bold
- **Section Heading**: 2rem (32px), Semibold
- **Subsection**: 1.5rem (24px), Semibold
- **Body Large**: 1.25rem (20px), Regular
- **Body**: 1rem (16px), Regular
- **Small**: 0.875rem (14px), Regular
- **Caption**: 0.75rem (12px), Medium

### Spacing System
- Base unit: 0.25rem (4px)
- Common spacings: 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem

### Border Radius
- Small: 0.375rem (6px)
- Medium: 0.5rem (8px)
- Large: 0.75rem (12px)
- Extra Large: 1rem (16px)
- Circle: 50%

## UI Components

### Buttons
- **Primary CTA**: Gradient background, white text, 0.75rem padding vertical, 1.5rem horizontal
- **Hover State**: translateY(-2px), shadow elevation
- **Border Radius**: 0.5rem

### Cards
- **Background**: White (#FFFFFF)
- **Border**: 1px solid #E5E7EB
- **Shadow**: 0 4px 6px rgba(0, 0, 0, 0.05)
- **Padding**: 1.5rem to 2rem
- **Border Radius**: 0.75rem to 1rem

### Navigation
- **Active State**: Primary blue color with gradient underline
- **Hover State**: Color transition to primary blue
- **Link Spacing**: 2rem gap

## Brand Applications

### Feature Icons
1. **Multi-Currency**: Blue gradient background (#DBEAFE to #BFDBFE)
2. **Family**: Yellow gradient background (#FEF3C7 to #FDE68A)
3. **Education**: Green gradient background (#DCFCE7 to #BBF7D0)
4. **AI Advisor**: Purple gradient background (#F3E8FF to #DDD6FE)

### Dashboard Themes
- **Wealth Overview**: Light blue gradient backgrounds
- **Family Legacy**: Warm yellow-green gradient
- **Money Garden**: Sky blue to grass green gradient

## Animation Guidelines

### Transitions
- **Duration**: 0.3s for interactive elements
- **Easing**: ease or ease-in-out
- **Properties**: transform, color, background, box-shadow

### Micro-interactions
- **Hover Effects**: Scale(1.02) or translateY(-2px to -4px)
- **Click Feedback**: Scale(0.98) momentarily
- **Loading States**: Gentle pulse or shimmer effects

### Special Animations
- **Money Garden Plants**: 3s gentle sway animation
- **Achievement Stars**: 2s twinkle animation
- **Data Updates**: Staggered scale animations

## Voice & Tone

### Brand Personality
- **Trustworthy**: Professional yet approachable
- **Inclusive**: Culturally aware and globally minded
- **Empowering**: Educational and supportive
- **Innovative**: Modern tech with human touch

### Content Guidelines
- Use clear, jargon-free language
- Be culturally sensitive and inclusive
- Focus on family values and generational wealth
- Emphasize security and trust
- Celebrate achievements and milestones

### Key Messages
1. "Your Family's Financial Future, Worldwide"
2. "Global Families, Local Wisdom"
3. "Managing wealth across borders, currencies, and generations"
4. "The only financial platform built specifically for international families"

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Adaptations
- Stack navigation vertically
- Single column layouts for cards
- Adjusted font sizes (hero: 2rem)
- Touch-friendly tap targets (min 44px)

## Accessibility

### Color Contrast
- Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Test gradient text for readability
- Provide alternatives to color-only indicators

### Interactive Elements
- Clear focus states
- Keyboard navigation support
- Descriptive link text
- Alt text for decorative elements

## Implementation Notes

### CSS Variables
All colors should be defined as CSS custom properties for easy theming and maintenance.

### Gradient Text
Use `-webkit-background-clip: text` technique for gradient text effects, with solid color fallbacks.

### Performance
- Optimize animations for 60fps
- Use transform and opacity for animations
- Lazy load non-critical assets
- Minimize gradient complexity on mobile

## Do's and Don'ts

### Do's
- ✅ Use gradients to create visual hierarchy
- ✅ Maintain consistent spacing
- ✅ Test across multiple currencies and languages
- ✅ Keep family-friendly and professional
- ✅ Use emojis thoughtfully to enhance understanding

### Don'ts
- ❌ Overuse gradients or animations
- ❌ Mix too many colors in one view
- ❌ Use technical financial jargon
- ❌ Forget cultural sensitivities
- ❌ Compromise readability for aesthetics