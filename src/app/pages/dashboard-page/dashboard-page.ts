import { Component, computed, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LucideUser, LucideBell, LucidePizza, LucidePlus } from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { DespesaService } from '../../services/despesa-service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { RouterLink } from '@angular/router';
import { ModalDespesa } from './modal-despesa/modal-despesa';
import { AuthService } from '../../auth/auth-service';
import { UsuarioService } from '../../services/usuario-service';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    TabsModule,
    AvatarModule,
    LucideUser,
    LucideBell,
    LucidePizza,
    LucidePlus,
    ButtonModule,
    ProgressBarModule,
    FmtRealPipe,
    ProgressSpinnerModule,
    NavBottom,
    RouterLink,
    ModalDespesa,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private despesaService = inject(DespesaService);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);

  querySumario = injectQuery(() => ({
    queryKey: ['usuario', 'sumario', this.authService.getUsuarioId()],
    queryFn: () =>
      lastValueFrom(this.usuarioService.sumarioUsuario(this.authService.getUsuarioId()!)),
  }));

  protected periodoIdx = signal(1);
  protected periodoStr = computed(
    () => (['semanal', 'mensal', 'anual'] as const)[this.periodoIdx()],
  );

  queryGastos = injectQuery(() => ({
    queryKey: ['despesas', 'gastos', this.authService.getUsuarioId(), this.periodoStr()],
    queryFn: () =>
      lastValueFrom(
        this.despesaService.recuperarGastosCategoria(
          this.authService.getUsuarioId()!,
          this.periodoStr(),
        ),
      ),
    staleTime: 10000,
  }));

  protected modalDespesaVisible = signal(false);

  setPeriodoIdx(idx: number) {
    this.periodoIdx.set(idx);
  }

  openModalAddDespesa() {
    this.modalDespesaVisible.set(true);
  }
}
