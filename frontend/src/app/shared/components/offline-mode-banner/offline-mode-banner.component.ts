import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterDataService } from '../../../core/services/master-data.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-offline-mode-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-banner" *ngIf="isOfflineMode$ | async">
      <div class="banner-content">
        <i class="fas fa-info-circle"></i>
        <span>Using demo data (offline mode)</span>
      </div>
    </div>
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fef3c7;
      border-bottom: 1px solid #f59e0b;
      z-index: 1000;
      padding: 8px 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      color: #92400e;
      font-size: 13px;
      font-weight: 500;
      max-width: 1200px;
      margin: 0 auto;
    }

    .banner-content i {
      font-size: 14px;
    }
  `]
})
export class OfflineModeBannerComponent implements OnInit, OnDestroy {
  private masterDataService = inject(MasterDataService);
  isOfflineMode$!: Observable<boolean>;
  private subscription?: Subscription;

  ngOnInit(): void {
    this.isOfflineMode$ = this.masterDataService.isOfflineMode();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

