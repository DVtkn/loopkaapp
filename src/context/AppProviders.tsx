import React from 'react';
import { CoupleProvider } from './CoupleContext.tsx';

/**
 * AppProviders: корневая композиция доменных контекстов приложения Loop.
 * Инкапсулирует состояние аутентификации, пары, геймификации, реального времени (SSE) и данных.
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CoupleProvider>
      {children}
    </CoupleProvider>
  );
};

export default AppProviders;
