import { Component, inject, model } from '@angular/core';
import { LucideBell } from '@lucide/angular';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth-service';
import { NotificacaoService } from '../../services/notificacao-service';
import { FmtTimestampPipe } from '../../util/fmt-timestamp';

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

  mutationNotif = injectMutation(() => ({
    mutationFn: () =>
      lastValueFrom(
        this.notificacaoService.marcarNotificacoesLida(this.authService.getUsuarioId()!),
      ),
    onSuccess: () => {
      setTimeout(() => {
        this.queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      }, 3000);
    },
  }));

  onShow() {
    // esperar um pouco para que o usuario pelo menos possa
    // ver quais são as novas notificações
    setTimeout(() => {
      this.mutationNotif.mutate();
    }, 1000);
  }
}
