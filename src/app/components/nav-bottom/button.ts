import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideHouse,
  LucideDynamicIcon,
  LucideReceiptText,
  LucideCircleDollarSign,
} from '@lucide/angular';

@Component({
  selector: 'app-nav-bottom-button',
  imports: [LucideDynamicIcon],
  templateUrl: 'button.html',
})
export class NavBottomButton {
  public checked = input(false);
  public icon = input.required<'home' | 'despesas' | 'receitas'>();
  public url = input.required<string>();
  private router = inject(Router);

  protected iconProp = computed(() => {
    switch (this.icon()) {
      case 'home':
        return LucideHouse;
      case 'despesas':
        return LucideReceiptText;
      case 'receitas':
        return LucideCircleDollarSign;
    }
  });

  onClick() {
    this.router.navigateByUrl(this.url());
  }
}
