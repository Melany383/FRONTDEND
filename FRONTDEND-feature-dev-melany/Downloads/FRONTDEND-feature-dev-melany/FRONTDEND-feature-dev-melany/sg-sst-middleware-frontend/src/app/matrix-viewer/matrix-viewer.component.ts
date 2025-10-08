import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatrixService } from '../services/matrix.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from 'rxjs';

import { jsPDF } from 'jspdf'; 
import 'jspdf-autotable'; 
import { saveAs } from 'file-saver'; // Para descargar archivos

// Interfaz para la estructura completa de una fila de la matriz
export interface MatrixRow {
  id: string; // Para identificar cada fila de forma única
  // Identificación del Riesgo
  actividadCargo: string;
  factorRiesgo: string;
  peligroFuenteFactorRiesgo: string;
  posiblesConsecuencias: string;
  actividadRutinaria: boolean; // Tipo boolean esperado
  actividadNoRutinaria: boolean; // Tipo boolean esperado
  expuestosVinculados: number | null;
  expuestosTemporalesCooperativas: number | null;
  expuestosTotal: number | null;
  horasExposicionDia: number | null;
  fuenteGeneradoraDetalle: string;

  // Controles Existentes
  controlExistenteFuente: string;
  controlExistenteMedio: string;
  controlExistentePersonas: string;
  controlExistenteMetodo: string;

  // Evaluación del Riesgo
  probabilidad: 'Baja' | 'Media' | 'Alta' | '';
  probabilidadNumero: number | null;
  consecuencias: 'Ligeramente Dañino' | 'Dañino' | 'Extremadamente Dañino' | '';
  consecuenciasNumero: number | null;
  estimacionRiesgoGradoVr: number | null;
  interpretacion: string;

  // Planes de Acción
  planEliminacion: string;
  planSustitucion: string;
  planControlesIngenieria: string;
  planControlesAdministrativos: string;
  planEpp: string;
  planNumero: string;
  planVr: string;

  // Campos adicionales
  responsable: string;
  fechaCumplimiento: string;
}

@Component({
  standalone: true,
  selector: 'app-matrix-viewer',
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  templateUrl: './matrix-viewer.component.html',
  styleUrls: ['./matrix-viewer.component.scss']
})
export class MatrixViewerComponent implements OnInit, OnDestroy {
  matrixHtml: SafeHtml | undefined; // Para el contenido del archivo 'Instrucciones formato PFR.html' si decides cargarlo

  riskEntries: MatrixRow[] = [];
  selectedEntry: MatrixRow | null = null;
  showForm: boolean = false;
  showInstructions: boolean = false;

  riskAssessmentForm: FormGroup;
  private formValueChangesSubscription: Subscription | undefined;

  probabilidadOptions = ['Baja', 'Media', 'Alta'];
  consecuenciasOptions = ['Ligeramente Dañino', 'Dañino', 'Extremadamente Dañino'];

  // New property for risk summary
  riskSummary: { [key: string]: { count: number, percentage: number } } = {};

  constructor(
    private matrixService: MatrixService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    this.riskAssessmentForm = this.fb.group({
      id: [''],
      actividadCargo: ['', Validators.required],
      factorRiesgo: ['', Validators.required],
      peligroFuenteFactorRiesgo: ['', Validators.required],
      posiblesConsecuencias: ['', Validators.required],
      actividadRutinaria: [false], // Se inicializa como booleano
      actividadNoRutinaria: [false], // Se inicializa como booleano
      expuestosVinculados: [null],
      expuestosTemporalesCooperativas: [null],
      expuestosTotal: [{ value: null, disabled: true }], // Deshabilitado para que se calcule
      horasExposicionDia: [null],
      fuenteGeneradoraDetalle: [''],

      controlExistenteFuente: [''],
      controlExistenteMedio: [''],
      controlExistentePersonas: [''],
      controlExistenteMetodo: [''],

      probabilidad: ['', Validators.required],
      probabilidadNumero: [{ value: null, disabled: true }],
      consecuencias: ['', Validators.required],
      consecuenciasNumero: [{ value: null, disabled: true }],
      estimacionRiesgoGradoVr: [{ value: null, disabled: true }],
      interpretacion: [{ value: '', disabled: true }],

      planEliminacion: [''],
      planSustitucion: [''],
      planControlesIngenieria: [''],
      planControlesAdministrativos: [''],
      planEpp: [''],
      planNumero: [''],
      planVr: [''],

      responsable: ['', Validators.required],
      fechaCumplimiento: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Si deseas cargar el HTML de las instrucciones desde un archivo externo:
    // Puedes ajustar el MatrixService para que cargue 'Instrucciones formato PFR.html'
    // O simplemente incluir el contenido directamente en el HTML como lo he sugerido.
    // Si lo cargas, asegúrate de que el path sea correcto.
   


    this.initializeRiskEntries();
    this.setupFormValueChanges();
    this.calculateRiskSummary(); // Calculate initial summary
  }

  ngOnDestroy(): void {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }

  toggleInstructions(): void {
    this.showInstructions = !this.showInstructions;
  }

  private setupFormValueChanges(): void {
    this.formValueChangesSubscription = this.riskAssessmentForm.valueChanges.subscribe(values => {
      // Calcular Nro. Expuestos Total
      const expuestosVinculados = values.expuestosVinculados || 0;
      const expuestosTemporalesCooperativas = values.expuestosTemporalesCooperativas || 0;
      const expuestosTotal = expuestosVinculados + expuestosTemporalesCooperativas;
      this.riskAssessmentForm.get('expuestosTotal')?.patchValue(expuestosTotal, { emitEvent: false });

      // Solo recalcular si los campos de probabilidad y consecuencias no están deshabilitados
      // Esto evita cálculos automáticos cuando el formulario está siendo parcheado al seleccionar una fila
      if (!this.riskAssessmentForm.get('probabilidad')?.disabled && !this.riskAssessmentForm.get('consecuencias')?.disabled) {
        this.calculateRiskAssessment(values.probabilidad, values.consecuencias);
      }
    });
  }

  private calculateRiskAssessment(probabilidad: string, consecuencias: string): void {
    let probNum: number | null = null;
    let consNum: number | null = null;

    switch (probabilidad) {
      case 'Baja': probNum = 1; break;
      case 'Media': probNum = 2; break;
      case 'Alta': probNum = 3; break;
    }

    switch (consecuencias) {
      case 'Ligeramente Dañino': consNum = 1; break;
      case 'Dañino': consNum = 2; break;
      case 'Extremadamente Dañino': consNum = 3; break;
    }

    // Usar patchValue con { emitEvent: false } para evitar bucles infinitos
    // ya que este método es llamado por el valueChanges del formulario
    this.riskAssessmentForm.get('probabilidadNumero')?.patchValue(probNum, { emitEvent: false });
    this.riskAssessmentForm.get('consecuenciasNumero')?.patchValue(consNum, { emitEvent: false });

    if (probNum !== null && consNum !== null) {
      const vr = probNum * consNum;
      this.riskAssessmentForm.get('estimacionRiesgoGradoVr')?.patchValue(vr, { emitEvent: false });

      let interpretacion = '';
      if (vr === 1) interpretacion = 'RIESGO TRIVIAL';
      else if (vr === 2) interpretacion = 'RIESGO TOLERABLE';
      else if (vr === 3 || vr === 4) interpretacion = 'RIESGO MODERADO';
      else if (vr === 6) interpretacion = 'RIESGO IMPORTANTE';
      else if (vr === 9) interpretacion = 'RIESGO INTOLERABLE';

      this.riskAssessmentForm.get('interpretacion')?.patchValue(interpretacion, { emitEvent: false });
    } else {
      this.riskAssessmentForm.get('estimacionRiesgoGradoVr')?.patchValue(null, { emitEvent: false });
      this.riskAssessmentForm.get('interpretacion')?.patchValue('', { emitEvent: false });
    }
  }

  // Helper method to safely convert various input types to boolean
  private convertToBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false; // Default for null, undefined, or other non-string/non-boolean types
  }

  private initializeRiskEntries(): void {
    const rawInitialData: Partial<MatrixRow>[] = [
      { actividadCargo: "PERSONAL ADMINISTRATIVO, GERENTE", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Golpes", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "Maquinaria, herramientas, estructuras", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Golpeado por o contra", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "Herramientas manuales.", probabilidad: "Baja", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 1, interpretacion: "RIESGO TRIVIAL" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Caidas a nivel", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "Desplazamiento por las distintas áreas", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Caidas a desnivel", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "Desplazamiento por escalas", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "ERGONOMICO", peligroFuenteFactorRiesgo: "Posición sentado", posiblesConsecuencias: "Fatiga//Trastornos osteomusculares, traumas acumulativos, lumbalgias", fuenteGeneradoraDetalle: "Posición normal de la tarea", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "ERGONOMICO", peligroFuenteFactorRiesgo: "Movimiento repetitivo", posiblesConsecuencias: "Fatiga//Trastornos osteomusculares, traumas acumulativos", fuenteGeneradoraDetalle: "Digitación y uso del mouse", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "FISICOQUIMICO", peligroFuenteFactorRiesgo: "Incendios y explosiones", posiblesConsecuencias: "Lesiones incapacitantes, quemaduras diversas", fuenteGeneradoraDetalle: "Instalaciones electricas,", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "PSICOSOCIAL", peligroFuenteFactorRiesgo: "Cumplimiento de tiempos de entrega, relaciones interpersonales, actividades extralaborales", posiblesConsecuencias: "Estrés y alteración de la conducta.", fuenteGeneradoraDetalle: "Cumplimiento de indicadores, relaciones interpersonales, actividades extralaborales", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "SERVICIOS GENERALES", factorRiesgo: "FISICO", peligroFuenteFactorRiesgo: "Iluminacion deficiente", posiblesConsecuencias: "Fatiga visual, Jaqueca", fuenteGeneradoraDetalle: "Lugar de trabajo,\ncon alta densidad de iluminación.", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "FISICO", peligroFuenteFactorRiesgo: "Ruido", posiblesConsecuencias: "Fatiga auditiva\nJaquecas\nvertigo", fuenteGeneradoraDetalle: "Actividad continua de llamada.", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "QUIMICO", peligroFuenteFactorRiesgo: "Contacto con quimicos de limpieza", posiblesConsecuencias: "Abrasiones, dermatitis", fuenteGeneradoraDetalle: "No utilizar los EPP entregados", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "QUIMICO", peligroFuenteFactorRiesgo: "Salpicadura quimicos de limpieza", posiblesConsecuencias: "Irritaciones o lesiones oculares", fuenteGeneradoraDetalle: "No utilizar los EPP entregados", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Golpes", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "Herramientas manuales.", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Golpeado por o contra", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "Objetos almacenados en partes altas o que vuelan proyectados, cuando esta en la oficina.", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Caidas a nivel", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "Pisos humedos sin señalización", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Caidas a desnivel", posiblesConsecuencias: "Golpes, contusiones, lesiones, fracturas", fuenteGeneradoraDetalle: "No utilizar el pasamanos para subir y bajar escalas", probabilidad: "Alta", consecuencias: "Dañino", estimacionRiesgoGradoVr: 6, interpretacion: "RIESGO IMPORTANTE" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Contacto con objetos corto punzantes", posiblesConsecuencias: "Heridas", fuenteGeneradoraDetalle: "Tijeras, cuchillos", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" },
      { actividadCargo: "", factorRiesgo: "MECANICO", peligroFuenteFactorRiesgo: "Contacto con superficies calientes", posiblesConsecuencias: "Quemaduras", fuenteGeneradoraDetalle: "Greca", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "ERGONOMICO", peligroFuenteFactorRiesgo: "Posición prolongada de pie o sentado prolongado (mas del 70% de la jornada)", posiblesConsecuencias: "Lesiones del sistema musculo esquelético.", fuenteGeneradoraDetalle: "No realizar Pausas activas", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "ELECTRICO", peligroFuenteFactorRiesgo: "Contacto indirecto (con baja)", posiblesConsecuencias: "Quemaduras, electrocución.", fuenteGeneradoraDetalle: "Maquinaria", probabilidad: "Media", consecuencias: "Dañino", estimacionRiesgoGradoVr: 4, interpretacion: "RIESGO MODERADO" },
      { actividadCargo: "", factorRiesgo: "FISICOQUIMICO", peligroFuenteFactorRiesgo: "Incendios", posiblesConsecuencias: "Lesiones incapacitantes, quemaduras diversas", fuenteGeneradoraDetalle: "Maquinas que se dejan encendidas ", probabilidad: "Media", consecuencias: "Ligeramente Dañino", estimacionRiesgoGradoVr: 2, interpretacion: "RIESGO TOLERABLE" }
    ];

    let currentActividadCargo: string = '';
    this.riskEntries = rawInitialData.map(data => {
      const entry: MatrixRow = {
        id: uuidv4(),
        actividadCargo: data.actividadCargo || '',
        factorRiesgo: data.factorRiesgo || '',
        peligroFuenteFactorRiesgo: data.peligroFuenteFactorRiesgo || '',
        posiblesConsecuencias: data.posiblesConsecuencias || '',
        fuenteGeneradoraDetalle: data.fuenteGeneradoraDetalle || '',
        interpretacion: data.interpretacion || '',
        probabilidad: data.probabilidad || '',
        consecuencias: data.consecuencias || '',
        estimacionRiesgoGradoVr: data.estimacionRiesgoGradoVr ?? null,
        probabilidadNumero: data.probabilidadNumero ?? null,
        consecuenciasNumero: data.consecuenciasNumero ?? null,

        // ===>>> INICIO DE LA CORRECCIÓN DE TIPO BOOLEANO MÁS ROBUSTA <<<===
        actividadRutinaria: this.convertToBoolean(data.actividadRutinaria),
        actividadNoRutinaria: this.convertToBoolean(data.actividadNoRutinaria),
        // ===>>> FIN DE LA CORRECCIÓN DE TIPO BOOLEANO MÁS ROBUSTA <<<===

        expuestosVinculados: data.expuestosVinculados ?? null,
        expuestosTemporalesCooperativas: data.expuestosTemporalesCooperativas ?? null,
        expuestosTotal: data.expuestosTotal ?? null,
        horasExposicionDia: data.horasExposicionDia ?? null,
        controlExistenteFuente: data.controlExistenteFuente ?? '',
        controlExistenteMedio: data.controlExistenteMedio ?? '',
        controlExistentePersonas: data.controlExistentePersonas ?? '',
        controlExistenteMetodo: data.controlExistenteMetodo ?? '',
        planEliminacion: data.planEliminacion ?? '',
        planSustitucion: data.planSustitucion ?? '',
        planControlesIngenieria: data.planControlesIngenieria ?? '',
        planControlesAdministrativos: data.planControlesAdministrativos ?? '',
        planEpp: data.planEpp ?? '',
        planNumero: data.planNumero ?? '',
        planVr: data.planVr ?? '',
        responsable: data.responsable ?? '',
        fechaCumplimiento: data.fechaCumplimiento ?? ''
      };

      // Rellenar actividadCargo en blanco con el valor anterior no vacío
      if (entry.actividadCargo === '' && currentActividadCargo !== '') {
        entry.actividadCargo = currentActividadCargo;
      } else if (entry.actividadCargo !== '') {
        currentActividadCargo = entry.actividadCargo;
      }

      // Asegurar que expuestosTotal se calcula también para los datos iniciales
      entry.expuestosTotal = (entry.expuestosVinculados || 0) + (entry.expuestosTemporalesCooperativas || 0);

      return entry;
    });
  }

  addNewEntry(): void {
    this.selectedEntry = null;
    this.riskAssessmentForm.reset();
    this.riskAssessmentForm.get('id')?.setValue(uuidv4());
    // Habilitar los campos para que se puedan seleccionar y calcular
    this.riskAssessmentForm.get('probabilidadNumero')?.enable({ emitEvent: false });
    this.riskAssessmentForm.get('consecuenciasNumero')?.enable({ emitEvent: false });
    this.riskAssessmentForm.get('estimacionRiesgoGradoVr')?.enable({ emitEvent: false });
    this.riskAssessmentForm.get('interpretacion')?.enable({ emitEvent: false });
    this.riskAssessmentForm.get('expuestosTotal')?.enable({ emitEvent: false }); // Habilitar para el cálculo

    this.showForm = true;
  }

  onSelectRow(entry: MatrixRow): void {
    this.selectedEntry = entry;

    // Los valores ya son booleanos gracias a initializeRiskEntries
    this.riskAssessmentForm.patchValue(entry);

    // Asegurarse de que los campos calculados estén deshabilitados para evitar edición manual
    this.riskAssessmentForm.get('probabilidadNumero')?.disable({ emitEvent: false });
    this.riskAssessmentForm.get('consecuenciasNumero')?.disable({ emitEvent: false });
    this.riskAssessmentForm.get('estimacionRiesgoGradoVr')?.disable({ emitEvent: false });
    this.riskAssessmentForm.get('interpretacion')?.disable({ emitEvent: false });
    this.riskAssessmentForm.get('expuestosTotal')?.disable({ emitEvent: false }); // Deshabilitar después de parchar

    this.showForm = true;
  }

  onSaveForm(): void {
    // Habilitar temporalmente los campos deshabilitados para que sus valores sean incluidos en `value`
    // (o usar getRawValue() que obtiene todos los valores, incluidos los deshabilitados)
    this.riskAssessmentForm.get('probabilidadNumero')?.enable();
    this.riskAssessmentForm.get('consecuenciasNumero')?.enable();
    this.riskAssessmentForm.get('estimacionRiesgoGradoVr')?.enable();
    this.riskAssessmentForm.get('interpretacion')?.enable();
    this.riskAssessmentForm.get('expuestosTotal')?.enable(); // Habilitar para obtener el valor calculado

    if (this.riskAssessmentForm.valid) {
      const formData: MatrixRow = this.riskAssessmentForm.getRawValue();

      // Recalcular expuestosTotal antes de guardar, en caso de que los inputs de expuestos se hayan modificado
      formData.expuestosTotal = (formData.expuestosVinculados || 0) + (formData.expuestosTemporalesCooperativas || 0);

      if (this.selectedEntry) {
        const index = this.riskEntries.findIndex(e => e.id === formData.id);
        if (index !== -1) {
          const updatedEntry = { ...this.riskEntries[index], ...formData };
          // Re-aplicar la lógica de rellenado para actividadCargo si el usuario la cambió y dejó en blanco
          if (updatedEntry.actividadCargo === '' && index > 0) {
              let previousNonEmpty = '';
              for(let i = index - 1; i >= 0; i--) {
                if (this.riskEntries[i].actividadCargo !== '') {
                  previousNonEmpty = this.riskEntries[i].actividadCargo;
                  break;
                }
              }
              if (previousNonEmpty !== '') {
                  updatedEntry.actividadCargo = previousNonEmpty;
              }
          }
          this.riskEntries[index] = updatedEntry;
        }
        alert('Evaluación de riesgo actualizada con éxito!');
      } else {
        let tempActividadCargo = formData.actividadCargo;
        if (tempActividadCargo === '' && this.riskEntries.length > 0) {
            let previousNonEmpty = '';
            for(let i = this.riskEntries.length - 1; i >= 0; i--) {
                if (this.riskEntries[i].actividadCargo !== '') {
                   previousNonEmpty = this.riskEntries[i].actividadCargo;
                   break;
                }
            }
            if (previousNonEmpty !== '') {
                formData.actividadCargo = previousNonEmpty;
            }
        }
        this.riskEntries.push(formData);
        alert('Nueva evaluación de riesgo creada con éxito!');
      }

      console.log('Datos guardados:', formData);
      this.onCancelForm();
      this.calculateRiskSummary(); // Recalculate summary after saving
    } else {
      console.warn('El formulario no es válido. Por favor, revisa los campos requeridos.');
      this.markAllAsTouched(this.riskAssessmentForm);
    }

    // Volver a deshabilitar los campos después de obtener los valores
    this.riskAssessmentForm.get('probabilidadNumero')?.disable();
    this.riskAssessmentForm.get('consecuenciasNumero')?.disable();
    this.riskAssessmentForm.get('estimacionRiesgoGradoVr')?.disable();
    this.riskAssessmentForm.get('interpretacion')?.disable();
    this.riskAssessmentForm.get('expuestosTotal')?.disable(); // Deshabilitar nuevamente
  }

  onCancelForm(): void {
    this.showForm = false;
    this.selectedEntry = null;
    this.riskAssessmentForm.reset();
  }

  private markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  getActividadCargoRowspan(currentIndex: number): number {
    if (currentIndex === 0 || this.riskEntries[currentIndex].actividadCargo !== this.riskEntries[currentIndex - 1].actividadCargo) {
      const currentActividadCargo = this.riskEntries[currentIndex].actividadCargo;
      let count = 0;
      for (let i = currentIndex; i < this.riskEntries.length; i++) {
        if (this.riskEntries[i].actividadCargo === currentActividadCargo) {
          count++;
        } else {
          break;
        }
      }
      return count;
    }
    return 0;
  }

  trackByEntryId(index: number, entry: MatrixRow): string {
    return entry.id;
  }

  // Nuevo método para obtener la clase CSS del color de riesgo
  getRiskColorClass(interpretation: string | null): string {
    if (!interpretation) return '';
    const cleanedInterpretation = interpretation.toUpperCase().trim();
    switch (cleanedInterpretation) {
      case 'RIESGO TRIVIAL':
        return 'risk-trivial';
      case 'RIESGO TOLERABLE':
        return 'risk-tolerable';
      case 'RIESGO MODERADO':
        return 'risk-moderado';
      case 'RIESGO IMPORTANTE':
        return 'risk-importante';
      case 'RIESGO INTOLERABLE':
        return 'risk-intolerable';
      default:
        return '';
    }
  }

  // Helper para obtener el color RGB para el PDF
  private getRiskColorForPdf(interpretation: string | null): number[] | null {
    if (!interpretation) return null;
    const cleanedInterpretation = interpretation.toUpperCase().trim();
    switch (cleanedInterpretation) {
      case 'RIESGO TRIVIAL':
        return [144, 238, 144]; // LightGreen
      case 'RIESGO TOLERABLE':
        return [255, 255, 0];   // Yellow
      case 'RIESGO MODERADO':
        return [255, 165, 0];   // Orange
      case 'RIESGO IMPORTANTE':
        return [255, 69, 0];    // Red-Orange
      case 'RIESGO INTOLERABLE':
        return [220, 20, 60];   // Crimson
      default:
        return null;
    }
  }

  // New method to calculate risk summary
  private calculateRiskSummary(): void {
    const summary: { [key: string]: number } = {};
    const totalEntries = this.riskEntries.length;

    this.riskEntries.forEach(entry => {
      if (entry.interpretacion) {
        const interpretation = entry.interpretacion.toUpperCase().trim();
        summary[interpretation] = (summary[interpretation] || 0) + 1;
      }
    });

    this.riskSummary = {};
    const sortedKeys = Object.keys(summary).sort(); // Sort keys for consistent order
    sortedKeys.forEach(key => {
      this.riskSummary[key] = {
        count: summary[key],
        percentage: (summary[key] / totalEntries) * 100
      };
    });
  }

  // Métodos para descargar la tabla

  downloadPdf(): void {
    const doc = new jsPDF('landscape'); // Usar 'landscape' para tablas anchas
    const table = document.querySelector('.risk-table') as HTMLTableElement;

    if (!table) {
      console.error("Tabla no encontrada para exportar a PDF.");
      return;
    }

    // Nueva lógica para PDF: Exportar todos los campos del riskEntries
    const headersForPdf = [
      'Actividad / Cargo', 'Factor de Riesgo', 'Peligro o Fuente', 'Posibles Consecuencias',
      'Act. Rutinaria', 'Act. No Rutinaria', 'Exp. Vinculados', 'Exp. Temp/Coop', 'Exp. Total',
      'Horas Exp./Día', 'Fuente Generadora', 'Control Fuente', 'Control Medio', 'Control Personas',
      'Control Método', 'Probabilidad', 'Prob. Num', 'Consecuencias', 'Cons. Num', 'VR',
      'Interpretación', 'Plan Eliminación', 'Plan Sustitución', 'Plan Ing.',
      'Plan Admin.', 'Plan EPP', 'Plan #', 'Plan VR', 'Responsable', 'Fecha Cumplimiento'
    ];

    const dataForPdf = this.riskEntries.map(entry => [
      entry.actividadCargo,
      entry.factorRiesgo,
      entry.peligroFuenteFactorRiesgo,
      entry.posiblesConsecuencias,
      entry.actividadRutinaria ? 'Sí' : 'No',
      entry.actividadNoRutinaria ? 'Sí' : 'No',
      entry.expuestosVinculados,
      entry.expuestosTemporalesCooperativas,
      entry.expuestosTotal,
      entry.horasExposicionDia,
      entry.fuenteGeneradoraDetalle,
      entry.controlExistenteFuente,
      entry.controlExistenteMedio,
      entry.controlExistentePersonas,
      entry.controlExistenteMetodo,
      entry.probabilidad,
      entry.probabilidadNumero,
      entry.consecuencias,
      entry.consecuenciasNumero,
      entry.estimacionRiesgoGradoVr,
      entry.interpretacion,
      entry.planEliminacion,
      entry.planSustitucion,
      entry.planControlesIngenieria,
      entry.planControlesAdministrativos,
      entry.planEpp,
      entry.planNumero,
      entry.planVr,
      entry.responsable,
      entry.fechaCumplimiento
    ]);

    (doc as any).autoTable({
      head: [headersForPdf],
      body: dataForPdf,
      startY: 10,
      theme: 'grid', // 'striped', 'grid', 'plain'
      styles: {
        fontSize: 6, // Ajustar tamaño de fuente para que quepa más contenido
        cellPadding: 1.5,
        valign: 'middle', // Alineación vertical de las celdas
        halign: 'left', // Alineación horizontal de las celdas
        // wordBreak: 'break-all' // Esto puede ayudar con textos largos
      },
      headStyles: {
        fillColor: [0, 86, 179], // Color de cabecera azul oscuro
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center', // Centrar cabeceras
        fontSize: 7 // Un poco más grande para las cabeceras
      },
      didParseCell: (data: any) => {
        // Colorear celdas de interpretación en el PDF
        if (data.column.index === headersForPdf.indexOf('Interpretación') && data.cell.section === 'body') {
          const interpretation = data.cell.text[0]; // El texto de la celda
          const color = this.getRiskColorForPdf(interpretation);
          if (color) {
            data.cell.styles.fillColor = color;
            data.cell.styles.textColor = [0, 0, 0]; // Texto negro para que se vea bien
          }
        }
      }
    });

    // Add summary table to PDF
    if (Object.keys(this.riskSummary).length > 0) {
      // Calculate where to place the summary table, making sure it doesn't overlap
      let finalY = (doc as any).autoTable.previous.finalY + 20; // 20 units below the main table
      if (finalY > doc.internal.pageSize.height - 50) { // If it's too close to the bottom, add new page
        doc.addPage();
        finalY = 20; // Reset Y for new page
      }

      doc.text("Resumen de la Evaluación de Riesgos", 14, finalY);
      const summaryHeaders = [['Interpretación de Riesgo', 'Cantidad de Ítems', 'Porcentaje']];
      const summaryData = Object.keys(this.riskSummary).map(key => [
        key,
        this.riskSummary[key].count.toString(),
        this.riskSummary[key].percentage.toFixed(2) + '%'
      ]);
      (doc as any).autoTable({
        startY: finalY + 10,
        head: summaryHeaders,
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 86, 179], textColor: 255, fontStyle: 'bold' },
        didParseCell: (data: any) => {
          if (data.column.index === 0 && data.cell.section === 'body') { // Interpretation column
            const interpretation = data.cell.text[0];
            const color = this.getRiskColorForPdf(interpretation);
            if (color) {
              data.cell.styles.fillColor = color;
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        }
      });
    }

    doc.save('matriz_riesgos.pdf');
  }

  downloadExcel(): void {
    const headers = [
      'ID', 'Actividad / Cargo', 'Factor de Riesgo', 'Peligro o Fuente', 'Posibles Consecuencias',
      'Act. Rutinaria', 'Act. No Rutinaria', 'Exp. Vinculados', 'Exp. Temp/Coop', 'Exp. Total',
      'Horas Exp./Día', 'Fuente Generadora', 'Control Fuente', 'Control Medio', 'Control Personas',
      'Control Método', 'Probabilidad', 'Prob. Num', 'Consecuencias', 'Cons. Num', 'VR',
      'Interpretación', 'Plan Eliminacion', 'Plan Sustitucion', 'Plan Ing.',
      'Plan Admin.', 'Plan EPP', 'Plan #', 'Plan VR', 'Responsable', 'Fecha Cumplimiento'
    ];

    let csvContent = headers.map(header => `"${header}"`).join(',') + '\n'; // Encomillar todos los encabezados

    this.riskEntries.forEach(entry => {
      const row = [
        `"${entry.id}"`, // Encomillar para IDs con guiones
        `"${entry.actividadCargo}"`,
        `"${entry.factorRiesgo}"`,
        `"${entry.peligroFuenteFactorRiesgo}"`,
        `"${entry.posiblesConsecuencias}"`,
        `"${entry.actividadRutinaria ? 'Sí' : 'No'}"`,
        `"${entry.actividadNoRutinaria ? 'Sí' : 'No'}"`,
        entry.expuestosVinculados ?? '', // Usar nullish coalescing operator
        entry.expuestosTemporalesCooperativas ?? '',
        entry.expuestosTotal ?? '',
        entry.horasExposicionDia ?? '',
        `"${entry.fuenteGeneradoraDetalle}"`,
        `"${entry.controlExistenteFuente}"`,
        `"${entry.controlExistenteMedio}"`,
        `"${entry.controlExistentePersonas}"`,
        `"${entry.controlExistenteMetodo}"`,
        `"${entry.probabilidad}"`,
        entry.probabilidadNumero ?? '',
        `"${entry.consecuencias}"`,
        entry.consecuenciasNumero ?? '',
        entry.estimacionRiesgoGradoVr ?? '',
        `"${entry.interpretacion}"`,
        `"${entry.planEliminacion}"`,
        `"${entry.planSustitucion}"`,
        `"${entry.planControlesIngenieria}"`,
        `"${entry.planControlesAdministrativos}"`,
        `"${entry.planEpp}"`,
        `"${entry.planNumero}"`,
        `"${entry.planVr}"`,
        `"${entry.responsable}"`,
        `"${entry.fechaCumplimiento}"`
      ].map(field => {
        // Asegurar que los campos con comas o saltos de línea estén correctamente entrecomillados para CSV
        // Y escapar comillas dobles dentro del campo
        const stringField = String(field); // Convertir a string para manejar nulls/numbers
        if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',');
      csvContent += row + '\n';
    });

    // Add summary to CSV
    csvContent += '\n\n"Resumen de la Evaluación de Riesgos"\n';
    csvContent += '"Interpretación de Riesgo","Cantidad de Ítems","Porcentaje"\n';
    for (const key in this.riskSummary) {
      if (this.riskSummary.hasOwnProperty(key)) {
        csvContent += `"${key}",${this.riskSummary[key].count},"${this.riskSummary[key].percentage.toFixed(2)}%"\n`;
      }
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'matriz_riesgos.csv');
  }
}