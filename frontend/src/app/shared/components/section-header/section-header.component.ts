import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent {
  @Input() title: string = '';
  @Input() collapsible: boolean = false;
  @Input() collapsed: boolean = false;
  @Output() collapsedChange = new EventEmitter<boolean>();
  @Input() icon?: string;

  toggleCollapse() {
    if (this.collapsible) {
      this.collapsed = !this.collapsed;
      this.collapsedChange.emit(this.collapsed);
    }
  }
}
