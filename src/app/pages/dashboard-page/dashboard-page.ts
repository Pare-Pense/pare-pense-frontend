import { Component, computed, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { DespesaService } from '../../services/despesa-service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { Router } from '@angular/router';
import { ModalDespesa } from '../../components/modal-despesa/modal-despesa';
import { AuthService } from '../../auth/auth-service';
import { UsuarioService } from '../../services/usuario-service';
import { DecimalPipe } from '@angular/common';
import { TopBar } from '../../components/top-bar/top-bar';
import { IconCategoria } from '../../components/icon-categoria/icon-categoria';
import { DashboardAcaoBtn } from '../../components/dashboard-acao-btn/dashboard-acao-btn';
import { ModalExtrato } from '../../components/modal-extrato/modal-extrato';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    TabsModule,
    AvatarModule,
    ButtonModule,
    ProgressBarModule,
    FmtRealPipe,
    ProgressSpinnerModule,
    NavBottom,
    ModalDespesa,
    DecimalPipe,
    TopBar,
    IconCategoria,
    DashboardAcaoBtn,
    ModalExtrato,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private despesaService = inject(DespesaService);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

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
  protected modalIsDespesa = signal(true);
  protected modalExtratoVisible = signal(false);

  clickAcao(acao: string) {
    if (acao === 'despesa') {
      this.modalIsDespesa.set(true);
      this.modalDespesaVisible.set(true);
    } else if (acao === 'receita') {
      this.modalIsDespesa.set(false);
      this.modalDespesaVisible.set(true);
    } else if (acao === 'extrato') {
      this.modalExtratoVisible.set(true);
    }
  }

  setPeriodoIdx(idx: number) {
    this.periodoIdx.set(idx);
  }

  clickCategoria(id: string) {
    this.router.navigate(['despesas'], {
      queryParams: {
        categoria: id,
        periodo: this.periodoStr(),
      },
    });
  }
}
