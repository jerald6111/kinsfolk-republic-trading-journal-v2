# Per-Page Currency Selection Implementation Guide

## Overview
This feature allows users to choose different currencies for viewing data on each page, while maintaining a global primary currency setting. Users can select between their primary currency, secondary currency, or any other available currency on a per-page basis.

## Architecture

### 1. **Enhanced CurrencyContext** (`src/context/CurrencyContext.tsx`)
New functions added:
- `formatAmountInCurrency(amount: number, currency: Currency): string` - Format amount in any specific currency
- `formatAmount(amount, showBoth?, overrideCurrency?)` - Enhanced with optional currency override

### 2. **PageCurrencySelector Component** (`src/components/PageCurrencySelector.tsx`)
A reusable dropdown component that:
- Shows primary and secondary currencies prominently
- Allows selection of any available currency
- Displays currency badges (Primary/Secondary)
- Provides info when no secondary is set
- Persists selection per page

### 3. **usePageCurrency Hook** (`src/hooks/usePageCurrency.ts`)
Custom hook for managing per-page currency state:
```typescript
const { localCurrency, setLocalCurrency, displayCurrency } = usePageCurrency('pageKey', primaryCurrency)
```

## Implementation Steps

### Step 1: Import Required Dependencies

```tsx
import { useCurrency } from '../context/CurrencyContext'
import { usePageCurrency } from '../hooks/usePageCurrency'
import PageCurrencySelector from '../components/PageCurrencySelector'
```

### Step 2: Set Up Currency State

```tsx
export default function YourPage() {
  const { formatAmount, formatAmountInCurrency, primaryCurrency } = useCurrency()
  const { localCurrency, setLocalCurrency, displayCurrency } = usePageCurrency('your-page-key', primaryCurrency)
  
  // ... rest of your component
}
```

**Important:** Choose a unique `pageKey` for each page:
- `'wallet'` - Wallet page
- `'analytics'` - Trade Analytics
- `'dashboard'` - Dashboard
- `'charts'` - Charts page
- `'vision'` - Vision Board
- etc.

### Step 3: Add PageCurrencySelector to UI

Add the selector to your page header:

```tsx
<div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-3">
    <span className="text-4xl">📊</span>
    <div>
      <h1 className="text-3xl font-bold">Your Page Title</h1>
      <p className="text-krmuted text-sm mt-1">Page description</p>
    </div>
  </div>
  
  {/* Page Currency Selector */}
  <PageCurrencySelector 
    localCurrency={localCurrency}
    onCurrencyChange={setLocalCurrency}
    label="View in" // Optional - defaults to "View in"
  />
</div>
```

### Step 4: Update Amount Displays

Replace all `formatAmount()` calls with `formatAmountInCurrency()`:

**Before:**
```tsx
<p>{formatAmount(balance)}</p>
<p>{formatAmount(totalPnl)}</p>
```

**After:**
```tsx
<p>{formatAmountInCurrency(balance, displayCurrency)}</p>
<p>{formatAmountInCurrency(totalPnl, displayCurrency)}</p>
```

## Example Implementations

### Example 1: Wallet Page ✅ (Completed)

```tsx
import { usePageCurrency } from '../hooks/usePageCurrency'
import PageCurrencySelector from '../components/PageCurrencySelector'

export default function Wallet() {
  const { formatAmountInCurrency, primaryCurrency } = useCurrency()
  const { localCurrency, setLocalCurrency, displayCurrency } = usePageCurrency('wallet', primaryCurrency)
  
  return (
    <div>
      <div className="flex justify-between">
        <h1>Wallet</h1>
        <PageCurrencySelector 
          localCurrency={localCurrency}
          onCurrencyChange={setLocalCurrency}
          label="View balance in"
        />
      </div>
      
      <div className="balance">
        {formatAmountInCurrency(balance, displayCurrency)}
      </div>
    </div>
  )
}
```

### Example 2: Trade Analytics ✅ (Completed)

```tsx
export default function TradeAnalytics() {
  const { formatAmountInCurrency, primaryCurrency } = useCurrency()
  const { localCurrency, setLocalCurrency, displayCurrency } = usePageCurrency('analytics', primaryCurrency)
  
  return (
    <div>
      <PageCurrencySelector 
        localCurrency={localCurrency}
        onCurrencyChange={setLocalCurrency}
        label="View analytics in"
      />
      
      <p>Total PnL: {formatAmountInCurrency(totalPnl, displayCurrency)}</p>
      <p>Avg Win: {formatAmountInCurrency(avgWin, displayCurrency)}</p>
    </div>
  )
}
```

## Pages to Update

### Priority 1 (High Traffic):
- ✅ **Wallet** - Completed
- ✅ **Trade Analytics** - Completed
- ⏳ **Dashboard** - Add selector
- ⏳ **Journal Entries** - Add selector
- ⏳ **Charts/Snapshots** - Add selector

### Priority 2 (Secondary Pages):
- ⏳ **Vision Board** (for goal amounts)
- ⏳ **PNL Overview**
- ⏳ **Journal Overview**

## User Experience

### How It Works:
1. User opens **Wallet** page → sees primary currency (USD)
2. Clicks currency selector → chooses PHP
3. All wallet amounts now display in PHP
4. User navigates to **Analytics** → still sees USD (default)
5. User can choose different currency for Analytics independently
6. Settings persist across sessions (localStorage)

### Benefits:
- **Flexibility**: View different pages in different currencies
- **Comparison**: Compare wallet in USD vs analytics in local currency
- **Persistence**: Selections saved per page
- **Smart Defaults**: Always starts with primary currency
- **Live Conversion**: Real-time exchange rates

## Technical Details

### LocalStorage Keys:
- `kr_page_currency_wallet` - Wallet page selection
- `kr_page_currency_analytics` - Analytics selection
- `kr_page_currency_dashboard` - Dashboard selection
- etc.

### Conversion Logic:
All amounts are stored in **primary currency** internally. When displayed:
1. Amount is in primary currency (USD)
2. User selects display currency (PHP)
3. `formatAmountInCurrency()` converts: USD → PHP using live rates
4. Displays: `₱56,500.00`

### Performance:
- No additional API calls (uses cached rates from CurrencyContext)
- Minimal re-renders (only when currency changed)
- Lightweight localStorage usage

## Best Practices

### DO:
✅ Use unique pageKey for each page
✅ Always provide primaryCurrency to usePageCurrency
✅ Replace ALL formatAmount calls with formatAmountInCurrency
✅ Add PageCurrencySelector in header/top section
✅ Use descriptive labels ("View balance in", "View analytics in")

### DON'T:
❌ Reuse pageKeys across different pages
❌ Mix formatAmount and formatAmountInCurrency on same page
❌ Forget to import all required dependencies
❌ Place selector in hard-to-find locations

## Troubleshooting

### Issue: Currency not persisting
**Solution:** Check that pageKey is unique and consistent

### Issue: Amounts not converting
**Solution:** Ensure you're using `formatAmountInCurrency(amount, displayCurrency)` not `formatAmount(amount)`

### Issue: Selector not showing secondary currency
**Solution:** User needs to set secondary currency in Settings first

## Future Enhancements

Potential additions:
- Global "Apply to all pages" button
- Bulk currency selection
- Currency comparison mode (side-by-side)
- Export reports in selected currency
- Quick currency switcher in navbar

---

**Implementation Status:**
- ✅ CurrencyContext enhanced
- ✅ PageCurrencySelector component created
- ✅ usePageCurrency hook created
- ✅ Wallet page implemented
- ✅ Trade Analytics implemented
- ⏳ Remaining pages pending

**Next Steps:**
Apply the same pattern to Dashboard, Journal, Charts, and Vision Board pages.
