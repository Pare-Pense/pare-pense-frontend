import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideChevronLeft, LucideDollarSign, LucideUser } from '@lucide/angular';
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
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth-service';
import {
  AtualizaSenhaDTO,
  AtualizaUsuarioDTO,
  UsuarioService,
} from '../../services/usuario-service';

interface UsuarioLocal {
  nome: string;
  email: string;
  rendaMensal: number;
  limiteMensal: number;
  dataNascimento: Date;
}

@Component({
  selector: 'app-perfil-page',
  imports: [
    ButtonModule,
    FloatLabelModule,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    LucideChevronLeft,
    LucideUser,
    MessageModule,
    ProgressSpinnerModule,
    RouterLink,
    IconFieldModule,
    InputIconModule,
    LucideDollarSign,
    DatePickerModule,
    DialogModule,
    ConfirmDialogModule,
    PasswordModule,
  ],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css',
  providers: [ConfirmationService],
})
export class PerfilPage {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private queryClient = inject(QueryClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  queryUsuario = injectQuery(() => ({
    queryKey: ['usuario', 'perfil', this.authService.getUsuarioId()],
    queryFn: () =>
      lastValueFrom(this.usuarioService.recuperarUsuario(this.authService.getUsuarioId()!)),
    staleTime: Infinity,
  }));

  mutationUsuario = injectMutation(() => ({
    mutationFn: (dados: AtualizaUsuarioDTO) =>
      lastValueFrom(this.usuarioService.atualizaUsuario(this.authService.getUsuarioId()!, dados)),
  }));
  formError = signal('');

  valUsuario: UsuarioLocal = {
    nome: '',
    email: '',
    rendaMensal: 0,
    limiteMensal: 0,
    dataNascimento: new Date(),
  };

  popupAlterarSenha = false;
  senhaValues = {
    senhaAntiga: '',
    senhaNova: '',
    confirmarSenhaNova: '',
  };
  mutationSenha = injectMutation(() => ({
    mutationFn: (dados: AtualizaSenhaDTO) =>
      lastValueFrom(this.usuarioService.atualizaSenha(this.authService.getUsuarioId()!, dados)),
  }));
  formSenhaError = signal('');

  constructor() {
    effect(() => {
      const data = this.queryUsuario.data();
      if (!data) return;
      this.valUsuario.nome = data.nome;
      this.valUsuario.email = data.email;
      this.valUsuario.rendaMensal = data.rendaMensal;
      this.valUsuario.limiteMensal = data.limiteMensal;
      // gambiarra para evitar problemas com fuso horario
      this.valUsuario.dataNascimento = new Date(
        data.dataNascimento.split('T')[0].replaceAll('-', '/'),
      );
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);

    this.messageService.add({
      severity: 'info',
      summary: 'Informação',
      detail: 'Usuário desconectado',
    });
  }

  formatShortName(fullName: string) {
    const split = fullName.toString().trim().split(/\s+/);
    if (split.length >= 2) {
      const firstTwo = `${split[0]} ${split[1]}`;
      const disallow = ['de', 'da', 'das', 'dos'];
      if (firstTwo.length < 15 && !disallow.includes(split[1].toLowerCase())) return firstTwo;
    }
    return split[0];
  }

  onSubmit(form: NgForm) {
    this.formError.set('');
    this.mutationUsuario.mutate(
      { ...this.valUsuario, dataNascimento: this.valUsuario.dataNascimento.toISOString() },
      {
        onSuccess: () => {
          this.queryClient.invalidateQueries({ queryKey: ['usuario', 'perfil'] });
          this.queryClient.invalidateQueries({ queryKey: ['usuario', 'sumario'] });
          form.control.markAsPristine();
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Perfil atualizado com sucesso!',
          });
        },
        onError: (err: any) => {
          const msg: string | undefined = err?.error?.erro;
          if (msg === 'Dados inválidos') {
            for (const detail of err.error.detalhes) {
              if (form.controls[detail.campo])
                form.controls[detail.campo].setErrors({ custom: detail.mensagem });
            }
          } else {
            this.formError.set(msg ?? 'Erro ao atualizar dados');
          }
        },
      },
    );
  }

  onSubmitSenha(form: NgForm) {
    if (this.senhaValues.senhaNova !== this.senhaValues.confirmarSenhaNova) return;
    this.formSenhaError.set('');
    this.mutationSenha.mutate(this.senhaValues, {
      onSuccess: () => {
        form.resetForm();
        this.popupAlterarSenha = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Senha atualizada com sucesso!',
        });
      },
      onError: (err: any) => {
        const msg: string | undefined = err?.error?.erro;
        if (msg === 'Dados inválidos') {
          for (const detail of err.error.detalhes) {
            if (form.controls[detail.campo])
              form.controls[detail.campo].setErrors({ custom: detail.mensagem });
          }
        } else if (msg === 'A senha atual está incorreta') {
          form.controls['senhaAntiga'].setErrors({ custom: 'Senha incorreta' });
        } else {
          this.formSenhaError.set(msg ?? 'Erro ao atualizar senha');
        }
      },
    });
  }

  excluirConta() {
    if (!this.queryUsuario.isSuccess()) return;

    this.confirmationService.confirm({
      header: 'Excluir Conta',
      message:
        'Tem certeza que quer excluir a conta?<br>Todos os seus dados serão excluidos, isso não poderá ser desfeito.',
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
        this.usuarioService.deletarUsuario(this.authService.getUsuarioId()!).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['login']);

            this.messageService.add({
              severity: 'info',
              summary: 'Informação',
              detail: 'Conta excluida com sucesso',
            });
          },
        });
      },
    });
  }
}
