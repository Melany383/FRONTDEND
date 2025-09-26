import {
  CommonModule,
  NgComponentOutlet
} from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit, 
  ElementRef,    
  ViewChild      
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

// Dashboard Components
import { AccidentalidadComponent } from '../accidentalidad/accidentalidad.component';
import { AlertasSeguridadComponent } from '../alertas-seguridad/alertas-seguridad.component';
import { CapacitacionesComponent } from '../capacitaciones/capacitaciones.component';
import { ComitesComponent } from '../comites/comites.component';
import { CumplimientoNormativoComponent } from '../cumplimiento-normativo/cumplimiento-normativo.component';
import { GestionRiesgosComponent } from '../gestion-riesgos/gestion-riesgos.component';
import { IndicadoresKpiComponent } from '../indicadores-kpi/indicadores-kpi.component';
import { InspeccionesComponent } from '../inspecciones/inspecciones.component';
import { ReportesMedicosComponent } from '../reportes-medicos/reportes-medicos.component';
import { TareasPendientesComponent } from '../tareas-pendientes/tareas-pendientes.component';

import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

interface DashboardWidget {
  id: string;
  title: string;
  icon: string;
  component: any;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgComponentOutlet,

    MatIconModule,
    MatCardModule,
    MatButtonModule,


    IndicadoresKpiComponent,
    AccidentalidadComponent,
    AlertasSeguridadComponent,
    CapacitacionesComponent,
    ComitesComponent,
    CumplimientoNormativoComponent,
    GestionRiesgosComponent,
    InspeccionesComponent,
    ReportesMedicosComponent,
    TareasPendientesComponent
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        opacity: 0,
        transform: 'scale(0.95) translateY(20px)'
      })),
      state('expanded', style({
        opacity: 1,
        transform: 'scale(1) translateY(0)'
      })),
      transition('collapsed => expanded', animate('200ms ease-out')),
      transition('expanded => collapsed', animate('150ms ease-in'))
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  userFullName: string = 'Usuario';
  expandedCard: string | null = null;
  private lastFocusedCardId: string | null = null; // To store the ID of the card that was clicked

  @ViewChild('closeButton') closeButton!: ElementRef; // Reference to close button (if using template variable #closeButton)

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const nombre = user.user_name || '';
        const apellido = user.user_last_name || '';
        this.userFullName = `${nombre} ${apellido}`.trim();
      } else {
        this.userFullName = 'Usuario';
      }
    });
  }

  ngAfterViewInit(): void {
    // No specific actions needed here for now, but kept for potential future use.
  }

  widgets: DashboardWidget[] = [
    { id: 'accidentalidad', title: 'Accidentalidad', icon: 'warning', component: AccidentalidadComponent },
    { id: 'alertas', title: 'Alertas de Seguridad', icon: 'notifications', component: AlertasSeguridadComponent },
    { id: 'capacitaciones', title: 'Capacitaciones', icon: 'school', component: CapacitacionesComponent },
    { id: 'comites', title: 'Comités', icon: 'groups', component: ComitesComponent },
    { id: 'cumplimiento', title: 'Cumplimiento Normativo', icon: 'gavel', component: CumplimientoNormativoComponent }, // Changed icon to 'gavel'
    { id: 'riesgos', title: 'Gestión de Riesgos', icon: 'dangerous', component: GestionRiesgosComponent }, // Changed icon to 'dangerous'
    { id: 'inspecciones', title: 'Inspecciones', icon: 'search', component: InspeccionesComponent },
    { id: 'reportes', title: 'Reportes Médicos', icon: 'medical_services', component: ReportesMedicosComponent },
    { id: 'tareas', title: 'Tareas Pendientes', icon: 'task', component: TareasPendientesComponent }
  ];

  get expandedWidget(): DashboardWidget | null {
    return this.widgets.find(w => w.id === this.expandedCard) || null;
  }

  trackByWidgetId(index: number, widget: DashboardWidget): string {
    return widget.id;
  }

  getWidgetIcon(widgetId: string): string {
    // This function is kept for consistency but might not be directly used if you bind `widget.icon` directly in HTML.
    // Ensure Material Icons font is loaded globally for these string names to render correctly.
    return this.widgets.find(w => w.id === widgetId)?.icon || 'help';
  }

  expandCard(cardId: string): void {
    this.lastFocusedCardId = cardId; // Store the ID of the clicked card
    this.expandedCard = cardId;
    setTimeout(() => {
      // Scroll to the top of the overlay content
      document.querySelector('.overlay-content')?.scrollTo(0, 0);

      // Focus the close button for accessibility
      const closeButton = document.querySelector('.overlay-header button') as HTMLElement;
      if (closeButton) {
        closeButton.focus();
      }
    }, 10);
  }

  closeCard(event: Event): void {
    event.stopPropagation();
    this.expandedCard = null;

    // After closing, return focus to the card that opened the overlay
    if (this.lastFocusedCardId) {
      setTimeout(() => { // Small delay to allow DOM to update after animation
        const previouslyExpandedCard = document.querySelector(`[data-widget-id="${this.lastFocusedCardId}"]`) as HTMLElement;
        if (previouslyExpandedCard) {
          previouslyExpandedCard.focus();
        }
        this.lastFocusedCardId = null; // Clear the stored ID
      }, 150); // Match or slightly exceed the close animation duration
    }
  }
}