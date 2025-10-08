import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-indicadores-kpi',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './indicadores-kpi.component.html',
  styleUrls: ['./indicadores-kpi.component.scss']
})
export class IndicadoresKpiComponent {
  kpis = [
    { title: 'Empleados activos', value: 125, icon: 'groups', color: '#3f51b5' },
    { title: 'Días sin accidentes', value: 38, icon: 'event_available', color: '#4caf50' },
    { title: 'Índice de frecuencia', value: '2.3', icon: 'insights', color: '#ff9800' },
    { title: 'Capacitaciones completadas', value: '87%', icon: 'school', color: '#9c27b0' }
  ];
}
