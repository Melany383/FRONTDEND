import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface PHVAStep {
  title: string;
  description: string;
  icon: string;
  color: string;
  iconClass: string;
  animationClass: string;
  items: string[];
}

interface Testimonial {
  text: string;
  rating: number;
  name: string;
  position: string;
  image: string;
}



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
            RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {


  // Datos para las características
  features: Feature[] = [
    {
      icon: 'bi-file-earmark-medical',
      title: 'Documentación',
      description: 'Gestión centralizada de todos tus documentos de SST con alertas de vencimiento.'
    },
    {
      icon: 'bi-clipboard2-pulse',
      title: 'Matriz de Riesgos',
      description: 'Identificación y evaluación de riesgos con metodologías validadas.'
    },
    {
      icon: 'bi-people',
      title: 'Capacitaciones',
      description: 'Plataforma de e-learning con cursos obligatorios y seguimiento.'
    }
  ];

  // Datos para el ciclo PHVA
  phvaSteps: PHVAStep[] = [
    {
      title: 'Planear',
      description: 'Identificación de peligros, evaluación de riesgos y planificación de acciones preventivas.',
      icon: 'bi-clipboard2-check',
      color: 'primary',
      iconClass: 'bg-primary text-white',
      animationClass: 'animate__fadeInLeft',
      items: [
        'Establecimiento de políticas y objetivos.',
        'Evaluación inicial de la situación de SST.',
        'Definición de planes de acción y estrategias.'
      ]
    },
    {
      title: 'Hacer',
      description: 'Implementación de controles, capacitaciones y seguimiento de actividades.',
      icon: 'bi-gear',
      color: 'success',
      iconClass: 'bg-success text-white',
      animationClass: 'animate__fadeInRight',
      items: [
        'Formación y sensibilización del personal.',
        'Aplicación de controles operacionales.',
        'Gestión de recursos y asignación de responsabilidades.'
      ]
    },
    {
      title: 'Verificar',
      description: 'Auditorías, inspecciones y análisis de indicadores de desempeño.',
      icon: 'bi-clipboard-data',
      color: 'warning',
      iconClass: 'bg-warning text-dark',
      animationClass: 'animate__fadeInLeft',
      items: [
        'Evaluación del cumplimiento de los objetivos.',
        'Seguimiento de indicadores clave.',
        'Investigación de incidentes y no conformidades.'
      ]
    },
    {
      title: 'Actuar',
      description: 'Mejora continua con acciones correctivas y actualización del sistema.',
      icon: 'bi-arrow-repeat',
      color: 'danger',
      iconClass: 'bg-danger text-white',
      animationClass: 'animate__fadeInRight',
      items: [
        'Implementación de acciones correctivas y preventivas.',
        'Revisión y actualización de planes de acción.',
        'Optimización de procesos para mayor eficiencia.'
      ]
    }
  ];

  // Datos para testimonios
  testimonials: Testimonial[] = [
    {
      text: 'Desde que implementamos Oppy, hemos reducido nuestros incidentes laborales en un 40% y mejorado significativamente nuestro cumplimiento normativo.',
      rating: 5,
      name: 'María González',
      position: 'Gerente de SST, Industrias ABC',
      image: 'https://randomuser.me/api/portraits/women/45.jpg'
    },
    {
      text: 'Oppy nos ha permitido automatizar nuestros reportes y auditorías, ahorrándonos tiempo y recursos.',
      rating: 4.5,
      name: 'Carlos Ramírez',
      position: 'Jefe de Seguridad, Grupo Beta',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      text: 'El soporte de Oppy es excelente. Siempre están dispuestos a ayudar y mejorar la plataforma.',
      rating: 5,
      name: 'Andrea López',
      position: 'Coordinadora de SST, CorpX',
      image: 'https://randomuser.me/api/portraits/women/55.jpg'
    }
  ];


  constructor(private router: Router, private authService: AuthService ) {}
  user = 'Usuario';
  isLoggedIn = false;
  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }
  logout() {
    this.authService.logout();
  }
  



  // Navegación
  openRegisterForm(): void {
    this.router.navigate(['/registro']); 
  }

  openCompanyCode(): void {
    this.router.navigate(['/unirse-a-empresa']); 
  }

  openRegisterCompanyForm(): void {
    this.router.navigate(['/crear-empresa']); 
  }

  // Acciones
  openDemoModal(): void {
    // TODO: Implementar lógica para abrir modal de demo
    console.log('Abrir modal de demo');
    // Ejemplo: this.modalService.open(DemoModalComponent);
  }

  contactSales(): void {
    // TODO: Implementar lógica para contactar a ventas
    console.log('Contactar a ventas');
    // Ejemplo: this.router.navigate(['/contact'], { queryParams: { subject: 'sales' } });
  }

  // Método auxiliar para generar array de estrellas (para ratings)
  generateStars(rating: number): boolean[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return [...Array(5)].map((_, i) => i < fullStars || (i === fullStars && hasHalfStar));
  }

  // Método para verificar estado de autenticación (ejemplo)
  private checkAuthStatus(): void {
    // this.authService.isLoggedIn().subscribe(status => this.isLoggedIn = status);
  }

  
}