import { Component, computed, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SpeedDialModule } from 'primeng/speeddial';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LucideUser, LucideBell, LucideTrendingUp, LucidePizza } from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { DespesaService } from '../../services/despesa-service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    TabsModule,
    AvatarModule,
    LucideUser,
    LucideBell,
    ButtonModule,
    ProgressBarModule,
    LucideTrendingUp,
    LucidePizza,
    SpeedDialModule,
    FmtRealPipe,
    ProgressSpinnerModule,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private despesaService = inject(DespesaService);

  queryDespesas = injectQuery(() => ({
    queryKey: ['despesas', 'mes'],
    queryFn: () => lastValueFrom(this.despesaService.recuperarDespesasPeriodo('123-id', 'mes')),
  }));

  protected periodoIdx = signal(1);
  protected valorReceitas = signal(500);
  protected valorLimiteMensal = signal(10000);
  protected valorDespesas = computed(() =>
    (this.queryDespesas.data() ?? []).map((x) => x.valor).reduce((a, b) => a + b, 0),
  );

  setPeriodoIdx(idx: number) {
    this.periodoIdx.set(idx);
  }
}
