import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
  standalone: false
})
export class CurrencyPipe implements PipeTransform {
  transform(value: number | string, currencySymbol: string = '₪'): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return `${currencySymbol}0.00`;
    }
    
    const num = Number(value);
    return `${currencySymbol}${num.toFixed(2)}`;
  }
}