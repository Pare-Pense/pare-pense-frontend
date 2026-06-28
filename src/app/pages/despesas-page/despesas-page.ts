import { Component, computed, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LucideUser, LucideBell, LucidePizza, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { LineChartModule } from '@swimlane/ngx-charts';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ModalDespesa } from '../dashboard-page/modal-despesa/modal-despesa';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import {
  Categoria,
  CATEGORIA_NOMES,
  Despesa,
  DespesaService,
} from '../../services/despesa-service';
import { AuthService } from '../../auth/auth-service';
import { lastValueFrom } from 'rxjs';

type Periodo = 'semanal' | 'mensal' | 'anual';

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
  private despesaService = inject(DespesaService);
  private authService = inject(AuthService);
  public isEditMode = false;
  protected isDespesa = signal(true);
  private queryClient = injectQueryClient();
  periodoSelecionado = signal<Periodo>('semanal');
  categoriaSelecionada = signal<Categoria>('ALIMENTACAO');
  protected modalDespesaVisible = signal(false);

  categorias = Object.entries(CATEGORIA_NOMES).map(([key, label]) => ({
    label,
    value: key as Categoria,
  }));

  formatarLabel(cat: string) {
    return cat.charAt(0) + cat.slice(1).toLowerCase();
  }

  periodos = [
    { label: 'Nos últimos 7 dias', value: 'semanal' },
    { label: 'No último mês', value: 'mensal' },
    { label: 'No último ano', value: 'anual' },
  ];

  queryDespesas = injectQuery(() => {
    const idUsuario = this.authService.getUsuarioId();
    const categoria = this.categoriaSelecionada();
    const periodo = this.periodoSelecionado();

    return {
      queryKey: ['despesas', idUsuario, categoria, periodo],
      queryFn: () =>
        lastValueFrom(
          this.despesaService.recuperarDespesasPeriodoECategoria(idUsuario!, periodo, categoria),
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

  graficoAtual = computed(() => {
    const despesas = this.despesas();

    const agrupado = new Map<string, number>();

    for (const d of despesas) {
      const key = new Date(d.data).toISOString().split('T')[0];

      agrupado.set(key, (agrupado.get(key) || 0) + Number(d.valor));
    }

    const series = Array.from(agrupado.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));

    return [
      {
        name: this.categoriaSelecionada(),
        series,
      },
    ];
  });

  excluirDespesa(idDespesa: string) {
    const idUsuario = this.authService.getUsuarioId();

    if (!idUsuario) return;

    this.deleteDespesaMutation.mutate({
      idUsuario,
      idDespesa,
    });
  }

  openModalDespesa(despesa: Despesa) {
    this.isEditMode = true;
    this.modalDespesaVisible.set(true);
  }

  formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
