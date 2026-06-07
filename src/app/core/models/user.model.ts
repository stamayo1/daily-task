/**
 * Modelo de dominio para el Usuario de la aplicación.
 * Usado principalmente para el control del onboarding.
 */
export interface User {
  id: number;
  onboarding_check: 0 | 1;
}
