import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LucidePencil, LucideTrash2 } from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ModalDespesa } from '../dashboard-page/modal-despesa/modal-despesa';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import {
  Categoria,
  CATEGORIA_NOMES,
  Despesa,
  DespesaService,
} from '../../services/despesa-service';
import { AuthService } from '../../auth/auth-service';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { TopBar } from '../../components/top-bar/top-bar';
import { ActivatedRoute } from '@angular/router';
import { IconCategoria } from '../../components/icon-categoria/icon-categoria';

type Periodo = 'todos' | 'semanal' | 'mensal' | 'anual';
type CategoriaFiltro = Categoria | 'TODAS';

@Component({
  selector: 'app-finances-page',
  imports: [
    TabsModule,
    AvatarModule,
    ButtonModule,
    ProgressBarModule,
    FmtRealPipe,
    ProgressSpinnerModule,
    NavBottom,
    ChartModule,
    SelectModule,
    FormsModule,
    ModalDespesa,
    LucidePencil,
    LucideTrash2,
    ConfirmDialogModule,
    TopBar,
    IconCategoria,
  ],
  templateUrl: './despesas-page.html',
  styleUrl: './despesas-page.css',
  providers: [ConfirmationService],
})
export class ExpensesPage implements OnInit {
  private despesaService = inject(DespesaService);
  private authService = inject(AuthService);
  private queryClient = inject(QueryClient);
  private confirmationService = inject(ConfirmationService);
  private route = inject(ActivatedRoute);

  public isEditMode = false;
  protected isDespesa = signal(true);
  periodoSelecionado = signal<Periodo>('todos');
  categoriaSelecionada = signal<CategoriaFiltro>('TODAS');
  protected modalDespesaVisible = signal(false);

  public despesaEdit?: Despesa;

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    let paramCategoria = params['categoria'];
    let paramPeriodo = params['periodo'];
    if (Object.keys(CATEGORIA_NOMES).includes(paramCategoria)) {
      this.categoriaSelecionada.set(paramCategoria);
    }
    if (['todos', 'semanal', 'mensal', 'anual'].includes(paramPeriodo)) {
      this.periodoSelecionado.set(paramPeriodo);
    }
  }

  categorias = [
    { label: 'Todas', value: 'TODAS' as CategoriaFiltro },
    ...Object.entries(CATEGORIA_NOMES).map(([key, label]) => ({
      label,
      value: key as CategoriaFiltro,
    })),
  ];

  formatarLabel(cat: string) {
    return cat.charAt(0) + cat.slice(1).toLowerCase();
  }

  periodos = [
    { label: 'Todos', value: 'todos' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensal', value: 'mensal' },
    { label: 'Anual', value: 'anual' },
  ];

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Evolução das despesas',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Período',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Total gasto (R$)',
        },
        beginAtZero: true,
      },
    },
  };

  queryDespesas = injectQuery(() => {
    const idUsuario = this.authService.getUsuarioId();
    const categoria = this.categoriaSelecionada();
    const periodo = this.periodoSelecionado();

    return {
      queryKey: ['despesas', idUsuario, categoria, periodo],
      queryFn: () =>
        lastValueFrom(
          this.despesaService.recuperarDespesasAll(
            idUsuario!,
            periodo === 'todos' ? undefined : periodo,
            categoria === 'TODAS' ? undefined : categoria,
          ),
        ),
      enabled: !!idUsuario,
    };
  });

  deleteDespesaMutation = injectMutation(() => ({
    mutationFn: ({ idUsuario, idDespesa }: { idUsuario: string; idDespesa: string }) =>
      lastValueFrom(this.despesaService.deletarDespesa(idUsuario, idDespesa)),

    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['despesas'] });
    },
  }));

  despesas = computed(() => this.queryDespesas.data() ?? []);

  chartData = computed(() => {
    const despesas = this.despesas();
    const periodo = this.periodoSelecionado();
    const categoriaSelecionada = this.categoriaSelecionada();

    const labelsSet = new Set<string>();
    const agrupado = new Map<Categoria, Map<string, number>>();

    despesas.forEach((d) => {
      const data = new Date(d.data);
      let key = '';

      if (periodo === 'todos') {
        key = data.getFullYear().toString();
      } else if (periodo === 'semanal') {
        key = data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
      } else if (periodo === 'mensal') {
        const dia = data.getDate();

        if (dia <= 7) key = 'Semana 1';
        else if (dia <= 14) key = 'Semana 2';
        else if (dia <= 21) key = 'Semana 3';
        else if (dia <= 28) key = 'Semana 4';
        else key = 'Semana 5';
      } else if (periodo === 'anual') {
        key = data.toLocaleString('pt-BR', {
          month: 'short',
        });
      }

      labelsSet.add(key);

      if (!agrupado.has(d.categoria)) {
        agrupado.set(d.categoria, new Map());
      }

      const mapaCategoria = agrupado.get(d.categoria)!;

      mapaCategoria.set(key, (mapaCategoria.get(key) ?? 0) + Number(d.valor));
    });

    const labels = Array.from(labelsSet);

    if (categoriaSelecionada === 'TODAS') {
      const datasets = Array.from(agrupado.entries()).map(([categoria, valores]) => ({
        label: CATEGORIA_NOMES[categoria],
        data: labels.map((label) => valores.get(label) ?? 0),
        tension: 0.4,
      }));

      return {
        labels,
        datasets,
      };
    }

    const valores = agrupado.get(categoriaSelecionada);

    return {
      labels,
      datasets: [
        {
          label: CATEGORIA_NOMES[categoriaSelecionada],
          data: labels.map((label) => valores?.get(label) ?? 0),
          tension: 0.4,
        },
      ],
    };
  });

  resetDespesa() {
    this.despesaEdit = undefined;
  }

  excluirDespesa(idDespesa: string) {
    const idUsuario = this.authService.getUsuarioId();

    if (!idUsuario) return;

    this.confirmationService.confirm({
      header: 'Alerta',
      message: 'Tem certeza que quer deletar esta despesa?',
      closable: false,
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Deletar',
        severity: 'danger',
      },
      accept: () => {
        this.deleteDespesaMutation.mutate({
          idUsuario,
          idDespesa,
        });
      },
    });
  }

  openModalDespesa(despesa: Despesa) {
    this.isEditMode = true;
    this.modalDespesaVisible.set(true);
    this.despesaEdit = despesa;
  }

  formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
