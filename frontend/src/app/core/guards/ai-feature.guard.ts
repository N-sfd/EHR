import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { environment } from '../../../environments/environment';

/** Blocks AI routes when the backend reports {@code aiEnabled: false}. In development, always allows access. */
export const aiFeatureGuard: CanActivateFn = () => {
  const flags = inject(FeatureFlagsService);
  const router = inject(Router);
  if (!environment.production || flags.aiEnabled()) {
    return true;
  }
  return router.createUrlTree(['/admin/dashboard']);
};
