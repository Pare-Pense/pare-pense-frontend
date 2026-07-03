import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Receita {
  id: string;
  nome: string;
  data: string;
  valor: number;
  idUsuario: string;
}

export interface AtualizarReceita {
  nome: string | undefined;
  data: Date | undefined;
  valor: number | undefined;
}

export interface CadastroReceita {
  nome: string;
  data: Date;
  valor: number;
  idUsuario: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReceitaService {
  private http = inject(HttpClient);
  private readonly url = `${environment.API_URL}/receitas`;

  public cadastrarReceita(receita: CadastroReceita): Observable<Receita> {
    return this.http.post<Receita>(`${this.url}/cadastrarReceita`, receita);
  }

  public recuperarReceitasAll(idUsuario: string): Observable<Receita[]> {
    return this.http.get<Receita[]>(`${this.url}/${idUsuario}`);
  }

  public recuperarReceitasPorPeriodo(
    idUsuario: string,
    periodo: 'semanal' | 'mensal' | 'anual',
  ): Observable<Receita[]> {
    return this.http.get<Receita[]>(`${this.url}/${idUsuario}/${periodo}`);
  }

  public atualizarReceita(
    receita: AtualizarReceita,
    idUsuario: string,
    idReceita: string,
  ): Observable<Receita> {
    return this.http.patch<Receita>(`${this.url}/${idUsuario}/${idReceita}`, receita);
  }

  public deletarReceita(idUsuario: string, idReceita: string) {
    return this.http.delete(`${this.url}/${idUsuario}/${idReceita}`);
  }
}
