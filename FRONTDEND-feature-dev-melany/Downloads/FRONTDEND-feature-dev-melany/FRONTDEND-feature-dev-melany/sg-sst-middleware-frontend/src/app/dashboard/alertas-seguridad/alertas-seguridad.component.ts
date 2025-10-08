import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
@Component({
  selector: 'app-alertas-seguridad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas-seguridad.component.html',
  styleUrls: ['./alertas-seguridad.component.scss']
})
export class AlertasSeguridadComponent {
  alertas = [
    { mensaje: 'Derrame de líquidos en área de producción', nivel: 'Crítica', fecha: '2025-04-06' },
    { mensaje: 'Extintor vencido en oficina administrativa', nivel: 'Alta', fecha: '2025-04-05' },
    { mensaje: 'Señalización caída en bodega', nivel: 'Media', fecha: '2025-04-03' },
  ];
}
