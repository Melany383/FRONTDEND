import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cumplimiento-normativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cumplimiento-normativo.component.html',
  styleUrls: ['./cumplimiento-normativo.component.scss']
})
export class CumplimientoNormativoComponent {
  normativas = [
    { nombre: 'Resolución 0312 de 2019', cumplimiento: 92 },
    { nombre: 'Ley 1562 de 2012', cumplimiento: 85 },
    { nombre: 'Decreto 1072 de 2015', cumplimiento: 78 },
  ];
}
