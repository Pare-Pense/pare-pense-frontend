import { Component, computed, inject, signal } from '@angular/core';
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
import { Receita, ReceitaService } from '../../services/receita-service';
import { AuthService } from '../../auth/auth-service';
import { injectMutation, injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

type Periodo = 'semanal' | 'mensal' | 'anual';

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
export class IncomesPage{

  private receitaService = inject(ReceitaService);
  private authService = inject(AuthService);
  protected modalReceitaVisible = signal(false);
  public isEditMode = false;
  protected isDespesa = signal(true);
  private queryClient = injectQueryClient();
  periodoSelecionado = signal<Periodo>('semanal');

  periodos = [
    { label: 'Nos últimos 7 dias', value: 'semanal' },
    { label: 'No último mês', value: 'mensal' },
    { label: 'No último ano', value: 'anual' },
  ];

  queryReceitas = injectQuery(() => {
  const idUsuario = this.authService.getUsuarioId();
  const periodo = this.periodoSelecionado();

  return {
    queryKey: ['receitas', idUsuario, periodo],
    queryFn: () =>
      lastValueFrom(
        this.receitaService.recuperarReceitasPorPeriodo(
          idUsuario!,
          periodo === 'semanal'
            ? 'semanal'
            : periodo === 'mensal'
            ? 'mensal'
            : 'anual'
        )
      ),
    enabled: !!idUsuario,
    };
  });

  receitas = computed(() => this.queryReceitas.data() ?? []);

  deleteReceitaMutation = injectMutation(() => ({
  mutationFn: ({ idUsuario, idReceita }: { idUsuario: string; idReceita: string }) =>
    lastValueFrom(
      this.receitaService.deletarReceita(idUsuario, idReceita)
    ),

    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['receitas'] });
    },
  }));

  excluirReceita(idReceita: string) {
    const idUsuario = this.authService.getUsuarioId();

    if (!idUsuario) return;

    this.deleteReceitaMutation.mutate({
      idUsuario,
      idReceita
    });
  }

  graficoAtual = computed(() => {
    const receitas = this.receitas();

    const agrupado = new Map<string, number>();

    receitas.forEach(r => {
      const data = new Date(r.data);

      const key = data.toISOString().split('T')[0]; 

      agrupado.set(
        key,
        (agrupado.get(key) || 0) + Number(r.valor)
      );
    });

    const series = Array.from(agrupado.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));

    return [
      {
        name: 'Receitas',
        series
      }
    ];
  });

  openModalReceita() {
    this.isEditMode = true;
    this.modalReceitaVisible.set(true);
    this.isDespesa.set(false);
  }

  formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
