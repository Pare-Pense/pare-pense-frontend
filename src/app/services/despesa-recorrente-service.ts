import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export type Frequencia = 'SEMANAL' | 'MENSAL' | 'ANUAL';

export const FREQUENCIAS: { label: string; value: Frequencia }[] = [
  { label: 'Semanal', value: 'SEMANAL' },
  { label: 'Mensal', value: 'MENSAL' },
  { label: 'Anual', value: 'ANUAL' },
];

const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export interface DespesaRecorrente {
  id: string;
  nome: string;
  idCategoria: string;
  valor: number;
  frequencia: Frequencia;
  diaSemana: number | null;
  diaMes: number | null;
  mes: number | null;
  dataInicio: string;
  dataFim: string | null;
  ativa: boolean;
  idUsuario: string;
  createdAt: string;
}

interface RegraRecorrencia {
  frequencia: Frequencia;
  diaSemana?: number;
  diaMes?: number;
  mes?: number;
}

export interface CadastroDespesaRecorrente extends RegraRecorrencia {
  nome: string;
  idCategoria: string;
  valor: number;
  idUsuario: string;
  dataInicio: string;
  dataFim?: string;
}

export type AtualizarDespesaRecorrente = Partial<Omit<CadastroDespesaRecorrente, 'idUsuario'>>;

export function dataParaISODate(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function isoDateParaData(data: string) {
  const [ano, mes, dia] = data.split('T')[0].split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function regraAPartirDaData(frequencia: Frequencia, data: Date): RegraRecorrencia {
  if (frequencia === 'SEMANAL') {
    return { frequencia, diaSemana: data.getDay() };
  }
  if (frequencia === 'MENSAL') {
    return { frequencia, diaMes: data.getDate() };
  }
  return { frequencia, diaMes: data.getDate(), mes: data.getMonth() + 1 };
}

export function descreverRegra(recorrente: DespesaRecorrente) {
  if (recorrente.frequencia === 'SEMANAL') {
    return `Semanal, toda ${DIAS_SEMANA[recorrente.diaSemana ?? 0]}`;
  }
  if (recorrente.frequencia === 'MENSAL') {
    return `Mensal, dia ${recorrente.diaMes}`;
  }
  const dia = String(recorrente.diaMes).padStart(2, '0');
  const mes = String(recorrente.mes).padStart(2, '0');
  return `Anual, ${dia}/${mes}`;
}

@Injectable({
  providedIn: 'root',
})
export class DespesaRecorrenteService {
  private http = inject(HttpClient);
  private readonly url = `${environment.API_URL}/despesas-recorrentes`;

  public listarDespesasRecorrentes(idUsuario: string): Observable<DespesaRecorrente[]> {
    return this.http.get<DespesaRecorrente[]>(`${this.url}/${idUsuario}`);
  }

  public cadastrarDespesaRecorrente(
    recorrente: CadastroDespesaRecorrente,
  ): Observable<DespesaRecorrente> {
    return this.http.post<DespesaRecorrente>(`${this.url}/cadastrarDespesaRecorrente`, recorrente);
  }

  public atualizarDespesaRecorrente(
    recorrente: AtualizarDespesaRecorrente,
    idUsuario: string,
    idDespesaRecorrente: string,
  ): Observable<DespesaRecorrente> {
    return this.http.patch<DespesaRecorrente>(
      `${this.url}/${idUsuario}/${idDespesaRecorrente}`,
      recorrente,
    );
  }

  public pausarDespesaRecorrente(
    idUsuario: string,
    idDespesaRecorrente: string,
  ): Observable<DespesaRecorrente> {
    return this.http.patch<DespesaRecorrente>(
      `${this.url}/${idUsuario}/${idDespesaRecorrente}/pausar`,
      {},
    );
  }

  public reativarDespesaRecorrente(
    idUsuario: string,
    idDespesaRecorrente: string,
  ): Observable<DespesaRecorrente> {
    return this.http.patch<DespesaRecorrente>(
      `${this.url}/${idUsuario}/${idDespesaRecorrente}/reativar`,
      {},
    );
  }

  public deletarDespesaRecorrente(idUsuario: string, idDespesaRecorrente: string) {
    return this.http.delete(`${this.url}/${idUsuario}/${idDespesaRecorrente}`);
  }
}
