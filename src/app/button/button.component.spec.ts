import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { assertAllRootTokensMatchTokensFile } from '../../test-utils/design-token-assert';

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

  describe(':root matches all tokens', () => {
    it('every token is present and equal in CSS', () => {
      assertAllRootTokensMatchTokensFile(); // validates ALL token groups/types
    });
  });
});
