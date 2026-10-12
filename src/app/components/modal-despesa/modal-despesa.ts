import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { AbstractControl, FormsModule, NgForm } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideDollarSign } from '@lucide/angular';
import { Despesa, DespesaService } from '../../services/despesa-service';
import { injectQueryCategorias, nomeExibicaoCategoria } from '../../services/categoria-service';
import {
  dataParaISODate,
  DespesaRecorrenteService,
  Frequencia,
  FREQUENCIAS,
  regraAPartirDaData,
} from '../../services/despesa-recorrente-service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { Receita, ReceitaService } from '../../services/receita-service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { Message } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
  selector: 'app-modal-despesa',
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
    ToggleSwitchModule,
  ],
  templateUrl: 'modal-despesa.html',
})
export class ModalDespesa {
  private authService = inject(AuthService);
  private despesaService = inject(DespesaService);
  private messageService = inject(MessageService);
  private receitaService = inject(ReceitaService);
  private despesaRecorrenteService = inject(DespesaRecorrenteService);
  private queryClient = inject(QueryClient);
  private router = inject(Router);
  public loading = signal(false);
  public visible = model(false);

  protected queryCategorias = injectQueryCategorias();
  protected categorias = computed(() =>
    (this.queryCategorias.data() ?? []).map((c) => ({
      label: nomeExibicaoCategoria(c.nome),
      value: c.id,
    })),
  );

  public repetirInicial = input(false);
  protected repetir = signal(false);
  protected readonly frequencias = FREQUENCIAS;
  protected valFrequencia: Frequencia = 'MENSAL';
  protected valDataFim?: Date;

  public isDespesa = model(true);
  isEditMode = input(false);
  protected valNome?: string;
  protected valCategoria?: string;
  protected valData?: Date;
  protected valHora?: Date;
  protected valValor?: number;

  public despesaEdit = input<Despesa>();
  public receitaEdit = input<Receita>();
  public dadosOriginais: any = null;
  public reset = output<void>();

  protected transacaoForm = viewChild.required<NgForm>('transacaoForm');

  constructor() {
    effect(() => {
      if (this.visible() && !this.isEditMode()) {
        this.repetir.set(this.repetirInicial());
      }
    });

    effect(() => {
      if (this.isEditMode()) {
        const transacao = this.isDespesa() ? this.despesaEdit() : this.receitaEdit();

        if (transacao) {
          this.dadosOriginais = { ...transacao };

          this.valNome = transacao.nome;
          this.valData = new Date(transacao.data);
          this.valHora = new Date(this.valData);
          this.valValor = transacao.valor;

          if ('idCategoria' in transacao) {
            this.valCategoria = (transacao as Despesa).idCategoria;
          }
        }
      }
    });
  }

  private checarAlteracoes() {
    const alterados: any = {};

    if (this.valNome !== this.dadosOriginais.nome) {
      alterados.nome = this.valNome;
    }

    if (this.valValor !== this.dadosOriginais.valor) {
      alterados.valor = this.valValor;
    }

    if (this.isDespesa() && this.valCategoria !== this.dadosOriginais.idCategoria) {
      alterados.idCategoria = this.valCategoria;
    }

    if (this.valData?.toISOString !== this.dadosOriginais.data) {
      alterados.data = this.valData;
    }

    return alterados;
  }

  protected onDialogHide(form: NgForm) {
    form.resetForm();
    this.isDespesa.set(true);
    this.repetir.set(false);
    this.valFrequencia = 'MENSAL';

    if (this.isEditMode()) {
      this.reset.emit();
    }
  }

  protected onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.isDespesa() && this.repetir() && !this.isEditMode()) {
      this.cadastrarRecorrente(form);
      return;
    }

    this.loading.set(true);
    if (this.isDespesa()) {
      this.valData?.setHours(this.valHora?.getHours()!, this.valHora?.getMinutes());
    } else {
      this.valData?.setHours(12, 0);
    }

    if (this.isEditMode()) {
      const transacao = this.checarAlteracoes();

      if (this.isDespesa()) {
        this.despesaService
          .atualizarDespesa(transacao, this.authService.getUsuarioId()!, this.dadosOriginais.id)
          .subscribe({
            next: () => {
              this.loading.set(false);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Despesa atualizada com sucesso!',
              });
              this.visible.set(false);
              form.resetForm();
              this.invalidar();
            },

            error: (err) => {
              this.loading.set(false);
              const msg: string | undefined = err?.error?.erro;
              if (msg === 'Dados inválidos') {
                for (const detail of err.error.detalhes) {
                  if (form.controls[detail.campo]) {
                    form.controls[detail.campo].setErrors({ custom: detail.mensagem });
                  }
                }
              }
              console.error('Erro ao atualizar despesa!', msg);
            },
          });
      } else {
        this.receitaService
          .atualizarReceita(transacao, this.authService.getUsuarioId()!, this.dadosOriginais.id)
          .subscribe({
            next: () => {
              this.loading.set(false);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Receita atualizada com sucesso!',
              });
              this.visible.set(false);
              form.resetForm();
              this.invalidar();
            },

            error: (err) => {
              this.loading.set(false);
              const msg: string | undefined = err?.error?.erro;
              if (msg === 'Dados inválidos') {
                for (const detail of err.error.detalhes) {
                  if (form.controls[detail.campo]) {
                    form.controls[detail.campo].setErrors({ custom: detail.mensagem });
                  }
                }
              }
              console.error('Erro ao atualizar receita!', msg);
            },
          });
      }
    } else {
      const transacao = {
        nome: this.valNome!,
        data: this.valData!,
        valor: this.valValor!,
        idUsuario: this.authService.getUsuarioId()!,
      };

      if (this.isDespesa()) {
        this.despesaService
          .cadastrarDespesa({ ...transacao, idCategoria: this.valCategoria! })
          .subscribe({
            next: () => {
              this.loading.set(false);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Despesa cadastrada com sucesso!',
              });
              this.visible.set(false);
              form.resetForm();
              this.invalidar();
            },

            error: (err) => {
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
            },
          });
      } else {
        this.receitaService.cadastrarReceita(transacao).subscribe({
          next: () => {
            this.loading.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Receita cadastrada com sucesso!',
            });
            this.visible.set(false);
            form.resetForm();
            this.invalidar();
          },

          error: (err) => {
            this.loading.set(false);
            const msg: string | undefined = err?.error?.erro;
            if (msg === 'Dados inválidos') {
              for (const detail of err.error.detalhes) {
                if (form.controls[detail.campo]) {
                  form.controls[detail.campo].setErrors({ custom: detail.mensagem });
                }
              }
            }
            console.error('Erro ao cadastrar receita!', msg);
          },
        });
      }
    }
  }

  private cadastrarRecorrente(form: NgForm) {
    this.loading.set(true);

    this.despesaRecorrenteService
      .cadastrarDespesaRecorrente({
        nome: this.valNome!,
        idCategoria: this.valCategoria!,
        valor: this.valValor!,
        idUsuario: this.authService.getUsuarioId()!,
        ...regraAPartirDaData(this.valFrequencia, this.valData!),
        dataInicio: dataParaISODate(this.valData!),
        ...(this.valDataFim && { dataFim: dataParaISODate(this.valDataFim) }),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Despesa recorrente cadastrada com sucesso!',
          });
          this.visible.set(false);
          form.resetForm();
          this.queryClient.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
          this.invalidar();
        },

        error: (err) => {
          this.loading.set(false);
          const msg: string | undefined = err?.error?.erro;
          if (msg === 'Dados inválidos') {
            const campos: Record<string, string> = { dataInicio: 'data', dataFim: 'dataFim' };
            for (const detail of err.error.detalhes) {
              const campo = campos[detail.campo] ?? detail.campo;
              if (form.controls[campo]) {
                form.controls[campo].setErrors({ custom: detail.mensagem });
              }
            }
          } else if (msg) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: msg });
          }
          console.error('Erro ao cadastrar despesa recorrente!', msg);
        },
      });
  }

  protected gerenciarCategorias() {
    this.visible.set(false);
    this.router.navigate(['categorias']);
  }

  private invalidar() {
    this.queryClient.invalidateQueries({ queryKey: ['usuario', 'sumario'] });
    if (this.isDespesa()) {
      this.queryClient.invalidateQueries({ queryKey: ['despesas'] });
      setTimeout(() => {
        this.queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
      }, 1000);
    } else {
      this.queryClient.invalidateQueries({ queryKey: ['receitas'] });
    }
  }

  protected get horaRef() {
    return this.transacaoForm()?.controls?.['hora'];
  }

  protected get dataFimRef(): AbstractControl | undefined {
    return this.transacaoForm()?.controls?.['dataFim'];
  }
}
