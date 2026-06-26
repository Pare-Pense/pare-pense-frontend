import { Component, inject, input, model, signal } from '@angular/core';
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
import { Categoria, DespesaService } from '../../../services/despesa-service';
import { AuthService } from '../../../auth/auth-service';
import { ReceitaService } from '../../../services/receita-service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { QueryClient } from '@tanstack/angular-query-experimental';

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
  ],
  templateUrl: 'modal-despesa.html',
})
export class ModalDespesa {
  private authService = inject(AuthService);
  private despesaService = inject(DespesaService);
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
  protected valValor?: number;

  protected onDialogHide() {
    this.valNome = undefined;
    this.valCategoria = undefined;
    this.valData = undefined;
    this.valValor = undefined;
    this.isDespesa.set(true);
  }

  protected onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const transacao = {
      nome: this.valNome!,
      categoria: this.isDespesa() ? this.stringToCategoria(this.valCategoria!) : undefined,
      data: this.valData!,
      valor: this.valValor!,
      idUsuario: this.authService.getUsuarioId()!,
    };

    this.loading.set(true);

    if (this.isDespesa()) {
      this.despesaService.cadastrarDespesa(transacao).subscribe({
        next: () => {
          this.loading.set(false);
          alert('Despesa cadastrada com sucesso!');
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
          alert('Receita cadastrada com sucesso!');
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

  private invalidar() {
    this.queryClient.invalidateQueries({ queryKey: ['usuario', 'sumario'] });
    if (this.isDespesa()) {
      this.queryClient.invalidateQueries({ queryKey: ['despesas'] });
    } else {
      this.queryClient.invalidateQueries({ queryKey: ['receitas'] });
    }
  }
}
