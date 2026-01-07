import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="active" class="tab-content">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./tab.component.scss']
})
export class TabComponent {
  @Input() label = '';
  @Input() icon?: string;
  @Input() active = false;
  @Input() disabled = false;
}

