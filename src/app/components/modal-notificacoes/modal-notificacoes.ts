import { Component, effect, inject, model } from '@angular/core';
import { LucideBell, LucideX } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FmtTimestampPipe } from '../../util/fmt-timestamp';
import { AuthService } from '../../auth/auth-service';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { NotificacaoService } from '../../services/notificacao-service';

@Component({
  selector: 'app-modal-notificacoes',
  imports: [ButtonModule, ProgressSpinnerModule, DialogModule, LucideBell, FmtTimestampPipe],
  templateUrl: './modal-notificacoes.html',
})
export class ModalNotificacoes {
  private authService = inject(AuthService);
  private notificacaoService = inject(NotificacaoService);
  public visible = model(false);
  private queryClient = inject(QueryClient);

  queryNotificacoes = injectQuery(() => ({
    queryKey: ['notificacoes', this.authService.getUsuarioId()],
    queryFn: () =>
      lastValueFrom(this.notificacaoService.getNotificacoes(this.authService.getUsuarioId()!)),
    enabled: this.visible(),
  }));

  constructor() {
    effect(() => {
      if (this.queryNotificacoes.data()) {
        this.notificacaoService.marcarNotificacoesLida(this.authService.getUsuarioId()!).subscribe({
          next: () => {
            setTimeout(() => {
              this.queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
            }, 3000);
          },
        });
      }
    });
  }
}
