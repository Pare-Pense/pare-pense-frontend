import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideChevronLeft, LucideDollarSign, LucideUser } from '@lucide/angular';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { lastValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth-service';
import { AtualizaUsuarioDTO, UsuarioService } from '../../services/usuario-service';
import { MessageService } from 'primeng/api';

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
  ],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css',
})
export class PerfilPage {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private queryClient = inject(QueryClient);
  private messageService = inject(MessageService);

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
}
