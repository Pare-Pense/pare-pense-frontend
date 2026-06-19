import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { LucideLockKeyhole, LucideMail, LucideWallet } from '@lucide/angular';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { MessageModule } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-login-page',
  imports: [
    ButtonModule,
    FormsModule,
    FloatLabelModule,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    LucideLockKeyhole,
    LucideMail,
    LucideWallet,
    PasswordModule,
    RouterLink,
    MessageModule,
    ProgressSpinner,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email: string = '';
  senha: string = '';
  loading = signal(false);

  onSubmit(form: NgForm) {
    this.loading.set(true);
    this.authService.login(this.email, this.senha).subscribe({
      next: () => {
        this.loading.set(false);
        const redirect = this.route.snapshot.queryParams['redirect'] ?? '/home';
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        this.loading.set(false);
        const msg: string | undefined = err?.error?.erro;
        if (msg === 'Dados inválidos') {
          for (const detail of err.error.detalhes) {
            if (form.controls[detail.campo])
              form.controls[detail.campo].setErrors({ custom: detail.mensagem });
          }
        } else if (msg === 'Usuário não encontrado') {
          form.controls['email'].setErrors({ custom: msg });
        } else if (msg === 'Senha inválida') {
          form.controls['senha'].setErrors({ custom: msg });
        } else {
          form.controls['email'].setErrors({ custom: msg ?? 'Erro ao fazer login' });
        }
        console.error('Erro ao fazer login!', msg);
      },
    });
  }
}
