import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export const CATEGORIA_NOMES = {
  ALIMENTACAO: 'Alimentação',
  LAZER: 'Lazer',
  TRANSPORTE: 'Transporte',
  COMPRAS: 'Compras',
  CONTAS: 'Contas',
  OUTROS: 'Outros',
} as const;

export type Categoria = keyof typeof CATEGORIA_NOMES;

export interface Despesa {
  id: string;
  nome: string;
  categoria: Categoria;
  data: string;
  valor: number;
  idUsuario: string;
}

export interface CadastroDespesa {
  nome: string;
  categoria: Categoria | undefined;
  data: Date;
  valor: number;
  idUsuario: string;
}

export interface AtualizarDespesa {
  nome: string | undefined;
  categoria: Categoria | undefined;
  data: Date | undefined;
  valor: number | undefined;
}

export interface GastosCategoriaDTO {
  id: Categoria;
  nome: string;
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

  public recuperarDespesasAll(idUsuario: string): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(`${this.url}/${idUsuario}`);
  }

  public recuperarGastosCategoria(idUsuario: string, periodo: 'anual' | 'mensal' | 'semanal') {
    return this.http.get<any[]>(`${this.url}/media/${idUsuario}/${periodo}`).pipe(
      map((obj) => {
        const valores = Object.keys(CATEGORIA_NOMES).map((k) => ({
          id: k,
          nome: CATEGORIA_NOMES[k as Categoria],
          valor: 0,
        }));
        for (const x of obj) {
          valores.find((val) => val.id === x.categoria)!.valor = x.valor;
        }
        return valores;
      }),
    );
  }

  public recuperarDespesasPeriodoECategoria(
    idUsuario: string,
    periodo: string,
    categoria?: Categoria,
  ): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(`${this.url}/${idUsuario}/${periodo}`, {
      params: categoria ? { categoria } : {},
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
