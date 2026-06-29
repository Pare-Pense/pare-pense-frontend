import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    nome: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly url = environment.API_URL;

  login(email: string, senha: string) {
    return this.http
      .post<LoginResponse>(`${this.url}/usuarios/login`, { email, senha })
      .pipe(tap((r) => this.onLogin(r)));
  }

  register(email: string, senha: string, username: string, birthDate: string, saldoMensal: number | null, limiteGastos: number | null) {
    const payload = {
      email: email,
      senha: senha,
      nome: username,            
      dataNascimento: birthDate,  
      rendaMensal: saldoMensal,   
      limiteMensal: limiteGastos
    }
    return this.http
      .post<LoginResponse>(`${this.url}/usuarios/criarUsuario`, payload)
      //.pipe();
  }

  protected onLogin(res: LoginResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(res.usuario));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasToken() {
    return this.getToken() !== null;
  }

  // De preferencia só utilize o ID, uma request GET para
  // o serviço de usuario é mais correto
  getUsuario() {
    try {
      return JSON.parse(localStorage.getItem('usuario') ?? '') as LoginResponse['usuario'];
    } catch {
      return null;
    }
  }

  getUsuarioId() {
    return this.getUsuario()?.id;
  }
}
