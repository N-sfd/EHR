import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-banner.component.html',
  styleUrls: ['./alert-banner.component.scss']
})
export class AlertBannerComponent {
  @Input() type: AlertType = 'info';
  @Input() message = '';
  @Input() dismissible = false;
  @Input() icon?: string;

  isDismissed = false;

  get defaultIcon(): string {
    switch (this.type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-info-circle';
    }
  }

  dismiss() {
    this.isDismissed = true;
  }
}

