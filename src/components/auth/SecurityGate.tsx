'use client';

import React from 'react';
import { useMoneyMate } from '@/context/MoneyMateContext';
import { AuthPage } from './AuthPage';
import { OnboardingWizard } from '../onboarding/OnboardingWizard';

export const SecurityGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwnerAuthenticated, profile } = useMoneyMate();

  // If not logged in, show Auth Page (Sign In / Sign Up / Google)
  if (!isOwnerAuthenticated) {
    return <AuthPage />;
  }

  // If newly logged in or signed up user who hasn't onboarded yet, show custom setup wizard
  if (profile.isOnboarded === false) {
    return <OnboardingWizard />;
  }

  // Regular authenticated user with configured profile
  return <>{children}</>;
};
