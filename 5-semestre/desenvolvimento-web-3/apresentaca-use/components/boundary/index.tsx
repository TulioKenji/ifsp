'use client';

import React, { useEffect, useState, ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

export function ErrorBoundary({
  children,
  fallback,
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);

    //   logErrorToMyService(
    //     error.error,
    //     error.error?.stack,
    //     // `captureOwnerStack` não existe em produção
    //     React.captureOwnerStack?.(),
    //   );
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    alert('An error occurred. Please try again later.');
    return <>{fallback}</>;
  }

  return <>{children}</>;
}