import { Component, computed, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LucideUser, LucideBell, LucidePencil, LucideTrash2 } from '@lucide/angular';
import { FmtRealPipe } from '../../util/fmt-real-pipe';
import { NavBottom } from '../../components/nav-bottom/nav-bottom';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ModalDespesa } from '../dashboard-page/modal-despesa/modal-despesa';
import { Receita, ReceitaService } from '../../services/receita-service';
import { AuthService } from '../../auth/auth-service';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';

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
    ChartModule,
    SelectModule,
    FormsModule,
    ModalDespesa,
    LucidePencil,
    LucideTrash2,
    ConfirmDialogModule,
  ],
  templateUrl: './receitas-page.html',
  styleUrl: './receitas-page.css',
  providers: [ConfirmationService],
})
export class IncomesPage {
  private receitaService = inject(ReceitaService);
  private authService = inject(AuthService);
  private queryClient = inject(QueryClient);
  private confirmationService = inject(ConfirmationService);

  protected modalReceitaVisible = signal(false);
  public isEditMode = false;
  protected isDespesa = signal(false);
  periodoSelecionado = signal<Periodo>('semanal');

  public receitaEdit?: Receita;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

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
            periodo === 'semanal' ? 'semanal' : periodo === 'mensal' ? 'mensal' : 'anual',
          ),
        ),
      enabled: !!idUsuario,
    };
  });

  receitas = computed(() => this.queryReceitas.data() ?? []);

  deleteReceitaMutation = injectMutation(() => ({
    mutationFn: ({ idUsuario, idReceita }: { idUsuario: string; idReceita: string }) =>
      lastValueFrom(this.receitaService.deletarReceita(idUsuario, idReceita)),

    onSuccess: () => {
      this.queryClient.invalidateQueries({ queryKey: ['receitas'] });
    },
  }));

  resetReceita() {
    this.receitaEdit = undefined;
  }

  excluirReceita(idReceita: string) {
    const idUsuario = this.authService.getUsuarioId();

    if (!idUsuario) return;

    this.confirmationService.confirm({
      header: 'Alerta',
      message: 'Tem certeza que quer deletar esta receita?',
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
        this.deleteReceitaMutation.mutate({
          idUsuario,
          idReceita,
        });
      },
    });
  }

  chartData = computed(() => {
    const receitas = this.receitas();
    const periodo = this.periodoSelecionado();

    const agrupado = new Map<string, number>();

    receitas.forEach((r) => {
      const data = new Date(r.data);
      let key = '';

      if (periodo === 'semanal') {
        key = data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
      }

      if (periodo === 'mensal') {
        const dia = data.getDate();

        if (dia <= 7) key = 'Semana 1';
        else if (dia <= 14) key = 'Semana 2';
        else if (dia <= 21) key = 'Semana 3';
        else if (dia <= 28) key = 'Semana 4';
        else key = 'Semana 5';
      }

      if (periodo === 'anual') {
        key = data.toLocaleString('pt-BR', {
          month: 'short',
        });
      }

      agrupado.set(key, (agrupado.get(key) || 0) + Number(r.valor));
    });

    const labels = Array.from(agrupado.keys());
    const values = Array.from(agrupado.values());

    return {
      labels,
      datasets: [
        {
          label: 'Receitas',
          data: values,
          tension: 0.4,
        },
      ],
    };
  });

  openModalReceita(receita: Receita) {
    this.isEditMode = true;
    this.modalReceitaVisible.set(true);
    this.isDespesa.set(false);
    this.receitaEdit = receita;
  }

  formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}
