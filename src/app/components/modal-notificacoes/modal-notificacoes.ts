import { Component, model } from '@angular/core';
import { LucideBell, LucideX } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FmtTimestampPipe } from '../../util/fmt-timestamp';

@Component({
  selector: 'app-modal-notificacoes',
  imports: [
    ButtonModule,
    ProgressSpinnerModule,
    DialogModule,
    LucideBell,
    LucideX,
    FmtTimestampPipe,
  ],
  templateUrl: './modal-notificacoes.html',
})
export class ModalNotificacoes {
  public visible = model(false);
  notificacoes = [
    {
      id: 1,
      msg: 'Isso é uma notificação de teste!',
      lida: false,
      timestamp: new Date(),
    },
    {
      id: 2,
      msg: 'Isso é uma notificação de teste! e contem ainda mais texto! texto texto texto texto',
      lida: false,
      timestamp: new Date(Date.now() - 2 * 3600 * 1000),
    },
    {
      id: 3,
      msg: 'Isso é uma notificação de teste! ainda bem que você já leu ela',
      lida: true,
      timestamp: new Date(Date.now() - 40 * 3600 * 1000),
    },
    ...Array(10)
      .fill(0)
      .map((_, i) => ({
        id: 4 + i,
        msg: 'Isso é uma notificação de teste!',
        lida: i % 2 == 1,
        timestamp: new Date(Date.now() - 89 * (i + 1) * 3600 * 1000),
      })),
  ];

  constructor() {
    this.notificacoes = [];
  }
}
