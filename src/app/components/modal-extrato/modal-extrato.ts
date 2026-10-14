import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LucideDollarSign, LucideScrollText, LucideUpload } from '@lucide/angular';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AuthService } from '../../auth/auth-service';
import { injectQueryCategorias, nomeExibicaoCategoria } from '../../services/categoria-service';
import {
  dataParaISODate,
  DespesaRecorrenteService,
  Frequencia,
  FREQUENCIAS,
  regraAPartirDaData,
} from '../../services/despesa-recorrente-service';
import { DespesaExtraida, DespesaService } from '../../services/despesa-service';

@Component({
  selector: 'app-modal-extrato',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    SelectModule,
    FormsModule,
    DatePickerModule,
    InputNumberModule,
    IconFieldModule,
    InputIconModule,
    LucideDollarSign,
    ProgressSpinner,
    Message,
    InputMaskModule,
    FileUploadModule,
    LucideUpload,
    LucideScrollText,
    ToggleSwitchModule,
  ],
  templateUrl: 'modal-extrato.html',
})
export class ModalExtrato {
  private authService = inject(AuthService);
  private despesaService = inject(DespesaService);
  private messageService = inject(MessageService);
  private queryClient = inject(QueryClient);
  private despesaRecorrenteService = inject(DespesaRecorrenteService);

  public visible = model(false);

  despesas = signal(null as DespesaExtraida[] | null);
  despesaIndex = signal(0);

  loading = signal(false);

  onFileSelected(event: Event) {
    let input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.loading.set(true);

    this.despesaService.importarExtrato(file).subscribe({
      next: (despesas) => {
        this.despesas.set(despesas);
        this.despesaIndex.set(0);
        this.loading.set(false);
        this.loadDespesa();
      },
      error: (err) => {
        this.loading.set(false);
        const msg: string | undefined = err?.error?.erro;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: `Erro ao importar extrato! ${msg ?? ''}`,
        });
      },
    });
  }

  protected queryCategorias = injectQueryCategorias();
  protected categorias = computed(() =>
    (this.queryCategorias.data() ?? []).map((c) => ({
      label: nomeExibicaoCategoria(c.nome),
      value: c.id,
    })),
  );

  protected readonly frequencias = FREQUENCIAS;
  protected valDeveRepetir = signal(false);
  protected valFrequencia: Frequencia = 'MENSAL';
  protected valDataFim?: Date;

  protected valNome?: string;
  protected valExtra?: string;
  protected valCategoria?: string;
  protected valData?: Date;
  protected valHora?: Date;
  protected valValor?: number;

  loadDespesa() {
    let despesa = this.despesas()![this.despesaIndex()];
    if (despesa === undefined) return;
    this.valValor = despesa.valor;
    this.valData = new Date(despesa.data.split('T')[0].replaceAll('-', '/'));
    this.valExtra = despesa.extra;
    this.valDeveRepetir.set(false);
    this.valFrequencia = 'MENSAL';

    let hora = 12;
    let minuto = 0;
    // as vezes o extra contem a hora exata
    let match = despesa.extra?.match(/\b(\d\d):(\d\d)\b/);
    if (match) {
      hora = parseInt(match[1]);
      minuto = parseInt(match[2]);
    }
    this.valHora = this.valData;
    this.valHora.setHours(hora);
    this.valHora.setMinutes(minuto);
  }

  nextDespesa() {
    const despesas = this.despesas();
    if (!despesas) return;
    if (this.despesaIndex() == despesas.length - 1) {
      this.visible.set(false);
      return;
    }
    this.despesaIndex.set(this.despesaIndex() + 1);
    this.loadDespesa();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.loading.set(true);
    this.valData?.setHours(this.valHora?.getHours()!, this.valHora?.getMinutes());

    const transacao = {
      nome: this.valNome!,
      idCategoria: this.valCategoria!,
      data: this.valData!,
      valor: this.valValor!,
      idUsuario: this.authService.getUsuarioId()!,
    };

    const onNext = () => {
      this.loading.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Despesa cadastrada com sucesso!',
      });
      form.resetForm();
      this.invalidar();
      this.nextDespesa();
    };

    const onError = (err: any) => {
      this.loading.set(false);
      const msg: string | undefined = err?.error?.erro;
      if (msg === 'Dados inválidos') {
        for (const detail of err.error.detalhes) {
          if (form.controls[detail.campo]) {
            form.controls[detail.campo].setErrors({ custom: detail.mensagem });
          }
        }
      }
      console.error('Erro ao cadastrar despesa!', msg);
    };

    if (!this.valDeveRepetir()) {
      this.despesaService.cadastrarDespesa(transacao).subscribe({
        next: onNext,
        error: onError,
      });
    } else {
      this.despesaRecorrenteService
        .cadastrarDespesaRecorrente({
          ...transacao,
          ...regraAPartirDaData(this.valFrequencia, this.valData!),
          dataInicio: dataParaISODate(this.valData!),
          ...(this.valDataFim && { dataFim: dataParaISODate(this.valDataFim) }),
        })
        .subscribe({
          next: onNext,
          error: onError,
        });
    }
  }

  private invalidar() {
    this.queryClient.invalidateQueries({ queryKey: ['usuario', 'sumario'] });
    this.queryClient.invalidateQueries({ queryKey: ['despesas'] });
    setTimeout(() => {
      this.queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    }, 1000);
  }

  onDialogHide() {
    this.valNome = undefined;
    this.valCategoria = undefined;
    this.valData = undefined;
    this.valHora = undefined;
    this.valValor = undefined;
    this.valDataFim = undefined;
    this.valFrequencia = 'MENSAL';
    this.valDeveRepetir.set(false);
    this.despesas.set(null);
    this.loading.set(false);
  }

  onPular() {
    this.nextDespesa();
  }
}
