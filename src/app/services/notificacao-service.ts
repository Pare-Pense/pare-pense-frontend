import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notificacao {
  id: string;
  mensagem: string;
  lida: boolean;
  createdAt: string;
}

export interface ResponseNotificacoes {
  notificacoes: Notificacao[];
  naoLidas: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  private http = inject(HttpClient);
  private readonly url = environment.API_URL;

  public getNotificacoes(idUsuario: string): Observable<ResponseNotificacoes> {
    return this.http.get<ResponseNotificacoes>(`${this.url}/notificacoes/${idUsuario}`);
  }

  public marcarNotificacoesLida(idUsuario: string) {
    return this.http.patch(`${this.url}/notificacoes/${idUsuario}/lidas`, null);
  }
}
