import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Categoria, nomeExibicaoCategoria } from './categoria-service';

export interface Despesa {
  id: string;
  nome: string;
  idCategoria: string;
  categoria: string;
  data: string;
  valor: number;
  idUsuario: string;
  idDespesaRecorrente: string | null;
}

export interface CadastroDespesa {
  nome: string;
  idCategoria: string;
  data: Date;
  valor: number;
  idUsuario: string;
}

export interface AtualizarDespesa {
  nome?: string;
  idCategoria?: string;
  data?: Date;
  valor?: number;
}

export interface GastosCategoriaDTO {
  id: string;
  nome: string;
  nomeOriginal: string;
  valor: number;
}

interface SomaGastosCategoria {
  idCategoria: string;
  categoria: string;
  valor: number;
}

@Injectable({
  providedIn: 'root',
})
export class DespesaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.API_URL}/despesas`;

  public recuperarDespesa(idUsuario: string, idDespesa: string): Observable<Despesa> {
    return this.http.get<Despesa>(`${this.url}/${idUsuario}/${idDespesa}`);
  }

  public recuperarGastosCategoria(
    idUsuario: string,
    periodo: 'anual' | 'mensal' | 'semanal',
    categorias: Categoria[],
  ): Observable<GastosCategoriaDTO[]> {
    return this.http.get<SomaGastosCategoria[]>(`${this.url}/media/${idUsuario}/${periodo}`).pipe(
      map((gastos) => {
        const valorPorCategoria = new Map(gastos.map((g) => [g.idCategoria, g.valor]));
        return categorias.map((categoria) => ({
          id: categoria.id,
          nome: nomeExibicaoCategoria(categoria.nome),
          nomeOriginal: categoria.nome,
          valor: valorPorCategoria.get(categoria.id) ?? 0,
        }));
      }),
    );
  }

  public recuperarDespesasAll(
    idUsuario: string,
    periodo?: string,
    idCategoria?: string,
  ): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(`${this.url}/${idUsuario}`, {
      params: { ...(periodo && { periodo }), ...(idCategoria && { idCategoria }) },
    });
  }

  public cadastrarDespesa(despesa: CadastroDespesa): Observable<Despesa> {
    return this.http.post<Despesa>(`${this.url}/cadastrarDespesa`, despesa);
  }

  public atualizarDespesa(
    despesa: AtualizarDespesa,
    idUsuario: string,
    idDespesa: string,
  ): Observable<Despesa> {
    return this.http.patch<Despesa>(`${this.url}/${idUsuario}/${idDespesa}`, despesa);
  }

  public deletarDespesa(idUsuario: string, idDespesa: string) {
    return this.http.delete(`${this.url}/${idUsuario}/${idDespesa}`);
  }
}
