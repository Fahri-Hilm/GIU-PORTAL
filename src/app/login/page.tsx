import { Suspense } from 'react';
import { Providers } from '@/components/providers';
import { BackgroundCanvas } from '@/components/background-canvas';
import { CursorGlow } from '@/components/cursor-glow';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Providers>
      <BackgroundCanvas />
      <CursorGlow />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </Providers>
  );
}
