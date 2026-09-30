import { Component, output, signal } from '@angular/core';
import {
  LucideCircleDollarSign,
  LucideFileUp,
  LucidePlus,
  LucideReceiptText,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-dashboard-acao-btn',
  imports: [
    ButtonModule,
    LucidePlus,
    PopoverModule,
    LucideReceiptText,
    LucideCircleDollarSign,
    LucideFileUp,
  ],
  templateUrl: './dashboard-acao-btn.html',
  styleUrl: './dashboard-acao-btn.css',
})
export class DashboardAcaoBtn {
  protected isOpen = signal(false);
  public opcao = output<string>();

  onToggle() {
    this.isOpen.set(!this.isOpen());
  }

  onPress(name: string) {
    this.opcao.emit(name);
    this.isOpen.set(false);
  }
}
