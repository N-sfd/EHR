import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-split-pane',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './split-pane.component.html',
  styleUrls: ['./split-pane.component.scss']
})
export class SplitPaneComponent {
  @Input() leftWidth = '50%';
  @Input() rightWidth = '50%';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() resizable = false;
  @Input() minLeftWidth = '200px';
  @Input() minRightWidth = '200px';

  @ContentChild('leftPane') leftPaneTemplate?: TemplateRef<any>;
  @ContentChild('rightPane') rightPaneTemplate?: TemplateRef<any>;

  isResizing = false;
  currentLeftWidth = this.leftWidth;

  startResize(event: MouseEvent) {
    if (!this.resizable) return;
    this.isResizing = true;
    event.preventDefault();
  }

  onResize(event: MouseEvent) {
    if (!this.isResizing || !this.resizable) return;
    
    const container = (event.currentTarget as HTMLElement).closest('.split-pane-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const percentage = ((event.clientX - rect.left) / rect.width) * 100;
    
    const minLeft = parseFloat(this.minLeftWidth);
    const minRight = parseFloat(this.minRightWidth);
    const minLeftPercent = (minLeft / rect.width) * 100;
    const minRightPercent = (minRight / rect.width) * 100;

    if (percentage >= minLeftPercent && percentage <= (100 - minRightPercent)) {
      this.currentLeftWidth = `${percentage}%`;
    }
  }

  stopResize() {
    this.isResizing = false;
  }
}

