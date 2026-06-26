import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

export interface UsuarioDTO {
  id: string;
  nome: string;
  dataNascimento: string;
  email: string;
  rendaMensal: number;
  limiteMensal: number;
}

export interface SumarioUsuarioDTO {
  limiteMensal: string;
  rendaMensal: string;
  totalDespesas: number;
  totalReceitas: number;
  limiteUsadoPorc: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly url = environment.API_URL;

  public recuperarUsuario(id: string) {
    return this.http.get<UsuarioDTO>(`${this.url}/usuarios/${id}`);
  }

  public sumarioUsuario(id: string) {
    return this.http.get<SumarioUsuarioDTO>(`${this.url}/usuarios/sumario/${id}`);
  }
}
