import { Suspense } from 'react';
import { Providers } from '@/components/providers';
import { BackgroundCanvas } from '@/components/background-canvas';
import { CursorGlow } from '@/components/cursor-glow';
import { SignupForm } from './signup-form';

export default function SignupPage() {
  return (
    <Providers>
      <BackgroundCanvas />
      <CursorGlow />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </div>
    </Providers>
  );
}
