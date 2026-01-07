import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.authService.logout();
  }
}


