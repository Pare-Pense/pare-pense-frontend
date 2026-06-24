import { Component, input } from '@angular/core';
import { NavBottomButton } from './button';

@Component({
  selector: 'app-nav-bottom',
  imports: [NavBottomButton],
  templateUrl: './nav-bottom.html',
})
export class NavBottom {
  public active = input.required<'home' | 'despesas' | 'receitas'>();
}
