import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth-service';

export const CATEGORIA_NOMES: Record<string, string> = {
  ALIMENTACAO: 'Alimentação',
  LAZER: 'Lazer',
  TRANSPORTE: 'Transporte',
  COMPRAS: 'Compras',
  CONTAS: 'Contas',
  OUTROS: 'Outros',
};

export function nomeExibicaoCategoria(nome: string) {
  return CATEGORIA_NOMES[nome] ?? nome;
}

export interface Categoria {
  id: string;
  nome: string;
  idUsuario: string | null;
  personalizada: boolean;
}

export interface CadastroCategoria {
  nome: string;
  idUsuario: string;
}

export interface AtualizarCategoria {
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.API_URL}/categorias`;

  public listarCategorias(idUsuario: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.url}/${idUsuario}`);
  }

  public cadastrarCategoria(categoria: CadastroCategoria): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.url}/cadastrarCategoria`, categoria);
  }

  public atualizarCategoria(
    categoria: AtualizarCategoria,
    idUsuario: string,
    idCategoria: string,
  ): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.url}/${idUsuario}/${idCategoria}`, categoria);
  }

  public deletarCategoria(idUsuario: string, idCategoria: string) {
    return this.http.delete(`${this.url}/${idUsuario}/${idCategoria}`);
  }
}

export function injectQueryCategorias() {
  const categoriaService = inject(CategoriaService);
  const authService = inject(AuthService);

  return injectQuery(() => {
    const idUsuario = authService.getUsuarioId();
    return {
      queryKey: ['categorias', idUsuario],
      queryFn: () => lastValueFrom(categoriaService.listarCategorias(idUsuario!)),
      enabled: !!idUsuario,
      staleTime: 60000,
    };
  });
}
