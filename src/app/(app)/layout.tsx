import { Providers } from '@/components/providers';
import { AuthGuard } from '@/components/auth-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AuthGuard>{children}</AuthGuard>
    </Providers>
  );
}
