import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeesComponent } from '../employees/employees.component';
import { CommonModule } from '@angular/common';

interface Section {
  id: string;
  label: string;
}

interface CompanyConfig {
  riskPolicy?: string;
  accidentProtocol?: string;
  trainingPlan?: string;
}

@Component({
  selector: 'app-configuracion-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeesComponent],
  templateUrl: './configuracion-empresa.component.html',
  styleUrls: ['./configuracion-empresa.component.scss']
})
export class ConfiguracionEmpresaComponent implements OnInit {
  isAdmin: boolean = false;
  selectedSection: string = 'empleados';
  isLoading: boolean = false;
  
  sections: Section[] = [
    { id: 'empleados', label: 'Empleados' },
    { id: 'riesgos', label: 'Gestión de Riesgos' },
    { id: 'accidentes', label: 'Accidentes' },
    { id: 'capacitaciones', label: 'Capacitaciones' }
  ];

  companyConfig: CompanyConfig = {
    riskPolicy: '',
    accidentProtocol: '',
    trainingPlan: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkRole();
    this.loadConfigData();
  }

  checkRole(): void {
this.authService.currentUser$.subscribe(user => {
  this.isAdmin = user?.role === 'admin';
  if (!this.isAdmin) {
    console.warn('Acceso restringido a administradores');
  }
});

  }

  loadConfigData(): void {
    this.isLoading = true;
    // Simulación de carga de datos
    setTimeout(() => {
      // Aquí iría tu llamada real al backend
      this.companyConfig = {
        riskPolicy: 'Política de riesgos cargada...',
        accidentProtocol: 'Protocolo de accidentes cargado...',
        trainingPlan: 'Plan de capacitación cargado...'
      };
      this.isLoading = false;
    }, 1000);
  }

  selectSection(sectionId: string): void {
    this.selectedSection = sectionId;
  }

  saveConfig(): void {
    this.isLoading = true;
    // Simulación de guardado
    setTimeout(() => {
      console.log('Configuración guardada:', this.companyConfig);
      alert('Configuración guardada exitosamente'); // Temporal, idealmente usar un toast
      this.isLoading = false;
    }, 1000);
  }
}