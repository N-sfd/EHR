import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AdminProfileService } from '../services/admin-profile.service';
import { UserRole } from '../models/admin-profile.model';

/**
 * Role-based route guard factory.
 * 
 * Usage in routes:
 * {
 *   path: 'admin-only',
 *   canActivate: [roleGuard(['ADMIN'])],
 *   component: AdminComponent
 * }
 * 
 * @param allowed - Array of roles that are allowed to access the route
 * @returns CanActivateFn guard function
 */
export const roleGuard = (allowed: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const adminProfileService = inject(AdminProfileService);
    const router = inject(Router);

    const profile = adminProfileService.getProfile();
    const userRole = profile?.role;

    if (!userRole) {
      // No role found, redirect to dashboard
      router.navigate(['/admin/dashboard']);
      return false;
    }

    if (allowed.includes(userRole)) {
      return true;
    }

    // User role not in allowed list, redirect to dashboard
    router.navigate(['/admin/dashboard']);
    return false;
  };
};

