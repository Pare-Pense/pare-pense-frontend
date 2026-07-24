import { Component, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { FormsModule, NgForm } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LucideDollarSign } from '@lucide/angular';
import { Categoria, Despesa, DespesaService } from '../../services/despesa-service';
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
  ],
  templateUrl: 'modal-despesa.html',
})
export class ModalDespesa {
  private authService = inject(AuthService);
  private despesaService = inject(DespesaService);
  private messageService = inject(MessageService);
  private receitaService = inject(ReceitaService);
  private queryClient = inject(QueryClient);
  public loading = signal(false);
  public visible = model(false);
  protected categorias = ['Alimentação', 'Lazer', 'Transporte', 'Compras', 'Contas', 'Outros'];

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
      if (this.isEditMode()) {
        const transacao = this.isDespesa() ? this.despesaEdit() : this.receitaEdit();

        if (transacao) {
          this.dadosOriginais = { ...transacao };

          this.valNome = transacao.nome;
          this.valData = new Date(transacao.data);
          this.valHora = new Date(this.valData);
          this.valValor = transacao.valor;

          if ('categoria' in transacao) {
            this.valCategoria = this.categoriaToString(transacao.categoria as Categoria);
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

    if (this.isDespesa() && this.valCategoria !== this.dadosOriginais.categoria) {
      alterados.categoria = this.stringToCategoria(this.valCategoria!);
    }

    if (this.valData?.toISOString !== this.dadosOriginais.data) {
      alterados.data = this.valData;
    }

    return alterados;
  }

  protected onDialogHide(form: NgForm) {
    form.resetForm();
    this.isDespesa.set(true);

    if (this.isEditMode()) {
      this.reset.emit();
    }
  }

  protected onSubmit(form: NgForm) {
    if (form.invalid) {
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
        categoria: this.isDespesa() ? this.stringToCategoria(this.valCategoria!) : undefined,
        data: this.valData!,
        valor: this.valValor!,
        idUsuario: this.authService.getUsuarioId()!,
      };

      if (this.isDespesa()) {
        this.despesaService.cadastrarDespesa(transacao).subscribe({
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

  private stringToCategoria(valor: string) {
    const res = {
      Alimentação: 'ALIMENTACAO',
      Lazer: 'LAZER',
      Transporte: 'TRANSPORTE',
      Compras: 'COMPRAS',
      Contas: 'CONTAS',
      Outros: 'OUTROS',
    };

    return res[valor as keyof typeof res] as Categoria;
  }

  private categoriaToString(valor: Categoria) {
    const res = {
      ALIMENTACAO: 'Alimentação',
      LAZER: 'Lazer',
      TRANSPORTE: 'Transporte',
      COMPRAS: 'Compras',
      CONTAS: 'Contas',
      OUTROS: 'Outros',
    };

    return res[valor];
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
}
