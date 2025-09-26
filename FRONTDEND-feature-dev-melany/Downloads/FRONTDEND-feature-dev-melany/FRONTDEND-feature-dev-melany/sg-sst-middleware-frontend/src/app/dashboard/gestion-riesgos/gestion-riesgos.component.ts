import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-gestion-riesgos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-riesgos.component.html',
  styleUrls: ['./gestion-riesgos.component.scss']
})
export class GestionRiesgosComponent {
  riesgos = [
    { riesgo: 'Caídas a nivel', nivel: 'Alto', medidas: 'Instalar cintas antideslizantes y señalización.' },
    { riesgo: 'Contacto eléctrico', nivel: 'Crítico', medidas: 'Capacitación y mantenimiento de equipos.' },
    { riesgo: 'Carga manual de objetos', nivel: 'Medio', medidas: 'Uso de técnicas adecuadas y ayudas mecánicas.' },
  ];
}
