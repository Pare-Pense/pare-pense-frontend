import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideChevronLeft,
  LucideDollarSign,
  LucidePause,
  LucidePencil,
  LucidePlay,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth-service';
import { IconCategoria } from '../../components/icon-categoria/icon-categoria';
import { ModalDespesa } from '../../components/modal-despesa/modal-despesa';
import { injectQueryCategorias, nomeExibicaoCategoria } from '../../services/categoria-service';
import {
  AtualizarDespesaRecorrente,
  dataParaISODate,
  descreverRegra,
  DespesaRecorrente,
  DespesaRecorrenteService,
  Frequencia,
  FREQUENCIAS,
  isoDateParaData,
  regraAPartirDaData,
} from '../../services/despesa-recorrente-service';
import { FmtRealPipe } from '../../util/fmt-real-pipe';

@Component({
  selector: 'app-recorrentes-page',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    DialogModule,
    FloatLabelModule,
    FmtRealPipe,
    FormsModule,
    IconCategoria,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    LucideChevronLeft,
    LucideDollarSign,
    LucidePause,
    LucidePencil,
    LucidePlay,
    LucidePlus,
    LucideTrash2,
    MessageModule,
    ModalDespesa,
    ProgressSpinnerModule,
    RouterLink,
    SelectModule,
    TagModule,
  ],
  templateUrl: './recorrentes-page.html',
  providers: [ConfirmationService],
})
export class RecorrentesPage {
  private authService = inject(AuthService);
  private despesaRecorrenteService = inject(DespesaRecorrenteService);
  private queryClient = inject(QueryClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  protected readonly descreverRegra = descreverRegra;
  protected readonly frequencias = FREQUENCIAS;

  modalNovaVisible = signal(false);

  queryCategorias = injectQueryCategorias();
  categorias = computed(() =>
    (this.queryCategorias.data() ?? []).map((c) => ({
      label: nomeExibicaoCategoria(c.nome),
      value: c.id,
    })),
  );
  private nomePorCategoria = computed(
    () => new Map((this.queryCategorias.data() ?? []).map((c) => [c.id, c.nome])),
  );

  queryRecorrentes = injectQuery(() => {
    const idUsuario = this.authService.getUsuarioId();
    return {
      queryKey: ['despesas-recorrentes', idUsuario],
      queryFn: () =>
        lastValueFrom(this.despesaRecorrenteService.listarDespesasRecorrentes(idUsuario!)),
      enabled: !!idUsuario,
    };
  });

  popupEditar = false;
  recorrenteEdit?: DespesaRecorrente;
  valEdit = {
    nome: '',
    idCategoria: '',
    valor: 0,
    frequencia: 'MENSAL' as Frequencia,
    dataInicio: new Date(),
    dataFim: undefined as Date | undefined,
  };

  mutationAtualizar = injectMutation(() => ({
    mutationFn: ({ id, dados }: { id: string; dados: AtualizarDespesaRecorrente }) =>
      lastValueFrom(
        this.despesaRecorrenteService.atualizarDespesaRecorrente(
          dados,
          this.authService.getUsuarioId()!,
          id,
        ),
      ),
  }));

  mutationAtivacao = injectMutation(() => ({
    mutationFn: (recorrente: DespesaRecorrente) => {
      const idUsuario = this.authService.getUsuarioId()!;
      return lastValueFrom(
        recorrente.ativa
          ? this.despesaRecorrenteService.pausarDespesaRecorrente(idUsuario, recorrente.id)
          : this.despesaRecorrenteService.reativarDespesaRecorrente(idUsuario, recorrente.id),
      );
    },
  }));

  mutationDeletar = injectMutation(() => ({
    mutationFn: (id: string) =>
      lastValueFrom(
        this.despesaRecorrenteService.deletarDespesaRecorrente(
          this.authService.getUsuarioId()!,
          id,
        ),
      ),
  }));

  nomeCategoria(idCategoria: string) {
    return this.nomePorCategoria().get(idCategoria) ?? 'OUTROS';
  }

  formatarData(data: string) {
    return isoDateParaData(data).toLocaleDateString('pt-BR');
  }

  private invalidar() {
    this.queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
    this.queryClient.invalidateQueries({ queryKey: ['despesas'] });
    this.queryClient.invalidateQueries({ queryKey: ['usuario', 'sumario'] });
  }

  private mostrarErro(err: any, padrao: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: err?.error?.erro ?? padrao,
    });
  }

  alternarAtivacao(recorrente: DespesaRecorrente) {
    this.mutationAtivacao.mutate(recorrente, {
      onSuccess: () => {
        this.invalidar();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: recorrente.ativa ? 'Recorrência pausada' : 'Recorrência reativada',
        });
      },
      onError: (err) => this.mostrarErro(err, 'Erro ao alterar recorrência'),
    });
  }

  excluir(recorrente: DespesaRecorrente) {
    this.confirmationService.confirm({
      header: 'Excluir recorrência',
      message: `Tem certeza que quer excluir "${recorrente.nome}"?<br>As despesas já geradas serão mantidas.`,
      closable: false,
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Excluir',
        severity: 'danger',
      },
      accept: () => {
        this.mutationDeletar.mutate(recorrente.id, {
          onSuccess: () => {
            this.invalidar();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Recorrência excluída com sucesso!',
            });
          },
          onError: (err) => this.mostrarErro(err, 'Erro ao excluir recorrência'),
        });
      },
    });
  }

  abrirEditar(recorrente: DespesaRecorrente) {
    this.recorrenteEdit = recorrente;
    this.valEdit = {
      nome: recorrente.nome,
      idCategoria: recorrente.idCategoria,
      valor: recorrente.valor,
      frequencia: recorrente.frequencia,
      dataInicio: isoDateParaData(recorrente.dataInicio),
      dataFim: recorrente.dataFim ? isoDateParaData(recorrente.dataFim) : undefined,
    };
    this.popupEditar = true;
  }

  onSubmitEditar(form: NgForm) {
    if (form.invalid || !this.recorrenteEdit) return;

    const original = this.recorrenteEdit;
    const dataInicio = dataParaISODate(this.valEdit.dataInicio);
    const regraAlterada =
      this.valEdit.frequencia !== original.frequencia ||
      dataInicio !== original.dataInicio.split('T')[0];

    const dados: AtualizarDespesaRecorrente = {
      nome: this.valEdit.nome,
      idCategoria: this.valEdit.idCategoria,
      valor: this.valEdit.valor,
      ...(regraAlterada && {
        ...regraAPartirDaData(this.valEdit.frequencia, this.valEdit.dataInicio),
        dataInicio,
      }),
      ...(this.valEdit.dataFim && { dataFim: dataParaISODate(this.valEdit.dataFim) }),
    };

    this.mutationAtualizar.mutate(
      { id: original.id, dados },
      {
        onSuccess: () => {
          this.popupEditar = false;
          this.invalidar();
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Recorrência atualizada com sucesso!',
          });
        },
        onError: (err: any) => {
          const msg: string | undefined = err?.error?.erro;
          if (msg === 'Dados inválidos') {
            for (const detail of err.error.detalhes) {
              if (form.controls[detail.campo]) {
                form.controls[detail.campo].setErrors({ custom: detail.mensagem });
              }
            }
          } else {
            this.mostrarErro(err, 'Erro ao atualizar recorrência');
          }
        },
      },
    );
  }
}
