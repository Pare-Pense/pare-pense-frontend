import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideDollarSign, LucidePencil, LucideRepeat, LucideTrash2 } from '@lucide/angular';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { ConfirmationService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth-service';
import { IconCategoria } from '../../components/icon-categoria/icon-categoria';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { TopBar } from '../../components/top-bar/top-bar';
import { Despesa, DespesaService } from '../../services/despesa-service';
import { injectQueryCategorias, nomeExibicaoCategoria } from '../../services/categoria-service';
import { Receita, ReceitaService } from '../../services/receita-service';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { ModalDespesa } from '../../components/modal-despesa/modal-despesa';

type Periodo = 'todos' | 'semanal' | 'mensal' | 'anual';
// id da categoria ou 'TODAS'
type CategoriaFiltro = string;

@Component({
  selector: 'app-financas-page',
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
    LucideDollarSign,
    LucideRepeat,
    RouterLink,
  ],
  templateUrl: './financas-page.html',
  styleUrl: './financas-page.css',
  providers: [ConfirmationService],
})
export class FinancasPage implements OnInit {
  private despesaService = inject(DespesaService);
  private receitaService = inject(ReceitaService);
  private authService = inject(AuthService);
  private queryClient = inject(QueryClient);
  private confirmationService = inject(ConfirmationService);
  private route = inject(ActivatedRoute);

  readonly isDespesa: boolean = this.route.snapshot.data['isDespesa'] ?? true;

  periodoSelecionado = signal<Periodo>('todos');
  categoriaSelecionada = signal<CategoriaFiltro>('TODAS');

  modalVisible = signal(false);

  despesaEdit?: Despesa;
  receitaEdit?: Receita;

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    let paramCategoria = params['idCategoria'];
    let paramPeriodo = params['periodo'];
    if (typeof paramCategoria === 'string' && paramCategoria) {
      this.categoriaSelecionada.set(paramCategoria);
    }
    if (['todas', 'semanal', 'mensal', 'anual'].includes(paramPeriodo)) {
      this.periodoSelecionado.set(paramPeriodo);
    }
  }

  queryCategorias = injectQueryCategorias();

  readonly categorias = computed(() => [
    { label: 'Todas', value: 'TODAS' },
    ...(this.queryCategorias.data() ?? []).map((c) => ({
      label: nomeExibicaoCategoria(c.nome),
      value: c.id,
    })),
  ]);

  constructor() {
    effect(() => {
      const categorias = this.queryCategorias.data();
      const selecionada = untracked(() => this.categoriaSelecionada());
      if (categorias && selecionada !== 'TODAS' && !categorias.some((c) => c.id === selecionada)) {
        this.categoriaSelecionada.set('TODAS');
      }
    });
  }

  readonly periodos = [
    { label: 'Todos', value: 'todos' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensal', value: 'mensal' },
    { label: 'Anual', value: 'anual' },
  ];

  // requisições despesa
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
      enabled: this.isDespesa && !!idUsuario,
    };
  });

  deleteDespesaMutation = injectMutation(() => ({
    mutationFn: (idDespesa: string) =>
      lastValueFrom(
        this.despesaService.deletarDespesa(this.authService.getUsuarioId()!, idDespesa),
      ),

    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['despesas'] });
    },
  }));

  // requisições receita
  queryReceitas = injectQuery(() => {
    const idUsuario = this.authService.getUsuarioId();
    const periodo = this.periodoSelecionado();

    return {
      queryKey: ['receitas', idUsuario, periodo],
      queryFn: () =>
        lastValueFrom(
          this.receitaService.recuperarReceitasAll(
            idUsuario!,
            periodo === 'todos' ? undefined : periodo,
          ),
        ),
      enabled: !this.isDespesa && !!idUsuario,
    };
  });

  deleteReceitaMutation = injectMutation(() => ({
    mutationFn: (idReceita: string) =>
      lastValueFrom(
        this.receitaService.deletarReceita(this.authService.getUsuarioId()!, idReceita),
      ),

    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['receitas'] });
    },
  }));

  items: Signal<(Despesa | Receita)[]> = computed(() =>
    this.isDespesa ? (this.queryDespesas.data() ?? []) : (this.queryReceitas.data() ?? []),
  );
  isPending = computed(() =>
    this.isDespesa ? this.queryDespesas.isPending() : this.queryReceitas.isPending(),
  );

  excluirItem(idItem: string) {
    const idUsuario = this.authService.getUsuarioId();

    if (!idUsuario) return;

    this.confirmationService.confirm({
      header: 'Alerta',
      message: `Tem certeza que quer deletar esta ${this.isDespesa ? 'despesa' : 'receita'}?`,
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
        if (this.isDespesa) {
          this.deleteDespesaMutation.mutate(idItem);
        } else {
          this.deleteReceitaMutation.mutate(idItem);
        }
      },
    });
  }

  openEditModal(item: Despesa | Receita) {
    this.modalVisible.set(true);
    if ('categoria' in item) {
      this.despesaEdit = item;
    } else {
      this.receitaEdit = item;
    }
  }

  onModalReset() {
    this.despesaEdit = undefined;
    this.receitaEdit = undefined;
  }

  formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  // montagem do gráfico
  chartData = computed(() => {
    const items = this.items();
    const periodo = this.periodoSelecionado();
    const idCategoria = this.isDespesa ? this.categoriaSelecionada() : 'TODAS';
    const categoria =
      idCategoria === 'TODAS'
        ? 'TODAS'
        : (this.queryCategorias.data()?.find((c) => c.id === idCategoria)?.nome ?? 'TODAS');
    return agruparChartData(this.isDespesa, items, periodo, categoria);
  });

  readonly chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: this.isDespesa,
        position: 'top',
      },
      title: {
        display: true,
        text: this.isDespesa ? 'Evolução das despesas' : 'Evolução das receitas',
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
          text: this.isDespesa ? 'Total gasto (R$)' : 'Total recebido (R$)',
        },
        beginAtZero: true,
      },
    },
  };
}

function agruparChartData(
  isDespesa: boolean,
  items: (Despesa | Receita)[],
  periodo: Periodo,
  categoria: string,
) {
  const labelsSet = new Set<string>();
  const agrupado = new Map<string, Map<string, number>>();

  for (const item of items) {
    const data = new Date(item.data);
    let key = '';

    if (periodo === 'todos') {
      // agrupa pelo ano
      key = data.getFullYear().toString();
    } else if (periodo === 'semanal') {
      // agrupa pelo dia e mes
      key = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    } else if (periodo === 'mensal') {
      // agrupa pela semana do mes
      const dia = data.getDate();

      if (dia <= 7) key = 'Semana 1';
      else if (dia <= 14) key = 'Semana 2';
      else if (dia <= 21) key = 'Semana 3';
      else if (dia <= 28) key = 'Semana 4';
      else key = 'Semana 5';
    } else if (periodo === 'anual') {
      // agrupa por mes
      key = data.toLocaleString('pt-BR', {
        month: 'short',
      });
    }

    labelsSet.add(key);
    const itemCat = 'categoria' in item ? item.categoria : 'OUTROS';

    if (!agrupado.has(itemCat)) {
      agrupado.set(itemCat, new Map());
    }

    const mapaCategoria = agrupado.get(itemCat)!;

    mapaCategoria.set(key, (mapaCategoria.get(key) ?? 0) + Number(item.valor));
  }

  const labels = Array.from(labelsSet);

  if (isDespesa && categoria === 'TODAS') {
    const datasets = Array.from(agrupado.entries()).map(([categoria, valores]) => ({
      label: nomeExibicaoCategoria(categoria),
      data: labels.map((label) => valores.get(label) ?? 0),
      tension: 0.4,
    }));

    return {
      labels,
      datasets,
    };
  } else {
    const valores = isDespesa ? agrupado.get(categoria) : agrupado.get('OUTROS');

    return {
      labels,
      datasets: [
        {
          label: isDespesa ? nomeExibicaoCategoria(categoria) : 'Receitas',
          data: labels.map((label) => valores?.get(label) ?? 0),
          tension: 0.4,
        },
      ],
    };
  }
}
