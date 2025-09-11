import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, CardComponent, ButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'token-test';
}
