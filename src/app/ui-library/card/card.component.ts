import { Component, computed, HostBinding, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  public title = input<string>('name');
  public variant = input<string>('default');
  public readonly shadow = input<'none' | 'low' | 'medium' | 'high'>('none');

  public readonly shadowClass = computed(() => {
    switch (this.shadow()) {
      case 'low':
        return 'dcui-shadows-low-neutral';
      case 'medium':
        return 'dcui-shadows-medium-neutral';
      case 'high':
        return 'dcui-shadows-high-neutral';
      default:
        return '';
    }
  });

  @HostBinding('class.border')
  get hasVariante(): boolean {
    return !!this.variant();
  }
}
