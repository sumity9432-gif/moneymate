-- MoneyMate Production Supabase Database Schema
-- Version: 1.0
-- Currency: INR (₹)
-- Owner Account: Sumity9432@gmail.com
-- Timezone: Asia/Kolkata

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT 'Sumit',
    avatar_url TEXT,
    monthly_salary NUMERIC(12, 2) NOT NULL DEFAULT 85000.00,
    annual_savings_target NUMERIC(12, 2) NOT NULL DEFAULT 200000.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Incomes Table
CREATE TABLE IF NOT EXISTS public.incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('salary', 'bonus', 'freelance', 'investment', 'other')),
    date DATE NOT NULL,
    month_year TEXT NOT NULL, -- Format: YYYY-MM
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Food and groceries',
        'Shopping',
        'Entertainment',
        'Travel',
        'Fuel and transportation',
        'Online subscriptions',
        'Gadgets and electronics',
        'Personal expenses',
        'Medical expenses',
        'Miscellaneous'
    )),
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash')),
    is_unnecessary BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Loans and Debts Table
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    loan_name TEXT NOT NULL,
    lender TEXT NOT NULL,
    original_amount NUMERIC(12, 2) NOT NULL CHECK (original_amount > 0),
    outstanding_amount NUMERIC(12, 2) NOT NULL CHECK (outstanding_amount >= 0),
    monthly_emi NUMERIC(12, 2) NOT NULL CHECK (monthly_emi > 0),
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 10.50, -- Percentage
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    due_date_day INTEGER NOT NULL CHECK (due_date_day BETWEEN 1 AND 31),
    remaining_installments INTEGER NOT NULL CHECK (remaining_installments >= 0),
    total_installments INTEGER NOT NULL CHECK (total_installments > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. EMI Payment History Table
CREATE TABLE IF NOT EXISTS public.emi_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    principal_component NUMERIC(12, 2) NOT NULL DEFAULT 0,
    interest_component NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_date DATE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'missed', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    monthly_contribution NUMERIC(12, 2) NOT NULL DEFAULT 0,
    category TEXT NOT NULL DEFAULT 'General',
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Wishlist Items Table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    target_price NUMERIC(12, 2) NOT NULL CHECK (target_price > 0),
    amount_saved NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount_saved >= 0),
    target_date DATE NOT NULL,
    monthly_contribution NUMERIC(12, 2) NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    category TEXT NOT NULL DEFAULT 'Gadgets',
    is_achieved BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('emi_due', 'emi_upcoming', 'overdue', 'savings_milestone', 'wishlist', 'system')),
    date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_entity_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Financial Settings Table
CREATE TABLE IF NOT EXISTS public.financial_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    remind_days_before INTEGER[] NOT NULL DEFAULT '{5, 2, 0}',
    browser_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    email_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- MANDATORY: SINGLE-USER PRIVATE ACCESS ONLY (Sumity9432@gmail.com)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emi_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is the designated owner
CREATE OR REPLACE FUNCTION public.is_authorized_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') = 'Sumity9432@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Owner only profile access" ON public.profiles
    FOR ALL USING (auth.uid() = id AND public.is_authorized_owner());

-- Incomes Policies
CREATE POLICY "Owner only income access" ON public.incomes
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());

-- Expenses Policies
CREATE POLICY "Owner only expense access" ON public.expenses
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());

-- Loans Policies
CREATE POLICY "Owner only loan access" ON public.loans
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());

-- EMI Payments Policies
CREATE POLICY "Owner only emi payment access" ON public.emi_payments
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());

-- Savings Goals Policies
CREATE POLICY "Owner only savings goals access" ON public.savings_goals
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());

-- Wishlist Items Policies
CREATE POLICY "Owner only wishlist access" ON public.wishlist_items
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());

-- Notifications Policies
CREATE POLICY "Owner only notifications access" ON public.notifications
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());

-- Settings Policies
CREATE POLICY "Owner only settings access" ON public.financial_settings
    FOR ALL USING (auth.uid() = user_id AND public.is_authorized_owner());
