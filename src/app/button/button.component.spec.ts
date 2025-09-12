import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import {
  assertAllScssUsagesMatchTokens,
  assertScssComponentMatchesTokens,
} from '../../test-utils/design-token-assert';
import path from 'path';

describe('ButtonComponent (with TestBed)', () => {
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonComponent],
    });
    fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
  });

  it('should apply the correct CSS class', () => {
    const button: HTMLElement = fixture.nativeElement.querySelector('button')!;
    expect(button.classList).toContain('app-button');
  });

  describe('SCSS design token compliance', () => {
    it('should only use valid design tokens', () => {
      const scssFile = path.resolve(__dirname, 'button.component.scss');
      assertScssComponentMatchesTokens(scssFile);
    });
  });

  describe(':root matches all tokens', () => {
    it('every token is present and equal in CSS', () => {
      assertAllScssUsagesMatchTokens();
    });
  });
});
