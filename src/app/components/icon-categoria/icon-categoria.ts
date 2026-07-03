import { Component, computed, input } from '@angular/core';
import {
  LucideCarFront,
  LucideDynamicIcon,
  LucideLayers,
  LucideParasol,
  LucidePizza,
  LucideReceipt,
  LucideShoppingCart,
} from '@lucide/angular';

@Component({
  selector: 'app-icon-categoria',
  imports: [LucideDynamicIcon],
  templateUrl: './icon-categoria.html',
})
export class IconCategoria {
  public categoria = input.required<string>();

  protected icon = computed(() => {
    switch (this.categoria()) {
      case 'ALIMENTACAO':
        return LucidePizza;
      case 'LAZER':
        return LucideParasol;
      case 'TRANSPORTE':
        return LucideCarFront;
      case 'COMPRAS':
        return LucideShoppingCart;
      case 'CONTAS':
        return LucideReceipt;
      case 'OUTROS':
      default:
        return LucideLayers;
    }
  });
}
