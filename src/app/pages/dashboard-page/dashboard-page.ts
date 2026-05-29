import { Component, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SpeedDialModule } from 'primeng/speeddial';
import { LucideUser, LucideBell, LucideTrendingUp, LucidePizza } from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';

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
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  protected periodoIdx = signal(1);
  protected valorDespesas = signal(8300);
  protected valorReceitas = signal(500);
  protected valorLimiteMensal = signal(10000);

  setPeriodoIdx(idx: number) {
    this.periodoIdx.set(idx);
  }
}
