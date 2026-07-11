import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBell, LucideUser } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { ModalNotificacoes } from '../modal-notificacoes/modal-notificacoes';
import { AuthService } from '../../auth/auth-service';
import { NotificacaoService } from '../../services/notificacao-service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-top-bar',
  imports: [ButtonModule, RouterLink, LucideBell, LucideUser, ModalNotificacoes],
  templateUrl: './top-bar.html',
})
export class TopBar {
  private authService = inject(AuthService);
  private notificacaoService = inject(NotificacaoService);

  public title = input.required<string>();
  modalNotifs = signal(false);

  queryNotif = injectQuery(() => ({
    queryKey: ['notificacoes', this.authService.getUsuarioId(), 'count'],
    queryFn: () =>
      lastValueFrom(this.notificacaoService.getNotificacaoCount(this.authService.getUsuarioId()!)),
  }));
}
