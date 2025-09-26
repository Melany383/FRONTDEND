import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common'; 
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Chart, registerables, ChartConfiguration, ChartOptions } from 'chart.js'; 

// Define interfaces for type safety
interface AccidentData {
  month: string;
  accidents: number;
  nearMisses: number;
}

interface SeverityData {
  type: string;
  value: number;
}

interface RecentAccident {
  date: string;
  title: string;
  description: string;
  severity: 'leve' | 'grave' | 'critico'; 
}

@Component({
  selector: 'app-accidentalidad',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TitleCasePipe 
  ],
  templateUrl: './accidentalidad.component.html',
  styleUrls: ['./accidentalidad.component.scss']
})
export class AccidentalidadComponent implements OnInit, AfterViewInit, OnDestroy {
  // Chart instances to destroy later
  private accidentsChart: Chart | undefined;
  private severityChart: Chart | undefined;

  accidentsData: AccidentData[] = [
    { month: 'Enero', accidents: 3, nearMisses: 5 },
    { month: 'Febrero', accidents: 2, nearMisses: 4 },
    { month: 'Marzo', accidents: 1, nearMisses: 3 },
    { month: 'Abril', accidents: 0, nearMisses: 2 },
    { month: 'Mayo', accidents: 1, nearMisses: 3 },
    { month: 'Junio', accidents: 2, nearMisses: 4 }
  ];

  severityData: SeverityData[] = [
    { type: 'Leves', value: 5 },
    { type: 'Graves', value: 2 },
    { type: 'Críticos', value: 0 } 
  ];

  recentAccidents: RecentAccident[] = [
    {
      date: '15/05/2025', 
      title: 'Caída de altura',
      description: 'Trabajador resbaló en plataforma sin barandilla',
      severity: 'grave'
    },
    {
      date: '10/05/2025', 
      title: 'Golpe con objeto',
      description: 'Herramienta cayó desde altura',
      severity: 'leve'
    },
    {
      date: '02/05/2025', 
      title: 'Quemadura química',
      description: 'Exposición a sustancia corrosiva',
      severity: 'critico'
    }
  ];

  constructor() {
    
    Chart.register(...registerables);
  }

  ngOnInit() {
   
  }

  ngAfterViewInit() {
   
    this.renderAccidentsChart();
    this.renderSeverityChart();
  }

  ngOnDestroy() {
  
    if (this.accidentsChart) {
      this.accidentsChart.destroy();
    }
    if (this.severityChart) {
      this.severityChart.destroy();
    }
  }

 
  trackByAccidentDate(index: number, accident: RecentAccident): string {
    return accident.date + accident.title;
  }

  private renderAccidentsChart() {
    const ctx = document.getElementById('accidentsChart') as HTMLCanvasElement;
    if (ctx) { 
      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: this.accidentsData.map(d => d.month),
          datasets: [
            {
              label: 'Accidentes',
              data: this.accidentsData.map(d => d.accidents),
              backgroundColor: '#f72585', 
              borderColor: '#f72585',
              borderWidth: 1,
              borderRadius: 5, 
            },
            {
              label: 'Incidentes',
              data: this.accidentsData.map(d => d.nearMisses),
              backgroundColor: '#4895ef', 
              borderColor: '#4895ef',
              borderWidth: 1,
              borderRadius: 5,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, 
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#6c757d', 
              }
            },
            tooltip: { 
              backgroundColor: 'rgba(0,0,0,0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              cornerRadius: 5,
              displayColors: true,
            }
          },
          scales: {
            x: {
              grid: {
                display: false 
              },
              ticks: {
                color: '#6c757d', 
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)' 
              },
              ticks: {
                color: '#6c757d', 
              }
            }
          }
        }
      };
      this.accidentsChart = new Chart(ctx, config);
    }
  }

  private renderSeverityChart() {
    const ctx = document.getElementById('severityChart') as HTMLCanvasElement;
    if (ctx) { 
      const config: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: this.severityData.map(d => d.type),
          datasets: [{
            data: this.severityData.map(d => d.value),
            backgroundColor: [
              '#4cc9f0', // Leves (light blue)
              '#f8961e', // Graves (orange)
              '#f72585'  // Críticos (pink/red)
            ],
            hoverOffset: 10, 
            borderColor: '#ffffff', 
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Allow charts to adapt more freely
          plugins: {
            legend: {
              position: 'right', 
              labels: {
                color: '#6c757d',
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.7)',
              titleColor: '#fff',
              bodyColor: '#fff',
              cornerRadius: 5,
            }
          }
        }
      };
      this.severityChart = new Chart(ctx, config);
    }
  }
}