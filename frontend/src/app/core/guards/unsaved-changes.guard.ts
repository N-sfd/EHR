import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component && typeof component.canDeactivate === 'function') {
    return component.canDeactivate();
  }
  return true;
};

