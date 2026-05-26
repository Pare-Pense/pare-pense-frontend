import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SpeedDialModule } from 'primeng/speeddial';
import { LucideUser, LucideBell, LucideTrendingUp, LucidePizza } from '@lucide/angular';

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
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {}
