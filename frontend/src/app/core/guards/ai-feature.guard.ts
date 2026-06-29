import { CanActivateFn } from '@angular/router';

/** Allows access to AI routes; the panel handles disabled backend gracefully. */
export const aiFeatureGuard: CanActivateFn = () => true;
