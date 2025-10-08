import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js'; // 'Chart' is used, so it remains.
import { AuthService } from '../services/auth.service';

// Angular Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Angular Material Modules
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  sidebarCollapsed = false;
  isMobile = false;

  userProfile = {
    name: 'Usuario',
    email: '',
    role: '',
    photo: 'assets/default-avatar.png',
    companyName: '' // Added for company name
  };

  menuItems = [
    { name: 'Menú', icon: 'dashboard', link: '/tablero/menu' },
    { name: 'Tareas', icon: 'task', link: '/tablero/tareas-pendientes' },
    { name: 'Inspecciones', icon: 'search', link: '/tablero/inspecciones' },
    { name: 'Reportes', icon: 'description', link: '/tablero/reportes-medicos' },
    { name: 'Estandares Minimos', icon: 'assignment_turned_in', link: '/tablero/estandares' },
    { name: 'Gestion de Documentos', icon: 'assignment', link: '/tablero/gestion' },
    { name: 'Configuración', icon: 'settings', link: '/tablero/configuracion' },
    { name: 'Configuración Empresa', icon: 'settings', link: '/tablero/configuracion-admin' }
  ];

  constructor(public authService: AuthService) {
    // 💡 'Chart' is used in renderMainChart, so this registration is necessary.
    // No useless instantiation here.
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // Listen for screen size changes
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));

    // Get authenticated user
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // ✅ Using optional chaining for more concise access
        const nombre = user.user_name ?? '';
        const apellido = user.user_last_name ?? '';
        const fullName = `${nombre} ${apellido}`.trim();
        this.userProfile.name = fullName || 'Usuario';
        this.userProfile.email = user.email ?? '';
        this.userProfile.role = user.role ?? '';
        this.userProfile.photo = user.photo ?? 'assets/default-avatar.png';
      } else {
        this.userProfile.name = 'Usuario';
      }
    });

    // Subscribe to user company changes
    this.authService.userCompany$.subscribe(company => {
      // ✅ Using optional chaining for more concise access
      this.userProfile.companyName = company?.company_name ?? '';
    });
  }

  ngAfterViewInit(): void {
    this.renderMainChart();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 992;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  isActive(link: string): boolean {
    return window.location.pathname === link;
  }

  logout(): void {
    this.authService.logout();
  }

  renderMainChart(): void {
    const mainCtx = document.getElementById('main-chart') as HTMLCanvasElement;
    if (mainCtx) {
      new Chart(mainCtx, {
        type: 'line',
        data: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Incidentes',
              data: [12, 19, 8, 7, 5, 9, 6],
              borderColor: '#f72585',
              backgroundColor: 'rgba(247, 37, 133, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Inspecciones',
              data: [18, 22, 25, 24, 28, 30, 27],
              borderColor: '#4361ee',
              backgroundColor: 'rgba(67, 97, 238, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
}