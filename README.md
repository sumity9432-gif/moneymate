# MoneyMate — Personal Finance Management Web Application

> **"Every Rupee. Every Goal. Every Payment. Under Control."**

Version: **1.0**  
Access Model: **Private – Single User Only**  
Designated Owner: **`Sumity9432@gmail.com`**  
Currency: **Indian Rupees (₹, INR)**  
Timezone: **Asia/Kolkata**  

---

## 📌 Project Architecture & Highlights

MoneyMate is a dedicated personal finance web application built strictly to fulfill the complete financial blueprint for Sumit. It combines income tracking, 10-category expense classification, interest-adjusted loan amortization, a full monthly recurring EMI calendar, automated payment notifications, an annual ₹2,00,000 savings roadmap, and a smart wishlist affordability advisor (e.g., PlayStation 5 goal).

### 1. Main Dashboard Overview
- **8 Primary Financial Cards**:
  1. **Monthly Income**: Real-time sum of salary, bonuses, and incentives.
  2. **Monthly Expenses**: Running monthly living and personal expenditures.
  3. **Available Spending Balance**: Computed using the core blueprint formula:
     $$\text{Available Spending Balance} = \text{Total Income} - \text{Expenses} - \text{EMI Commitments} - \text{Planned Savings}$$
  4. **Total Outstanding Debt**: Cumulative live balance across all active loans.
  5. **Monthly EMI Commitments**: Total mandatory monthly debt outflow.
  6. **Upcoming EMI Payments**: Nearest due date and active count.
  7. **Total Accumulated Savings**: Emergency cushion and wealth accumulation.
  8. **Annual Savings Progress**: Real-time percentage against the ₹2,00,000 annual target.
- **Visual Analytics**: Interactive Cashflow Bar Charts, Category-wise Donut Breakdown, and 6-Month Debt-Payoff Trajectory.

---

### 2. Salary & Income Management
- Add base salary, bonuses, incentives, freelance income, and dividends.
- Monthly history comparison and annual earnings accumulator.
- Visual step-by-step formula breakdown explaining the exact deduction of obligations.

---

### 3. Expense Management
- Categorized across 10 specific categories:
  1. *Food and groceries*
  2. *Shopping*
  3. *Entertainment*
  4. *Travel*
  5. *Fuel and transportation*
  6. *Online subscriptions*
  7. *Gadgets and electronics*
  8. *Personal expenses*
  9. *Medical expenses*
  10. *Miscellaneous*
- Methods: `UPI`, `Credit Card`, `Debit Card`, `Net Banking`, `Cash`.
- **Discretionary / Unnecessary Spending Filter**: Immediately highlights budget leaks and impulse purchases.
- Add, Edit, Delete, Search, and 1-Click CSV Data Export.

---

### 4. EMI & Debt Management (Interest-Adjusted Amortization)
- **Centralized Loan Cards**: Lender, Original Principal, Current Outstanding, Monthly EMI, Interest Rate (% p.a.), Due Day, and Remaining Installments.
- **Interest vs Principal Split Calculation**:
  $$\text{Interest Component} = \text{Outstanding Amount} \times \left(\frac{\text{Annual Rate}}{12 \times 100}\right)$$
  $$\text{Principal Component} = \text{Monthly EMI} - \text{Interest Component}$$
  $$\text{New Outstanding} = \text{Outstanding} - \text{Principal Component}$$
- **Full Amortization Table**: Preview future payment breakdown for any loan.
- **One-Click Repayment Logger**: Deducts principal accurately and increments payment history.

---

### 5. Full Monthly EMI Calendar
- Full month grid view with previous and next month navigation.
- **Mandatory 4-Color Calendar System**:
  - 🔴 **Red**: EMI Due
  - 🟢 **Green**: EMI Paid
  - 🟠 **Orange**: Upcoming Payment (within 5 days)
  - 🔵 **Blue**: Other Financial Events / Subscriptions / Bills
- Clickable day cells with detailed modal and instant "Mark as Paid" action.
- Automatically projects recurring monthly EMI dates for future months.

---

### 6. Savings Management & ₹2,00,000 Annual Roadmap
- Dedicated emergency fund and wealth creation buckets.
- Automatic monthly contribution calculator:
  $$\text{Required Monthly Contribution} = \frac{\text{Remaining Target}}{\text{Remaining Months}}$$
- Deposit logger and goal completion indicators.

---

### 7. Wishlist & Future Purchases (PlayStation 5 Planner)
- Dedicated goals for PlayStation 5, smartphones, laptops, and vacations.
- **Smart Purchase Affordability Advisor**: Evaluates whether the required monthly contribution fits within your **Available Spending Balance** without compromising essential groceries or loan payments.
- Confetti celebration upon goal completion!

---

### 8. Financial Reports & Export
- Monthly & annual statements with complete category analysis.
- One-click CSV / Excel export.
- Clean, print-ready PDF financial statement layout.

---

### 9. Security & Supabase Integration
- **Owner Restricted**: Configured strictly for `Sumity9432@gmail.com`.
- **Database Schema**: Full PostgreSQL schema file with Row Level Security (RLS) located in `supabase/schema.sql`.
- **Zero-Config Local Mode**: Runs offline with full localStorage persistence; automatically switches to Supabase cloud when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided in `.env.local`.

---

## 🚀 Running MoneyMate Locally

1. Open your terminal in the project directory:
   ```bash
   cd C:\Users\sumit\.gemini\antigravity\scratch\moneymate
   ```

2. Start the application:
   ```bash
   npm run dev
   # or production mode
   npm run build && npm run start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. Sign in with the owner account `Sumity9432@gmail.com` to access the full administrative dashboard.
