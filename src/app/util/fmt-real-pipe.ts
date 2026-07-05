import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fmtReal',
})
export class FmtRealPipe implements PipeTransform {
  formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  transform(valor: number): string {
    return this.formatter.format(valor);
  }
}
