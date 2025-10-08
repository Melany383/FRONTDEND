import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
// Importa el nuevo guard
import { companyRegisteredGuard, companyRequiredGuard } from './guards/company-registered.guard';

import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';
import { TareasPendientesComponent } from './dashboard/tareas-pendientes/tareas-pendientes.component';
import { AccidentalidadComponent } from './dashboard/accidentalidad/accidentalidad.component';
import { AlertasSeguridadComponent } from './dashboard/alertas-seguridad/alertas-seguridad.component';
import { CapacitacionesComponent } from './dashboard/capacitaciones/capacitaciones.component';
import { ComitesComponent } from './dashboard/comites/comites.component';
import { CumplimientoNormativoComponent } from './dashboard/cumplimiento-normativo/cumplimiento-normativo.component';
import { GestionRiesgosComponent } from './dashboard/gestion-riesgos/gestion-riesgos.component';
import { IndicadoresKpiComponent } from './dashboard/indicadores-kpi/indicadores-kpi.component';
import { InspeccionesComponent } from './dashboard/inspecciones/inspecciones.component';
import { ReportesMedicosComponent } from './dashboard/reportes-medicos/reportes-medicos.component';

import { ConfiguracionEmpresaComponent } from './configuracion-empresa/configuracion-empresa.component';
import { StandardsFormComponent } from './standards-form/standards-form.component';
import { ManagementDocsComponent } from './management-docs/management-docs.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'sociodemografico',
    loadComponent: () => import('./employee-form/employee-form.component').then(m => m.EmployeeFormComponent)

  },
  {
    path: 'matrizes',
    loadComponent: () => import('./work-plan-matrix/work-plan-matrix.component').then(m => m.WorkPlanMatrixComponent)

  },
  {
    path: 'matriz',
    loadComponent: () => import('./matrix-viewer/matrix-viewer.component').then(m => m.MatrixViewerComponent)

  },
  {
    path: 'inicio',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registerform/registerform.component').then(m => m.RegisterformComponent)
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./loginuser/loginuser.component').then(m => m.LoginuserComponent)
  },
  {
    path: 'crear-empresa',
    canActivate: [authGuard, companyRegisteredGuard], // Solo si está autenticado y NO tiene empresa
    loadComponent: () => import('./registercompany/registercompany.component').then(m => m.RegistercompanyComponent)
  },
  {
    path: 'unirse-a-empresa',
    canActivate: [authGuard, companyRegisteredGuard], // Solo si está autenticado y NO tiene empresa
    loadComponent: () => import('./company-code/company-code.component').then(m => m.CompanyCodeComponent)
  },
  {
    path: 'tablero',
    canActivate: [], // Requiere autenticación Y que el usuario tenga una empresa
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'menu', pathMatch: 'full' }, // Cambiado a 'menu' para que sea la ruta por defecto del tablero
      { path: 'menu', component: DashboardHomeComponent },
      { path: 'tareas-pendientes', component: TareasPendientesComponent },
      { path: 'accidentalidad', component: AccidentalidadComponent },
      { path: 'alertas-seguridad', component: AlertasSeguridadComponent },
      { path: 'capacitaciones', component: CapacitacionesComponent },
      { path: 'comites', component: ComitesComponent },
      { path: 'cumplimiento-normativo', component: CumplimientoNormativoComponent },
      { path: 'gestion-riesgos', component: GestionRiesgosComponent },
      { path: 'indicadores-kpi', component: IndicadoresKpiComponent },
      { path: 'inspecciones', component: InspeccionesComponent },
      { path: 'reportes-medicos', component: ReportesMedicosComponent },

      { path: 'configuracion-admin', component: ConfiguracionEmpresaComponent },
      { path: 'estandares', component: StandardsFormComponent },
      { path: 'gestion', component: ManagementDocsComponent },
    ]
  }
];