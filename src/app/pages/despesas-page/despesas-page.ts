import { Component, computed, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  LucideUser,
  LucideBell,
  LucideTrendingUp,
  LucidePizza,
  LucidePlus,
  LucidePencil,
  LucideTrash2,
} from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { LineChartModule } from '@swimlane/ngx-charts';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ModalDespesa } from '../dashboard-page/modal-despesa/modal-despesa';

type Categoria = 'alimentacao' | 'lazer' | 'transporte';
type Periodo = 'week' | 'month' | 'year';

@Component({
  selector: 'app-finances-page',
  imports: [
    TabsModule,
    AvatarModule,
    LucideUser,
    LucideBell,
    LucidePizza,
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
  templateUrl: './despesas-page.html',
  styleUrl: './despesas-page.css',
})
export class ExpensesPage {
  categorias = [
    { label: 'Alimentação', value: 'alimentacao' },
    { label: 'Lazer', value: 'lazer' },
    { label: 'Transporte', value: 'transporte' },
  ];

  periodos = [
    { label: 'Nos últimos 7 dias', value: 'week' },
    { label: 'No último mês', value: 'month' },
    { label: 'No último ano', value: 'year' },
  ];

  despesasMockGrafico = {
    alimentacao: {
      week: [
        {
          name: 'Alimentação',
          series: [
            { name: 'Seg', value: 50 },
            { name: 'Ter', value: 80 },
            { name: 'Qua', value: 30 },
            { name: 'Qui', value: 90 },
            { name: 'Sex', value: 120 },
            { name: 'Sáb', value: 70 },
            { name: 'Dom', value: 40 },
          ],
        },
      ],
      month: [
        {
          name: 'Alimentação',
          series: [
            { name: '01/06', value: 120 },
            { name: '05/06', value: 90 },
            { name: '10/06', value: 150 },
            { name: '15/06', value: 200 },
            { name: '20/06', value: 180 },
            { name: '25/06', value: 220 },
            { name: '30/06', value: 160 },
          ],
        },
      ],
      year: [
        {
          name: 'Alimentação',
          series: [
            { name: 'Jan', value: 800 },
            { name: 'Fev', value: 900 },
            { name: 'Mar', value: 700 },
            { name: 'Abr', value: 1000 },
            { name: 'Mai', value: 850 },
            { name: 'Jun', value: 920 },
            { name: 'Jul', value: 890 },
            { name: 'Ago', value: 940 },
            { name: 'Set', value: 870 },
            { name: 'Out', value: 990 },
            { name: 'Nov', value: 950 },
            { name: 'Dez', value: 1100 },
          ],
        },
      ],
    },

    lazer: {
      week: [
        {
          name: 'Lazer',
          series: [
            { name: 'Seg', value: 20 },
            { name: 'Ter', value: 40 },
            { name: 'Qua', value: 10 },
            { name: 'Qui', value: 60 },
            { name: 'Sex', value: 90 },
            { name: 'Sáb', value: 120 },
            { name: 'Dom', value: 80 },
          ],
        },
      ],
      month: [
        {
          name: 'Lazer',
          series: [
            { name: '01/06', value: 150 },
            { name: '05/06', value: 220 },
            { name: '10/06', value: 90 },
            { name: '15/06', value: 300 },
            { name: '20/06', value: 180 },
            { name: '25/06', value: 250 },
            { name: '30/06', value: 210 },
          ],
        },
      ],
      year: [
        {
          name: 'Lazer',
          series: [
            { name: 'Jan', value: 400 },
            { name: 'Fev', value: 520 },
            { name: 'Mar', value: 350 },
            { name: 'Abr', value: 610 },
            { name: 'Mai', value: 480 },
            { name: 'Jun', value: 550 },
            { name: 'Jul', value: 600 },
            { name: 'Ago', value: 570 },
            { name: 'Set', value: 430 },
            { name: 'Out', value: 650 },
            { name: 'Nov', value: 540 },
            { name: 'Dez', value: 720 },
          ],
        },
      ],
    },

    transporte: {
      week: [
        {
          name: 'Transporte',
          series: [
            { name: 'Seg', value: 30 },
            { name: 'Ter', value: 25 },
            { name: 'Qua', value: 40 },
            { name: 'Qui', value: 35 },
            { name: 'Sex', value: 50 },
            { name: 'Sáb', value: 20 },
            { name: 'Dom', value: 15 },
          ],
        },
      ],
      month: [
        {
          name: 'Transporte',
          series: [
            { name: '01/06', value: 100 },
            { name: '05/06', value: 120 },
            { name: '10/06', value: 110 },
            { name: '15/06', value: 140 },
            { name: '20/06', value: 130 },
            { name: '25/06', value: 125 },
            { name: '30/06', value: 150 },
          ],
        },
      ],
      year: [
        {
          name: 'Transporte',
          series: [
            { name: 'Jan', value: 300 },
            { name: 'Fev', value: 280 },
            { name: 'Mar', value: 350 },
            { name: 'Abr', value: 320 },
            { name: 'Mai', value: 340 },
            { name: 'Jun', value: 360 },
            { name: 'Jul', value: 330 },
            { name: 'Ago', value: 345 },
            { name: 'Set', value: 310 },
            { name: 'Out', value: 370 },
            { name: 'Nov', value: 355 },
            { name: 'Dez', value: 390 },
          ],
        },
      ],
    },
  };

  despesasPorCategoria = signal({
    alimentacao: [
      { id: 1, nome: 'Feira', valor: 200, data: '20/06/2026' },
      { id: 2, nome: 'Compra semanal', valor: 150, data: '18/06/2026' },
      { id: 3, nome: 'Delivery', valor: 80, data: '16/06/2026' },
    ],

    lazer: [
      { id: 4, nome: 'Cinema', valor: 50, data: '19/06/2026' },
      { id: 5, nome: 'Barzinho', valor: 120, data: '17/06/2026' },
      { id: 6, nome: 'Streaming', valor: 30, data: '15/06/2026' },
    ],

    transporte: [
      { id: 7, nome: 'Uber', valor: 35, data: '20/06/2026' },
      { id: 8, nome: 'Gasolina', valor: 200, data: '18/06/2026' },
      { id: 9, nome: 'Ônibus', valor: 10, data: '16/06/2026' },
    ],
  });

  categoriaSelecionada = signal<Categoria>('alimentacao');
  periodoSelecionado = signal<Periodo>('week');

  protected valorReceitas = signal(500);
  protected modalDespesaVisible = signal(false);
  public isEditMode = false;

  graficoAtual = computed(() => {
    const categoria = this.categoriaSelecionada();
    const periodo = this.periodoSelecionado();

    return this.despesasMockGrafico[categoria][periodo] ?? [];
  });

  despesasAtuais = computed(() => {
    return this.despesasPorCategoria()[this.categoriaSelecionada()] ?? [];
  });

  excluirDespesa(id: number) {
    const categoria = this.categoriaSelecionada();

    this.despesasPorCategoria.update((state) => ({
      ...state,
      [categoria]: state[categoria].filter((d) => d.id !== id),
    }));
  }

  openModalDespesa() {
    this.isEditMode = true;
    this.modalDespesaVisible.set(true);
  }
}
