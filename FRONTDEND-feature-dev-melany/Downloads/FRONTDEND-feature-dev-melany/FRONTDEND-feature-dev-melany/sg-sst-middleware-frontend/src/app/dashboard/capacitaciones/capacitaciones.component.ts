import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-capacitaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './capacitaciones.component.html',
  styleUrls: ['./capacitaciones.component.scss']
})
export class CapacitacionesComponent {
  capacitaciones = [
    { tema: 'Ergonomía en el Trabajo', completado: 80 },
    { tema: 'Manejo de Sustancias Químicas', completado: 60 },
    { tema: 'Primeros Auxilios', completado: 95 },
    { tema: 'Prevención de Riesgos', completado: 45 },
  ];
}
