import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Notificacao {
  id: string;
  mensagem: string;
  lida: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  getNotificacoes(idUsuario: string): Observable<Notificacao[]> {
    return of([
      {
        id: '1',
        mensagem: 'Isso é uma notificação de teste!',
        lida: false,
        timestamp: new Date(),
      },
      {
        id: '2',
        mensagem:
          'Isso é uma notificação de teste! e contem ainda mais texto! texto texto texto texto',
        lida: false,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        id: '3',
        mensagem: 'Isso é uma notificação de teste! ainda bem que você já leu ela',
        lida: true,
        timestamp: new Date(Date.now() - 40 * 3600 * 1000),
      },
      ...Array(5)
        .fill(0)
        .map((_, i) => ({
          id: `${4 + i}`,
          mensagem: 'Isso é uma notificação de teste!',
          lida: i % 2 == 1,
          timestamp: new Date(Date.now() - 89 * (i + 1) * 3600 * 1000),
        })),
    ]);
  }

  getNotificacaoCount(idUsuario: string): Observable<number> {
    return of(5);
  }

  marcarNotificacoesLida(idUsuario: string) {
    return of({});
  }
}
