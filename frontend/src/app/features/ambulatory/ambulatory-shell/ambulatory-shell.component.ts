import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Clinical Encounters Shell - Container for clinical encounter navigation and content
@Component({
  selector: 'app-ambulatory-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './ambulatory-shell.component.html',
  styleUrls: ['./ambulatory-shell.component.css']
})
export class AmbulatoryShellComponent {
}

