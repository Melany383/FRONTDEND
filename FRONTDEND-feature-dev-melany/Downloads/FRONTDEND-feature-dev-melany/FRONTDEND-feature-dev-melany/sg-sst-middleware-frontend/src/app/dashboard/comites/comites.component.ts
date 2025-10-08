import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-comites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comites.component.html',
  styleUrls: ['./comites.component.scss']
})
export class ComitesComponent {
  comites = [
    { nombre: 'COPASST', fechaProxima: '2025-04-15', estado: 'Programado' },
    { nombre: 'Comité de Convivencia', fechaProxima: '2025-04-18', estado: 'Pendiente' },
    { nombre: 'Brigada de Emergencia', fechaProxima: '2025-04-20', estado: 'Confirmado' },
  ];
}