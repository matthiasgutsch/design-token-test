import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './ui-library/button/button.component';
import { CardComponent } from './ui-library/card/card.component';
import { IconComponent } from './ui-library/icon/icon.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, CardComponent, ButtonComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'token-test';
}
