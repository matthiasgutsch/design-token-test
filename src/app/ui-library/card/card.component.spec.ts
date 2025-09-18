import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { assertAllScssUsagesMatchTokens } from '../../../test-utils/design-token-assert';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the correct CSS class', () => {
    const button: HTMLElement = fixture.nativeElement.querySelector('button')!;
    expect(button.classList).toContain('app-button');
  });

  describe(':root matches all tokens', () => {
    it('every token is present and equal in CSS', () => {
      assertAllScssUsagesMatchTokens();
    });
  });
});
