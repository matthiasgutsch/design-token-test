import { Component, EventEmitter, Output, signal, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  imports: [IconComponent, CommonModule],
  standalone: true,
})
export class ButtonComponent {
  title = input<string>('');
  icon = input<string>('');
  type = input<'primary' | 'secondary'>('primary');
  iconPosition = input<'left' | 'right'>('left');
  disabled = input<boolean>(false);

  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
