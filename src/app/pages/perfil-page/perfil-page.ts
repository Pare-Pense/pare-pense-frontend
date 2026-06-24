import { Component, inject } from '@angular/core';
import { LucideChevronLeft } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-perfil-page',
  imports: [ButtonModule, LucideChevronLeft, RouterLink],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.css',
})
export class PerfilPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.getUsuario();

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
