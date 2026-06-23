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

export interface DespesaDTO {
  id: string;
  nome: string;
  categoria: Categoria;
  data: string;
  horario: string;
  valor: number;
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
  private readonly url = environment.API_URL;

  public recuperarDespesa(idUsuario: string, idDespesa: string): Observable<DespesaDTO> {
    return this.http.get<DespesaDTO>(`${this.url}/despesas/${idUsuario}/${idDespesa}`);
  }

  public recuperarDespesasAll(idUsuario: string): Observable<DespesaDTO[]> {
    return this.http.get<DespesaDTO[]>(`${this.url}/despesas/${idUsuario}`);
  }

  public recuperarGastosCategoria(idUsuario: string, periodo: 'anual' | 'mensal' | 'semanal') {
    return this.http.get<any[]>(`${this.url}/despesas/media/${idUsuario}/${periodo}`).pipe(
      map((obj) => {
        const valores = Object.keys(CATEGORIA_NOMES).map((k) => ({
          id: k,
          nome: CATEGORIA_NOMES[k as Categoria],
          valor: 0,
        }));
        for (const x of obj) {
          valores.find((val) => val.id === x.categoria)!.valor = x._avg.valor;
        }
        return valores;
      }),
    );
  }
}
