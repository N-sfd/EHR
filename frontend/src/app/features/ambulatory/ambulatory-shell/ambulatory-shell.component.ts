import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ambulatory-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './ambulatory-shell.component.html',
  styleUrls: ['./ambulatory-shell.component.css']
})
export class AmbulatoryShellComponent {
}

