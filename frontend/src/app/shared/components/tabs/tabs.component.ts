import { Component, Input, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent } from './tab.component';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, TabComponent],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
  @Input() variant: 'default' | 'pills' = 'default';
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;

  ngAfterContentInit() {
    // Activate first tab by default if none are active
    const activeTabs = this.tabs.filter(tab => tab.active);
    if (activeTabs.length === 0 && this.tabs.length > 0) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: TabComponent) {
    // Deactivate all tabs
    this.tabs.forEach(t => t.active = false);
    // Activate selected tab
    tab.active = true;
  }
}

