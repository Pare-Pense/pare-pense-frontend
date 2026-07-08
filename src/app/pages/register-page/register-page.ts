import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import {
  LucideLockKeyhole,
  LucideMail,
  LucideWallet,
  LucideUser,
  LucideCalendar,
  LucideDollarSign,
} from '@lucide/angular';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario-service';
import { MessageModule } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register-page',
  imports: [
    ButtonModule,
    FormsModule,
    FloatLabelModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputNumberModule,
    InputTextModule,
    LucideLockKeyhole,
    LucideMail,
    LucideCalendar,
    LucideUser,
    LucideWallet,
    LucideDollarSign,
    PasswordModule,
    RouterLink,
    ProgressSpinner,
    MessageModule,
  ],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  private messageService = inject(MessageService);
  private userService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email: string = '';
  senha: string = '';
  username: string = '';
  birthDate: string = '';
  senhaConf: string = '';
  saldoMensal: number | null = null;
  limiteGastos: number | null = null;
  loading = signal(false);
  formError = signal('');

  onSubmit(form: NgForm) {
    this.formError.set('');
    this.loading.set(true);
    this.userService
      .register(
        this.email,
        this.senha,
        this.username,
        this.birthDate,
        this.limiteGastos,
        this.saldoMensal,
      )
      .subscribe({
        next: () => {
          this.loading.set(false);
          const redirect = this.route.snapshot.queryParams['redirect'] ?? '/home';
          this.router.navigateByUrl(redirect);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário cadastrado com sucesso!',
          });
        },
        error: (err) => {
          this.loading.set(false);
          const msg: string | undefined = err?.error?.erro;
          if (msg === 'Dados inválidos') {
            for (const detail of err.error.detalhes) {
              if (form.controls[detail.campo])
                form.controls[detail.campo].setErrors({ custom: detail.mensagem });
            }
          } else {
            this.formError.set(msg ?? 'Erro ao fazer o cadastro');
          }
          console.error('Erro ao fazer register!', msg);
        },
      });
  }

  onAnyInput() {
    this.formError.set('');
  }
}
