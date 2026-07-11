import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fmtTimestamp',
})
export class FmtTimestampPipe implements PipeTransform {
  transform(valor: Date): string {
    const diff = Date.now() - +valor;
    if (Math.abs(diff) < 10_000) {
      return 'agora';
    } else if (diff < 60 * 1000) {
      // menos de 1m
      const q = Math.floor(diff / 1000);
      return `${q} ${q == 1 ? 'segundo' : 'segundos'} atrás`;
    } else if (diff < 60 * 60 * 1000) {
      // menos de 1h
      const q = Math.floor(diff / (60 * 1000));
      return `${q} ${q == 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      // menos de 24h
      const q = Math.floor(diff / (60 * 60 * 1000));
      return `${q} ${q == 1 ? 'hora' : 'horas'} atrás`;
    } else if (diff < 5 * 24 * 60 * 60 * 1000) {
      // menos de 5 dias
      const q = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${q} ${q == 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return `${valor.getDate()}/${valor.getMonth() + 1}/${valor.getFullYear()}`;
    }
  }
}
