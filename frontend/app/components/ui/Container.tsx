// frontend/app/components/ui/Container.tsx

import type { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-6 sm:px-12 ${className}`}>
      {children}
    </div>
  );
}
