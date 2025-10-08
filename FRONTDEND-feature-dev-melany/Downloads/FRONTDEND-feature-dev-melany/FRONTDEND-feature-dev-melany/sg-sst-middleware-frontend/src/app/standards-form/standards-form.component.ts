
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangeDetectorRef } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';


import { FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


type CicloPHVA = 'PLANEAR' | 'HACER' | 'VERIFICAR' | 'ACTUAR';
type NivelEvaluacion = 'Crítico' | 'Moderado' | 'Aceptable';

interface StandardItem {
  ciclo: CicloPHVA;
  estandar: string;
  item: string;
  descripcion: string;
  valor: number;
  peso: number;
  cumpleTotalmente?: number;
  noCumple?: boolean;
  noAplica?: boolean;
  soporte?: string;
  calificacion?: number;
  index?: number;
  grupo?: string;
  grupoPeso?: number;
  maxPuntaje?: number;
}

interface EstandarGroup {
  nombre: string;
  items: StandardItem[];
  calificacionEmpresa?: number;
  nivelEvaluacion?: NivelEvaluacion;
}

interface GroupedItem {
  nombre: string;
  estandares: EstandarGroup[];
  isGroup: boolean;
  grupoPeso?: number;
}

interface CicloGroup {
  ciclo: string;
  grupos: GroupedItem[];
}

@Component({
  selector: 'app-standards-form',
  templateUrl: './standards-form.component.html',
  styleUrls: ['./standards-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandardsFormComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  totalScore = 0;
  totalCumpleTotalmente = 0;
  activeSection: CicloPHVA = 'PLANEAR';
  groupedItems: CicloGroup[] = [];
  readonly PHVA_SECTIONS: CicloPHVA[] = ['PLANEAR', 'HACER', 'VERIFICAR', 'ACTUAR'];

  // Datos completos de todos los ciclos PHVA (se mantiene igual)
  standardsData: StandardItem[] = [
    // PLANEAR
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.1',
      descripcion: 'Responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST',
      valor: 0.5,
      peso: 4,
      calificacion: 100
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.2',
      descripcion: 'Responsabilidades en el Sistema de Gestión de Seguridad y Salud en el Trabajo – SG-SST',
      valor: 0.5,
      peso: 4
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.3',
      descripcion: 'Asignación de recursos para el Sistema de Gestión en Seguridad y Salud en el Trabajo – SG-SST',
      valor: 0.5,
      peso: 4,
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.4',
      descripcion: 'Afiliación al Sistema General de Riesgos Laborales',
      valor: 0.5,
      peso: 4
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.5',
      descripcion: 'Pago de pensión trabajadores alto riesgo',
      valor: 0.5,
      peso: 4
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.6',
      descripcion: 'Conformación COPASST / Vigía',
      valor: 0.5,
      peso: 4,
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.7',
      descripcion: 'Capacitación COPASST / Vigía',
      valor: 0.5,
      peso: 4,
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Recursos financieros, técnicos, humanos y de otra índole requeridos para coordinar y desarrollar el Sistema de Gestión de la Seguridad y la Salud en el Trabajo (SG-SST) (4%)',
      item: '1.1.8',
      descripcion: 'Conformación Comité de Convivencia',
      valor: 0.5,
      peso: 4,
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Capacitación en el SG-SST (6%)',
      item: '1.2.1',
      descripcion: 'Programa Capacitación promoción y prevención PYP',
      valor: 2,
      peso: 6,
      calificacion: 100
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Capacitación en el SG-SST (6%)',
      item: '1.2.2',
      descripcion: 'Capacitación, Inducción y Reinducción en SG-SST, actividades de Promoción y Prevención PyP',
      valor: 2,
      peso: 6
    },
    {
      grupo: 'RECURSOS (10%)',
      grupoPeso: 10,
      ciclo: 'PLANEAR',
      estandar: 'Capacitación en el SG-SST (6%)',
      item: '1.2.3',
      descripcion: 'Responsables del SG-SST con curso (50 horas)',
      valor: 2,
      peso: 6
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Política de Seguridad y Salud en el Trabajo (1%)',
      item: '2.1.1',
      descripcion: 'Política del SG-SST firmada, fechada y comunicada al COPASST/Vigía',
      valor: 1,
      peso: 15,
      calificacion: 100
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Objetivos del Sistema de Gestión de la Seguridad y la Salud en el Trabajo SG-SST (1%)',
      item: '2.2.1',
      descripcion: 'Objetivos definidos, claros, medibles, cuantificables, con metas, documentados, revisados del SG-SST',
      valor: 1,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Evaluación inicial del SG-SST (1%)',
      item: '2.3.1',
      descripcion: 'Evaluación e identificación de prioridades',
      valor: 1,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Plan Anual de Trabajo (2%)',
      item: '2.4.1',
      descripcion: 'Plan que identifica objetivos, metas, responsabilidad, recursos con cronograma y firmado',
      valor: 2,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Conservación de la documentación (2%)',
      item: '2.5.1',
      descripcion: 'Archivo o retención documental del SG-SST',
      valor: 2,
      peso: 15,
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Rendición de cuentas (1%)',
      item: '2.6.1',
      descripcion: 'Rendición sobre el desempeño',
      valor: 1,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Normatividad nacional vigente y aplicable en materia de seguridad y salud en el trabajo (2%)',
      item: '2.7.1',
      descripcion: 'Matriz legal',
      valor: 2,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Comunicación (1%)',
      item: '2.8.1',
      descripcion: 'Mecanismos de comunicación, auto reporte en SG-SST',
      valor: 1,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Adquisiciones (1%)',
      item: '2.9.1',
      descripcion: 'Identificación, evaluación, para adquisición de productos y servicios en SG-SST',
      valor: 1,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Contratación (2%)',
      item: '2.10.1',
      descripcion: 'Evaluación y selección de proveedores y contratistas',
      valor: 2,
      peso: 15
    },
    {
      grupo: 'GESTION INTEGRAL DEL SISTEMA DE GESTIÓN DE LA SEGURIDAD Y LA SALUD EN EL TRABAJO (15%)',
      grupoPeso: 15,
      ciclo: 'PLANEAR',
      estandar: 'Gestión del cambio (1%)',
      item: '2.11.1',
      descripcion: 'Evaluación del impacto de cambios internos y externos en el SG-SST',
      valor: 1,
      peso: 15
    },

    // HACER

  // GESTIÓN DE LA SALUD (20%)
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.1',
      descripcion: 'Evaluación Médica Ocupacional',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.2',
      descripcion: 'Actividades de Promoción y Prevención en Salud',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.3',
      descripcion: 'Información al médico de los perfiles de cargo',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.4',
      descripcion: 'Realización de los exámenes médicos ocupacionales: preingreso, periódicos',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.5',
      descripcion: 'Custodia de Historias Clínicas',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.6',
      descripcion: 'Restricciones y recomendaciones médico laborales',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.7',
      descripcion: 'Estilos de vida y entornos saludables (controles tabaquismo, alcoholismo, farmacodependencia y otros)',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.8',
      descripcion: 'Agua potable, servicios sanitarios y disposición de basuras',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Condiciones de salud en el trabajo (9%)',
      item: '3.1.9',
      descripcion: 'Eliminación adecuada de residuos sólidos, líquidos o gaseosos',
      valor: 1,
      peso: 9
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Registro, reporte e investigación de las enfermedades laborales, los incidentes y accidentes del trabajo (5%)',
      item: '3.2.1',
      descripcion: 'Reporte de los accidentes de trabajo y enfermedad laboral a la ARL, EPS y Dirección Territorial del Ministerio de Trabajo',
      valor: 2,
      peso: 5
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Registro, reporte e investigación de las enfermedades laborales, los incidentes y accidentes del trabajo (5%)',
      item: '3.2.2',
      descripcion: 'Investigación de Accidentes, Incidentes y Enfermedad Laboral',
      valor: 2,
      peso: 5
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Registro, reporte e investigación de las enfermedades laborales, los incidentes y accidentes del trabajo (5%)',
      item: '3.2.3',
      descripcion: 'Registro y análisis estadístico de Incidentes, Accidentes de Trabajo y Enfermedad Laboral',
      valor: 1,
      peso: 5
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Mecanismos de vigilancia de las condiciones de salud de los trabajadores (6%)',
      item: '3.3.1',
      descripcion: 'Medición de la severidad de los Accidentes de Trabajo y Enfermedad Laboral',
      valor: 1,
      peso: 6
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Mecanismos de vigilancia de las condiciones de salud de los trabajadores (6%)',
      item: '3.3.2',
      descripcion: 'Medición de la frecuencia de los Incidentes, Accidentes de Trabajo y Enfermedad Laboral',
      valor: 1,
      peso: 6
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Mecanismos de vigilancia de las condiciones de salud de los trabajadores (6%)',
      item: '3.3.3',
      descripcion: 'Medición de la mortalidad de Accidentes de Trabajo y Enfermedad Laboral',
      valor: 1,
      peso: 6
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Mecanismos de vigilancia de las condiciones de salud de los trabajadores (6%)',
      item: '3.3.4',
      descripcion: 'Medición de la prevalencia de incidentes, Accidentes de Trabajo y Enfermedad Laboral',
      valor: 1,
      peso: 6
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Mecanismos de vigilancia de las condiciones de salud de los trabajadores (6%)',
      item: '3.3.5',
      descripcion: 'Medición de la incidencia de Incidentes, Accidentes de Trabajo y Enfermedad Laboral',
      valor: 1,
      peso: 6
  },
  {
      grupo: 'GESTIÓN DE LA SALUD (20%)',
      grupoPeso: 20,
      ciclo: 'HACER',
      estandar: 'Mecanismos de vigilancia de las condiciones de salud de los trabajadores (6%)',
      item: '3.3.6',
      descripcion: 'Medición del ausentismo por incidentes, Accidentes de Trabajo y Enfermedad Laboral',
      valor: 1,
      peso: 6
  },

  // GESTIÓN DE PELIGROS Y RIESGOS (30%)
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Identificación de peligros, evaluación y valoración de riesgos (15%)',
      item: '4.1.1',
      descripcion: 'Metodología para la identificación, evaluación y valoración de peligros',
      valor: 4,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Identificación de peligros, evaluación y valoración de riesgos (15%)',
      item: '4.1.2',
      descripcion: 'Identificación de peligros con participación de todos los niveles de la empresa',
      valor: 4,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Identificación de peligros, evaluación y valoración de riesgos (15%)',
      item: '4.1.3',
      descripcion: 'Identificación y priorización de la naturaleza de los peligros (Metodología adicional, cancerígenos y otros)',
      valor: 3,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Identificación de peligros, evaluación y valoración de riesgos (15%)',
      item: '4.1.4',
      descripcion: 'Realización mediciones ambientales, químicos, físicos y biológicos',
      valor: 4,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Medidas de prevención y control para intervenir los peligros/riesgos (15%)',
      item: '4.2.1',
      descripcion: 'Se implementan las medidas de prevención y control de peligros',
      valor: 2.5,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Medidas de prevención y control para intervenir los peligros/riesgos (15%)',
      item: '4.2.2',
      descripcion: 'Se verifica aplicación de las medidas de prevención y control',
      valor: 2.5,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Medidas de prevención y control para intervenir los peligros/riesgos (15%)',
      item: '4.2.3',
      descripcion: 'Hay procedimientos, instructivos, fichas, protocolos',
      valor: 2.5,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Medidas de prevención y control para intervenir los peligros/riesgos (15%)',
      item: '4.2.4',
      descripcion: 'Inspección con el COPASST o Vigía',
      valor: 2.5,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Medidas de prevención y control para intervenir los peligros/riesgos (15%)',
      item: '4.2.5',
      descripcion: 'Mantenimiento periódico de instalaciones, equipos, máquinas, herramientas',
      valor: 2.5,
      peso: 15
  },
  {
      grupo: 'GESTIÓN DE PELIGROS Y RIESGOS (30%)',
      grupoPeso: 30,
      ciclo: 'HACER',
      estandar: 'Medidas de prevención y control para intervenir los peligros/riesgos (15%)',
      item: '4.2.6',
      descripcion: 'Entrega de Elementos de Protección Personal EPP, se verifica con contratistas y subcontratistas',
      valor: 2.5,
      peso: 15
  },

  // GESTIÓN DE AMENAZAS (10%)
  {
      grupo: 'GESTIÓN DE AMENAZAS (10%)',
      grupoPeso: 10,
      ciclo: 'HACER',
      estandar: 'Plan de prevención, preparación y respuesta ante emergencias (10%)',
      item: '5.1.1',
      descripcion: 'Se cuenta con el Plan de Prevención y Preparación ante emergencias',
      valor: 5,
      peso: 10
  },
  {
      grupo: 'GESTIÓN DE AMENAZAS (10%)',
      grupoPeso: 10,
      ciclo: 'HACER',
      estandar: 'Plan de prevención, preparación y respuesta ante emergencias (10%)',
      item: '5.1.2',
      descripcion: 'Brigada de prevención conformada, capacitada y dotada',
      valor: 5,
      peso: 10
  },

  // VERIFICAR
  {
      grupo: 'VERIFICACIÓN DEL SG-SST (5%)',
      grupoPeso: 5,
      ciclo: 'VERIFICAR',
      estandar: 'Gestión y resultados del SG-SST (5%)',
      item: '6.1.1',
      descripcion: 'Indicadores estructura, proceso y resultado',
      valor: 1.25, // No se especifica el valor en la tabla
      peso: 5
  },
  {
      grupo: 'VERIFICACIÓN DEL SG-SST (5%)',
      grupoPeso: 5,
      ciclo: 'VERIFICAR',
      estandar: 'Gestión y resultados del SG-SST (5%)',
      item: '6.1.2',
      descripcion: 'Las empresa adelanta auditoría por lo menos una vez al año',
      valor: 1.25, // No se especifica el valor en la tabla
      peso: 5
  },
  {
      grupo: 'VERIFICACIÓN DEL SG-SST (5%)',
      grupoPeso: 5,
      ciclo: 'VERIFICAR',
      estandar: 'Gestión y resultados del SG-SST (5%)',
      item: '6.1.3',
      descripcion: 'Revisión anual por la alta dirección, resultados y alcance de la auditoría',
      valor: 1.25, // No se especifica el valor en la tabla
      peso: 5
  },
  {
      grupo: 'VERIFICACIÓN DEL SG-SST (5%)',
      grupoPeso: 5,
      ciclo: 'VERIFICAR',
      estandar: 'Gestión y resultados del SG-SST (5%)',
      item: '6.1.4',
      descripcion: 'Planificar auditoría con el COPASST',
      valor: 1.25, // No se especifica el valor en la tabla
      peso: 5
  },


  // ACTUAR
  {
      grupo: 'MEJORAMIENTO (10%)',
      grupoPeso: 10,
      ciclo: 'ACTUAR',
      estandar: 'Acciones preventivas y correctivas con base en los resultados del SG-SST (10%)',
      item: '7.1.1',
      descripcion: 'Definir acciones de Promoción y Prevención con base en resultados del Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST',
      valor: 2.5,
      peso: 10
  },
  {
      grupo: 'MEJORAMIENTO (10%)',
      grupoPeso: 10,
      ciclo: 'ACTUAR',
      estandar: 'Acciones preventivas y correctivas con base en los resultados del SG-SST (10%)',
      item: '7.1.2',
      descripcion: 'Toma de medidas correctivas, preventivas y de mejora',
      valor: 2.5,
      peso: 10
  },
  {
      grupo: 'MEJORAMIENTO (10%)',
      grupoPeso: 10,
      ciclo: 'ACTUAR',
      estandar: 'Acciones preventivas y correctivas con base en los resultados del SG-SST (10%)',
      item: '7.1.3',
      descripcion: 'Ejecución de acciones preventivas, correctivas y de mejora de la investigación de incidentes, accidentes de trabajo y enfermedad laboral',
      valor: 2.5,
      peso: 10
  },
  {
      grupo: 'MEJORAMIENTO (10%)',
      grupoPeso: 10,
      ciclo: 'ACTUAR',
      estandar: 'Acciones preventivas y correctivas con base en los resultados del SG-SST (10%)',
      item: '7.1.4',
      descripcion: 'Implementar medidas y acciones correctivas de autoridades y de ARL',
      valor: 2.5,
      peso: 10
  }

  ];

  constructor(
    private fb: FormBuilder, 
    private snackBar: MatSnackBar, 
    private cdRef: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      items: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.groupItems();
    this.calculateStandardRatings();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  private initForm(): void {
    this.standardsData.forEach((item, index) => {
      item.index = index;
      this.items.push(this.createItem(item));
    });
    this.calculateTotal();
  }

  private createItem(item: StandardItem): FormGroup {
    return this.fb.group({
      ciclo: [item.ciclo],
      estandar: [item.estandar],
      item: [item.item],
      descripcion: [item.descripcion],
      valor: [item.valor],
      peso: [item.peso],
      maxPuntaje: [item.valor],
      cumpleTotalmente: [
        item.cumpleTotalmente || 0, 
        [Validators.min(0), Validators.max(item.valor)]
      ],
      noAplica: [item.noAplica || false],
      noCumple: [item.noCumple || false],
      soporte: [item.soporte || ''],
      calificacion: [item.calificacion || 0],
      index: [item.index]
    });
  }

  calculateStandardRatings(): void {
    this.groupedItems.forEach(cicloGroup => {
      cicloGroup.grupos.forEach(grupo => {
        grupo.estandares.forEach(estandar => {
          let sumCumpleTotalmente = 0;
          let sumValorTotal = 0;
          
          estandar.items.forEach(item => {
            const formItem = this.items.at(item.index || 0).value;
  
            if (formItem.noAplica) {
              sumCumpleTotalmente += item.valor;
              sumValorTotal += item.valor;
            } else if (!formItem.noCumple) {
              sumCumpleTotalmente += formItem.cumpleTotalmente || 0;
              sumValorTotal += item.valor;
            } else {
              sumValorTotal += item.valor;
            }
          });
  
          estandar.calificacionEmpresa = sumValorTotal > 0 
            ? (sumCumpleTotalmente / sumValorTotal) * 100 
            : 0;
  
          const cal = estandar.calificacionEmpresa;
          estandar.nivelEvaluacion = this.getNivelEvaluacion(cal);
        });
      });
    });
    this.cdRef.markForCheck();
  }

  getNivelEvaluacion(score: number): NivelEvaluacion {
    if (score <= 60) return 'Crítico';
    if (score <= 85) return 'Moderado';
    return 'Aceptable';
  }

  private groupItems(): void {
    const grouped: Record<string, CicloGroup> = {};
    
    // Filtrar por el ciclo activo
    const itemsDelCiclo = this.standardsData.filter(item => item.ciclo === this.activeSection);
    
    itemsDelCiclo.forEach((item) => {
      if (!grouped[item.ciclo]) {
        grouped[item.ciclo] = { ciclo: item.ciclo, grupos: [] };
      }
      
      const cicloGroup = grouped[item.ciclo];
      const grupoNombre = item.grupo || 'Sin Grupo';
      
      let grupo = cicloGroup.grupos.find(g => g.nombre === grupoNombre);
      
      if (!grupo) {
        grupo = {
          nombre: grupoNombre,
          estandares: [],
          isGroup: !!item.grupo,
          grupoPeso: item.grupoPeso
        };
        cicloGroup.grupos.push(grupo);
      }
      
      let estandar = grupo.estandares.find(e => e.nombre === item.estandar);
      if (!estandar) {
        estandar = {
          nombre: item.estandar,
          items: []
        };
        grupo.estandares.push(estandar);
      }
      
      estandar.items.push(item);
    });
    
    this.groupedItems = Object.values(grouped);
    this.cdRef.markForCheck();
  }

  getGroupRowspan(grupo: GroupedItem): number {
    if (!grupo.estandares || grupo.estandares.length === 0) return 0;
    return grupo.estandares.reduce((sum, estandar) => sum + estandar.items.length, 0) + 
           grupo.estandares.length;
  }

  getFormGroupIndex(i: number, j: number, k: number, l: number): number {
    try {
      return this.groupedItems[i].grupos[j].estandares[k].items[l].index ?? 0;
    } catch (error) {
      console.error('Índices inválidos:', i, j, k, l);
      return 0;
    }
  }

  getEstandarRowspan(estandar: EstandarGroup): number {
    return estandar.items.length;
  }

  calculateTotal(): void {
    let total = 0;
    let maxPossible = 0;
    let totalCumple = 0;
  
    this.items.controls.forEach(control => {
      const item = control.value;
      
      if (item.noAplica) {
        total += item.valor * item.peso;
        maxPossible += item.valor * item.peso;
        totalCumple += item.valor;
        return;
      }
  
      if (item.noCumple) {
        maxPossible += item.valor * item.peso;
        return;
      }
  
      const complianceValue = Math.min(item.cumpleTotalmente, item.valor);
      total += complianceValue * item.peso;
      maxPossible += item.valor * item.peso;
      totalCumple += complianceValue;
    });
  
    this.totalScore = maxPossible > 0 ? (total / maxPossible) * 100 : 0;
    this.totalCumpleTotalmente = totalCumple;
    this.cdRef.markForCheck();
  }

  handleNoAplicaChange(event: MatCheckboxChange, index: number): void {
    const itemControl = this.items.at(index);
    const itemValue = itemControl.value;
    const isChecked = event.checked;
    
    if (isChecked) {
      itemControl.patchValue({
        noAplica: true,
        noCumple: false,
        cumpleTotalmente: itemValue.valor,
        calificacion: 100,
        soporte: ''
      });
      
      itemControl.get('cumpleTotalmente')?.disable();
      itemControl.get('noCumple')?.disable();
    } else {
      itemControl.patchValue({
        noAplica: false,
        cumpleTotalmente: 0
      });
      
      itemControl.get('cumpleTotalmente')?.enable();
      itemControl.get('noCumple')?.enable();
    }
    
    this.updateCalculations();
  }

  handleNoCumpleChange(event: MatCheckboxChange, index: number): void {
    const itemControl = this.items.at(index);
    const isChecked = event.checked;
    
    if (isChecked) {
      itemControl.patchValue({
        noCumple: true,
        noAplica: false,
        cumpleTotalmente: 0,
        calificacion: 0,
        soporte: ''
      });
      
      itemControl.get('cumpleTotalmente')?.disable();
      itemControl.get('noAplica')?.disable();
    } else {
      itemControl.get('cumpleTotalmente')?.enable();
      itemControl.get('noAplica')?.enable();
    }
    
    this.updateCalculations();
  }

  onItemChange(index: number): void {
    const itemControl = this.items.at(index);
    const itemValue = itemControl.value;
    
    if (itemValue.noAplica) return;
    
    if (!itemValue.noCumple) {
      const calificacion = (itemValue.cumpleTotalmente / itemValue.valor) * 100;
      itemControl.patchValue({ calificacion });
    }
    
    this.updateCalculations();
  }

  private updateCalculations(): void {
    this.calculateTotal();
    this.calculateStandardRatings();
  }

  setActiveSection(section: CicloPHVA): void {
    this.activeSection = section;
    this.groupItems();
  }
  private showSnackBar(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    });
  }

  private markAllAsTouched(): void {
    this.items.controls.forEach(control => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach(subControl => {
          subControl.markAsTouched();
        });
      } else {
        control.markAsTouched();
      }
    });
  }
  onSubmit(): void {
    if (this.form.invalid) {
      this.showSnackBar('Por favor complete todos los campos requeridos');
      this.markAllAsTouched();
      return;
    }

    if (!this.isFormComplete()) {
      this.showSnackBar('Por favor complete todos los campos de la tabla antes de guardar');
      this.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    
    // Guardar en localStorage (opcional)
    localStorage.setItem('evaluacionSGSST', JSON.stringify(this.form.value));
    
    this.showSnackBar('Evaluación guardada exitosamente');
    this.isLoading = false;
    this.cdRef.markForCheck();
  }

  private isFormComplete(): boolean {
    return this.items.controls.every(control => {
      const value = control.value;
      // Verificar que al menos un campo de evaluación esté completado
      return value.noAplica || value.noCumple || (value.cumpleTotalmente !== null && value.cumpleTotalmente !== undefined);
    });
  }


  
  private addSummarySheet(wb: XLSX.WorkBook): void {
    const summaryData = [
      ['Resumen de Evaluación SG-SST', ''],
      ['Fecha', new Date().toLocaleDateString()],
      ['Sección', this.activeSection],
      ['Progreso Total', `${this.totalScore.toFixed(2)}%`],
      ['Nivel de Evaluación', this.getNivelEvaluacion(this.totalCumpleTotalmente)],
      ['Puntaje Total', this.totalCumpleTotalmente],
      ['', ''],
      ['Detalle por Grupos', '']
    ];
  
    // Añadir datos por grupos
    this.groupedItems.forEach(ciclo => {
      ciclo.grupos.forEach(grupo => {
        const grupoScore = this.calculateGroupScore(grupo);
        summaryData.push([grupo.nombre, `${grupoScore.toFixed(2)}%`]);
      });
    });
  
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Estilos para el resumen
    ws['!cols'] = [{wch: 30}, {wch: 20}];
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
  }
  
  private calculateGroupScore(grupo: GroupedItem): number {
    let total = 0;
    let maxPossible = 0;
    
    grupo.estandares.forEach(estandar => {
      estandar.items.forEach(item => {
        const formItem = this.items.at(item.index || 0).value;
        
        if (formItem.noAplica) {
          total += item.valor * item.peso;
          maxPossible += item.valor * item.peso;
        } else if (!formItem.noCumple) {
          total += (formItem.cumpleTotalmente || 0) * item.peso;
          maxPossible += item.valor * item.peso;
        } else {
          maxPossible += item.valor * item.peso;
        }
      });
    });
  
    return maxPossible > 0 ? (total / maxPossible) * 100 : 0;
  }

  exportToPDF(): void {
    if (!this.isFormComplete()) {
      this.showSnackBar('Complete la evaluación antes de exportar', 'error');
      return;
    }
  
    // Configuración del documento
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm'
    });
  
    // Título del documento
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(`Evaluación de Estándares Mínimos SG-SST - ${this.activeSection}`, 14, 15);
  
    // Información de cabecera
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);
    doc.text(`Progreso: ${this.totalScore.toFixed(2)}% - Nivel: ${this.getNivelEvaluacion(this.totalCumpleTotalmente)}`, 14, 28);
  
    // Preparar datos para la tabla
    const data = this.prepareExportData();
    const tableData = data.map(item => [
      item.grupo || '',
      item.estandar,
      item.item,
      item.descripcion,
      item.valor,
      item.cumpleTotalmente,
      item.noCumple ? 'Sí' : 'No',
      item.noAplica ? 'Sí' : 'No',
      item.soporte || ''
    ]);
  
    // Configuración de la tabla
    autoTable(doc, {
      head: [['Grupo', 'Estándar', 'Ítem', 'Descripción', 'Valor', 'Cumple', 'No Cumple', 'No Aplica', 'Soporte']],
      body: tableData,
      startY: 35,
      margin: { horizontal: 14 },
      styles: {
        cellPadding: 2,
        fontSize: 8,
        valign: 'middle',
        halign: 'left',
        textColor: [40, 40, 40]
      },
      headStyles: {
        fillColor: [47, 85, 151],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 45 },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 15, halign: 'center' },
        8: { cellWidth: 25 }
      },
      didDrawPage: (data) => {
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Página ${data.pageNumber}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10
        );
      }
    });
  
    // Añadir página de resumen
    doc.addPage();
    this.addSummaryPage(doc);
  
    // Guardar el documento
    doc.save(`Evaluacion_SG-SST_${this.activeSection}_${new Date().toISOString().slice(0,10)}.pdf`);
  }
  
  private addSummaryPage(doc: jsPDF): void {
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Evaluación', 14, 20);
  
    // Información general
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sección evaluada: ${this.activeSection}`, 14, 30);
    doc.text(`Fecha de evaluación: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Progreso total: ${this.totalScore.toFixed(2)}%`, 14, 42);
    doc.text(`Nivel de evaluación: ${this.getNivelEvaluacion(this.totalCumpleTotalmente)}`, 14, 48);
  
    // Tabla de resumen por grupos
    const summaryData = this.groupedItems[0].grupos.map(grupo => {
      const score = this.calculateGroupScore(grupo);
      return [
        grupo.nombre,
        `${score.toFixed(2)}%`,
        this.getNivelEvaluacion(score)
      ];
    });
  
    autoTable(doc, {
      head: [['Grupo', 'Puntaje', 'Nivel']],
      body: summaryData,
      startY: 60,
      margin: { horizontal: 14 },
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: 'middle'
      },
      headStyles: {
        fillColor: [47, 85, 151],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' }
      },
      didParseCell: (data) => {
        // Colorear según el nivel
        if (data.column.index === 2) {
          const nivel = data.cell.raw as string;
          if (nivel === 'Crítico') {
            data.cell.styles.fillColor = [255, 205, 210]; // Rojo claro
          } else if (nivel === 'Moderado') {
            data.cell.styles.fillColor = [255, 249, 196]; // Amarillo claro
          } else {
            data.cell.styles.fillColor = [200, 230, 201]; // Verde claro
          }
        }
      }
    });
  }

  private prepareExportData(): any[] {
    return this.items.controls.map(control => {
      const item = control.value;
      return {
        grupo: this.getGrupoForItem(item.index),
        estandar: item.estandar,
        item: item.item,
        descripcion: item.descripcion,
        valor: item.valor,
        peso: item.peso,
        cumpleTotalmente: item.cumpleTotalmente,
        noCumple: item.noCumple,
        noAplica: item.noAplica,
        soporte: item.soporte,
        calificacion: item.calificacion
      };
    });
  }

  private getGrupoForItem(index: number): string {
    for (const ciclo of this.groupedItems) {
      for (const grupo of ciclo.grupos) {
        for (const estandar of grupo.estandares) {
          if (estandar.items.some(item => item.index === index)) {
            return grupo.nombre;
          }
        }
      }
    }
    return '';
  }

  getCellColor(item: any): string {
    if (item.noAplica) return 'transparent';
    if (item.noCumple) return '#ffcdd2'; // Rojo claro
  
    if (item.cumpleTotalmente >= item.valor) {
      return '#c8e6c9'; // Verde claro
    }
  
    const halfValue = item.valor / 2;
    if (item.cumpleTotalmente >= halfValue) {
      return '#fff9c4'; // Amarillo claro
    }
  
    return '#ffebee'; // Rojo muy claro
  }
  
}