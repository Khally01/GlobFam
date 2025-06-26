# YNAB-Inspired Features Implementation Plan for GlobFam

## Overview
This document outlines the key YNAB (You Need A Budget) features to implement in GlobFam, focusing on the zero-based budgeting methodology and envelope budgeting system.

## Phase 1: Core Budget System (Priority: HIGH)

### 1. Budget Categories Management
**Purpose**: Allow users to create, organize, and manage budget categories in groups

**Features**:
- Create category groups (e.g., "Fixed Expenses", "Variable Expenses", "Savings Goals")
- Add/edit/delete categories within groups
- Reorder categories and groups via drag-and-drop
- Set category colors and icons
- Archive/hide unused categories

**Database Schema**:
```prisma
model BudgetCategoryGroup {
  id             String   @id @default(cuid())
  name           String
  order          Int
  organizationId String
  categories     BudgetCategory[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model BudgetCategory {
  id              String   @id @default(cuid())
  name            String
  groupId         String
  group           BudgetCategoryGroup @relation(fields: [groupId], references: [id])
  color           String?
  icon            String?
  order           Int
  isHidden        Boolean  @default(false)
  monthlyBudgets  MonthlyBudget[]
  transactions    Transaction[]
}
```

### 2. Monthly Budget View
**Purpose**: Core YNAB-style budget interface for assigning money to categories

**Features**:
- Month selector with ability to navigate between months
- Three-column layout per category:
  - **Budgeted**: Amount assigned to the category
  - **Activity**: Actual spending/income in the category
  - **Available**: Remaining funds (Budgeted + Previous Month's Available - Activity)
- Category group totals
- Quick budget options:
  - Budget same as last month
  - Budget average of last 3 months
  - Budget to zero
- Overspending indicators (red for cash overspending, yellow for credit)

### 3. "To Be Budgeted" (TBB) System
**Purpose**: Central concept showing money available to assign to categories

**Features**:
- Prominent TBB display at top of budget
- Real-time updates as money is assigned
- Warning when TBB goes negative (overbudgeting)
- Income directly increases TBB
- Calculation: TBB = All Income - All Budgeted Amounts

**Implementation**:
```typescript
interface BudgetSummary {
  toBeBudgeted: number
  totalBudgeted: number
  totalActivity: number
  totalAvailable: number
  overspending: number
}
```

## Phase 2: Enhanced Transaction Management (Priority: MEDIUM)

### 4. YNAB-Style Transaction Register
**Purpose**: Improved transaction entry and management

**Features**:
- Inline editing of transactions
- Split transactions (one transaction, multiple categories)
- Scheduled/recurring transactions
- Memo field for notes
- Payee management and auto-complete
- Cleared/uncleared status with reconciliation
- Quick approve imported transactions
- Keyboard shortcuts for efficiency

### 5. Account Reconciliation
**Purpose**: Ensure account balances match real bank accounts

**Features**:
- Reconcile button per account
- Enter current balance from bank
- Mark transactions as cleared
- Show discrepancies to investigate
- Lock reconciled transactions

## Phase 3: Goals & Reports (Priority: MEDIUM)

### 6. Goal Types
**Purpose**: Different goal strategies for categories

**Types**:
- **Target Category Balance**: Save X amount by Y date
- **Target Category Balance by Date**: Need X amount by specific date
- **Monthly Funding Goal**: Save X amount each month
- **Spending Goal**: Limit spending to X per month

**UI Elements**:
- Progress bars in budget view
- Goal indicators and completion status
- Suggested funding amounts

### 7. Age of Money
**Purpose**: Key metric showing financial buffer

**Calculation**:
- Track when money enters accounts (income)
- Track when money leaves (expenses)
- Calculate average "age" of spent money
- Display prominently in header

### 8. Reports Enhancement
**Purpose**: YNAB-style reports for insights

**Reports**:
- Spending by Category (pie/bar charts)
- Spending Trends (line graphs over time)
- Income vs Expense
- Net Worth progression
- Category spending over time

## Phase 4: Advanced Features (Priority: LOW)

### 9. Credit Card Handling
**Purpose**: YNAB's unique credit card payment category system

**Features**:
- Automatic payment category per credit card
- Move money to payment category when spending
- Track credit card balances
- Handle interest and fees

### 10. Direct Import Enhancement
**Purpose**: Streamline transaction import

**Features**:
- Auto-categorization based on payee
- Duplicate detection
- Import rules engine
- Approval workflow

## Implementation Priority

### Immediate (Next Sprint)
1. Budget Categories Management UI
2. Monthly Budget View layout
3. TBB calculation and display
4. Update transaction form to use budget categories

### Short Term (2-3 Sprints)
1. Category spending progress bars
2. Transaction register improvements
3. Basic goal types
4. Reconciliation feature

### Long Term
1. Age of Money calculation
2. Advanced reports
3. Credit card handling
4. Mobile app considerations

## UI/UX Considerations

### Colors
- Green: Positive available balance
- Yellow: Credit overspending
- Red: Cash overspending
- Gray: Zero or no activity

### Layout
- Fixed header with TBB
- Collapsible category groups
- Sticky column headers when scrolling
- Mobile-responsive with horizontal scroll for budget columns

### Interactions
- Click to edit amounts inline
- Tab navigation between fields
- Drag to reorder categories
- Right-click context menus

## Technical Considerations

### Performance
- Virtual scrolling for large transaction lists
- Debounced calculations for TBB
- Optimistic UI updates
- Cache budget calculations

### Data Integrity
- Validate budget amounts don't exceed TBB
- Ensure transaction categories exist
- Handle currency conversions for multi-currency
- Audit trail for budget changes

## Migration Path
1. Map existing categories to new budget categories
2. Create default category groups
3. Initialize first month's budget from current data
4. Provide onboarding for YNAB methodology

## Success Metrics
- User engagement with budget (daily/weekly active users)
- Percentage of transactions categorized
- Average age of money improvement
- Budget accuracy (budgeted vs actual)
- Time to complete monthly budget

## Next Steps
1. Create detailed mockups for budget view
2. Set up new database tables
3. Build budget categories CRUD API
4. Implement TBB calculation service
5. Create budget UI components