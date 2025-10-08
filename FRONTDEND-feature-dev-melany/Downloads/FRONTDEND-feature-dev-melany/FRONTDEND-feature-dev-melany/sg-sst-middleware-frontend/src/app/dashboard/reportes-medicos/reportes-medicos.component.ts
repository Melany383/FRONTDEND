import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reportes-medicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-medicos.component.html',
  styleUrls: ['./reportes-medicos.component.scss']
})
export class ReportesMedicosComponent {
  reportes = [
    { empleado: 'Carlos Pérez', motivo: 'Lumbalgia', dias: 3, fecha: '2025-04-01' },
    { empleado: 'Ana Gómez', motivo: 'Accidente de trabajo', dias: 5, fecha: '2025-04-03' },
    { empleado: 'Luis Martínez', motivo: 'Gripe común', dias: 2, fecha: '2025-04-05' },
  ];
}
