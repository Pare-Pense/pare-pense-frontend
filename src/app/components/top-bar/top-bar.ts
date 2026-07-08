import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBell, LucideUser } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { ModalNotificacoes } from '../modal-notificacoes/modal-notificacoes';

@Component({
  selector: 'app-top-bar',
  imports: [ButtonModule, RouterLink, LucideBell, LucideUser, ModalNotificacoes],
  templateUrl: './top-bar.html',
})
export class TopBar {
  public title = input.required<string>();
  modalNotifs = signal(false);
}
