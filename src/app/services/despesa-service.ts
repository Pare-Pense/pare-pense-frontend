import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export type Categoria = 'ALIMENTACAO' | 'LAZER' | 'TRANSPORTE' | 'COMPRAS' | 'CONTAS' | 'OUTROS';

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

const DESPESA_MOCK: Despesa = {
  id: '123-uuid',
  nome: 'Delivery',
  categoria: 'ALIMENTACAO',
  data: '2026-05-18',
  valor: 51.01,
  idUsuario: '132-uuid',
};

const MOCK_DELAY = 500;

@Injectable({
  providedIn: 'root',
})
export class DespesaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.API_URL}/despesas`;

  public recuperarDespesa(idUsuario: string, idDespesa: string): Observable<Despesa> {
    return of({ ...DESPESA_MOCK, id: idUsuario + idDespesa }).pipe(delay(MOCK_DELAY));
  }

  public recuperarDespesasAll(idUsuario: string): Observable<Despesa[]> {
    return of([DESPESA_MOCK]).pipe(delay(MOCK_DELAY));
  }

  public recuperarDespesasPeriodo(idUsuario: string, periodo: string): Observable<Despesa[]> {
    return this.recuperarDespesasAll(idUsuario);
  }

  public cadastrarDespesa(despesa: CadastroDespesa): Observable<Despesa> {
    return this.http.post<Despesa>(`${this.url}/cadastrarDespesa`, despesa);
  }
}
