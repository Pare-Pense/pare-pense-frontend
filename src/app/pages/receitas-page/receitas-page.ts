import { Component, computed, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LucideUser, LucideBell, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { LineChartModule } from '@swimlane/ngx-charts';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ModalDespesa } from '../dashboard-page/modal-despesa/modal-despesa';

type Periodo = 'week' | 'month' | 'year';

@Component({
  selector: 'app-incomes-page',
  imports: [
    TabsModule,
    AvatarModule,
    LucideUser,
    LucideBell,
    ButtonModule,
    ProgressBarModule,
    FmtRealPipe,
    ProgressSpinnerModule,
    NavBottom,
    LineChartModule,
    SelectModule,
    FormsModule,
    ModalDespesa,
    LucidePencil,
    LucideTrash2,
  ],
  templateUrl: './receitas-page.html',
  styleUrl: './receitas-page.css',
})
export class IncomesPage {
  periodos = [
    { label: 'Nos últimos 7 dias', value: 'week' },
    { label: 'No último mês', value: 'month' },
    { label: 'No último ano', value: 'year' },
  ];

  receitasMockGrafico = {
    week: [
      {
        name: 'Receitas',
        series: [
          { name: 'Seg', value: 300 },
          { name: 'Ter', value: 450 },
          { name: 'Qua', value: 200 },
          { name: 'Qui', value: 500 },
          { name: 'Sex', value: 700 },
          { name: 'Sáb', value: 600 },
          { name: 'Dom', value: 350 },
        ],
      },
    ],

    month: [
      {
        name: 'Receitas',
        series: [
          { name: '01/06', value: 1200 },
          { name: '05/06', value: 1500 },
          { name: '10/06', value: 1800 },
          { name: '15/06', value: 1600 },
          { name: '20/06', value: 2200 },
          { name: '25/06', value: 2500 },
          { name: '30/06', value: 2000 },
        ],
      },
    ],

    year: [
      {
        name: 'Receitas',
        series: [
          { name: 'Jan', value: 8000 },
          { name: 'Fev', value: 7500 },
          { name: 'Mar', value: 9000 },
          { name: 'Abr', value: 10000 },
          { name: 'Mai', value: 9500 },
          { name: 'Jun', value: 11000 },
          { name: 'Jul', value: 10500 },
          { name: 'Ago', value: 12000 },
          { name: 'Set', value: 11500 },
          { name: 'Out', value: 13000 },
          { name: 'Nov', value: 12500 },
          { name: 'Dez', value: 14000 },
        ],
      },
    ],
  };

  receitas = [
    { id: 1, nome: 'Salário', valor: 5000, data: '20/06/2026' },
    { id: 2, nome: 'Freelance', valor: 800, data: '18/06/2026' },
    { id: 3, nome: 'Bônus', valor: 300, data: '15/06/2026' },
  ];

  periodoSelecionado = signal<Periodo>('week');

  protected modalReceitaVisible = signal(false);
  public isEditMode = false;
  protected isDespesa = signal(true);

  graficoAtual = computed(() => {
    return this.receitasMockGrafico[this.periodoSelecionado()] ?? [];
  });

  excluirReceita(id: number) {
    this.receitas = this.receitas.filter((receita) => receita.id !== id);
  }

  openModalReceita() {
    this.isEditMode = true;
    this.modalReceitaVisible.set(true);
    this.isDespesa.set(false);
  }
}
