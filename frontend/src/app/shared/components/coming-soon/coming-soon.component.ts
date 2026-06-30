import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.css']
})
export class ComingSoonComponent {
  @Input() icon = 'fa-flask';
  @Input() title = 'Coming Soon';
  @Input() description = 'This module is part of our roadmap and is being finalized for this release.';

  constructor(route: ActivatedRoute) {
    const data = route.snapshot.data;
    if (data['icon']) this.icon = data['icon'];
    if (data['title']) this.title = data['title'];
    if (data['description']) this.description = data['description'];
  }
}
