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

export interface CadastroUsuarioDTO {
  nome: string;
  dataNascimento: string;
  email: string;
  senha: string;
  rendaMensal: number | null;
  limiteMensal: number | null;
}

export type AtualizaUsuarioDTO = Partial<Omit<UsuarioDTO, 'id'>>;

export interface RegisterResponse {
  id: string;
  nome: string;
  dataNascimento: string;
  email: string;
  rendaMensal: number;
  limiteMensal: number;
  createdAt: string;
}

export interface SumarioUsuarioDTO {
  limiteMensal: string;
  rendaMensal: string;
  totalDespesas: number;
  totalReceitas: number;
  limiteUsadoPorc: number;
}

export interface AtualizaSenhaDTO {
  senhaAntiga: string;
  senhaNova: string;
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

  public atualizaUsuario(id: string, dados: AtualizaUsuarioDTO) {
    return this.http.patch<UsuarioDTO>(`${this.url}/usuarios/${id}`, dados);
  }

  public atualizaSenha(id: string, dados: AtualizaSenhaDTO) {
    return this.http.patch(`${this.url}/usuarios/${id}/senha`, dados);
  }

  public deletarUsuario(id: string) {
    return this.http.delete(`${this.url}/usuarios/${id}`);
  }

  register(
    dados: CadastroUsuarioDTO
  ) {
    return this.http.post<RegisterResponse>(`${this.url}/usuarios/criarUsuario`, dados);
  }
}
