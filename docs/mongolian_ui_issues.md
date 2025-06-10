# Mongolian Language UI Issues

## Issues Identified from Screenshots

### Progress Bar Section (Screenshot 1)
1. **Text Alignment Issue**: The "115% шаардлагатай хөрөнгө бэлэн байна" text is aligned too far to the right, making it appear disconnected from the progress bar.
2. **Space Constraint**: The Mongolian text is longer than its English equivalent and doesn't fit properly in the allocated space.
3. **Visual Balance**: The left side shows "Нийт шаардлагатай" and "$36,699 AUD" while the right side shows "Одоогийн үлдэгдэл" and "$42,200 AUD", but the spacing appears uneven.

### Visa Compliance Section (Screenshot 2)
1. **Text Truncation**: The right card appears to have text that's being cut off ("Гадаад оюу..." is incomplete).
2. **Card Width Inconsistency**: The right card doesn't appear to have the same width as the left card, causing layout imbalance.
3. **Progress Bar Alignment**: The green progress bar in the left card doesn't align properly with the text below it.
4. **Status Text Positioning**: The "Нөхцөл хангасан" (Condition met) text appears to be misaligned.

## Additional Potential Issues (Based on Common Localization Problems)

### Navigation and Header
1. **Sidebar Menu Items**: Mongolian text is likely longer than English equivalents, potentially causing overflow or wrapping issues.
2. **Header Elements**: Language toggle and user information may have spacing issues when displaying Mongolian text.

### Dashboard Components
1. **Card Titles**: Mongolian headings may be too long for fixed-width containers.
2. **Data Labels**: Financial terms in Mongolian may exceed allocated space.
3. **Button Text**: Action buttons may have text overflow issues with longer Mongolian text.

### Family Wealth Planning Section
1. **Asset Allocation Labels**: Pie chart labels in Mongolian may overlap or be truncated.
2. **Table Headers**: Column headers in Mongolian may cause table layout issues.
3. **Financial Figures**: Currency amounts with Mongolian labels may have alignment problems.

### Academic Timeline Section
1. **Date Formatting**: Mongolian date formats may not align properly.
2. **Event Descriptions**: Longer Mongolian descriptions may cause card expansion issues.

### Multi-Currency Wallet
1. **Currency Names**: Mongolian currency names may be truncated in the wallet view.
2. **Transaction Labels**: Longer Mongolian transaction descriptions may cause layout issues.

### Responsive Design Issues
1. **Mobile View**: Mongolian text likely causes more severe overflow issues on smaller screens.
2. **Tablet View**: Two-column layouts may break with longer Mongolian text.

## Root Causes

1. **Fixed Width Containers**: Many UI elements have fixed widths that don't accommodate longer Mongolian text.
2. **Right-Aligned Text**: Some percentage and status indicators are right-aligned but don't account for varying text lengths.
3. **Hardcoded Spacing**: Spacing between elements doesn't adjust based on text length.
4. **Insufficient Text Wrapping**: Some containers don't properly wrap longer Mongolian text.
5. **Font Size Consistency**: Same font size for both languages despite different character density.

## Priority Areas for Fixes

1. **Progress Bars and Status Indicators**: These show the most visible issues in the screenshots.
2. **Card Layouts**: Need flexible width handling for Mongolian text.
3. **Financial Information Display**: Critical for application functionality.
4. **Navigation Elements**: Essential for basic application usability.
5. **Responsive Breakpoints**: Need adjustment to accommodate Mongolian text across devices.
