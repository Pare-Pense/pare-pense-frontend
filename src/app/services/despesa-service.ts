import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export type Categoria = 'ALIMENTACAO' | 'LAZER' | 'TRANSPORTE' | 'COMPRAS' | 'CONTAS' | 'OUTROS';

export interface Despesa {
  id: string;
  nome: string;
  categoria: Categoria;
  data: string;
  horario: string;
  valor: number;
}

const DESPESA_MOCK: Despesa = {
  id: '123-uuid',
  nome: 'Delivery',
  categoria: 'ALIMENTACAO',
  data: '2026-05-18',
  valor: 51.01,
  horario: '19:30',
};

const MOCK_DELAY = 500;

@Injectable({
  providedIn: 'root',
})
export class DespesaService {
  public recuperarDespesa(idUsuario: string, idDespesa: string): Observable<Despesa> {
    return of({ ...DESPESA_MOCK, id: idUsuario + idDespesa }).pipe(delay(MOCK_DELAY));
  }

  public recuperarDespesasAll(idUsuario: string): Observable<Despesa[]> {
    return of([DESPESA_MOCK]).pipe(delay(MOCK_DELAY));
  }

  public recuperarDespesasPeriodo(idUsuario: string, periodo: string): Observable<Despesa[]> {
    return this.recuperarDespesasAll(idUsuario);
  }
}
