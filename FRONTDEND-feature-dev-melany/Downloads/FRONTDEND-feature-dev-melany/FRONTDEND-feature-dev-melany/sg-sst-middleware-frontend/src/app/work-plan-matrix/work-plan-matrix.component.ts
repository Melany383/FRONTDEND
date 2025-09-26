import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { PlanDeTrabajo, Actividad, ActivityCategory, ObjetivoEspecifico, Resource, MonthlyCompliance } from '../models/plan.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}



@Component({
  selector: 'app-work-plan-matrix',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './work-plan-matrix.component.html',
  styleUrls: ['./work-plan-matrix.component.scss']
})
export class WorkPlanMatrixComponent implements OnInit, OnDestroy {
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  planForm!: FormGroup;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;
  private activitySubscriptionsMap: Map<AbstractControl, Subscription[]> = new Map();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPlanData();
    this.recalculateAllCompliances();
  }

  ngOnDestroy(): void {
    this.activitySubscriptionsMap.forEach(subscriptions => {
      subscriptions.forEach(sub => sub.unsubscribe());
    });
    this.activitySubscriptionsMap.clear();
  }

  initForm(): void {
    const currentYear = new Date().getFullYear().toString();
    const currentDate = new Date().toLocaleDateString('es-CO');

    this.planForm = this.fb.group({
      // These values are now empty strings to remove simulated/hardcoded data
      codigo: [''],
      version: [''],
      fecha: [currentDate], // This can remain as it uses current date
      identificacionProcesoArea: ['', Validators.required],
      periodoEjecucionInicio: [`${currentYear}-01-01`, Validators.required],
      periodoEjecucionFin: [`${currentYear}-12-31`, Validators.required],
      responsableProcesoArea: ['', Validators.required],
      objetivoGeneral: ['', Validators.required],
      objetivosEspecificos: this.fb.array([]),
      resourcesAssigned: this.fb.array([
        this.fb.group({ type: 'HUMANOS', detail: '' }),
        this.fb.group({ type: 'TECNICOS', detail: '' }),
        this.fb.group({ type: 'FINANCIEROS', detail: '' }),
        this.fb.group({ type: 'LOCATIVOS', detail: '' }),
      ]),
      monthlyCompliance: this.fb.array([]),
      firmas: this.fb.group({
        gerenteGeneral: [''],
        responsableSGSST: [''],
        fechaActualizacion: [''], // Removed currentDate for this field
        licenciaSGSST: ['']
      })
    });

    this.initializeMonthlyCompliance();
  }

  private initializeMonthlyCompliance(): void {
    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const monthlyData: MonthlyCompliance[] = monthNames.map(month => ({
      month: month,
      activitiesToDevelop: 0,
      activitiesExecuted: 0,
      result: 0,
      meta: 90
    }));

    monthlyData.push({ month: 'TOTAL', activitiesToDevelop: 0, activitiesExecuted: 0, result: 0, meta: 90 });

    const monthlyComplianceArray = this.planForm.get('monthlyCompliance') as FormArray;
    monthlyComplianceArray.clear();
    monthlyData.forEach(m => monthlyComplianceArray.push(this.fb.group(m)));
  }

  loadPlanData(): void {
    // All example/simulated data has been removed from here.
    // The form will now initialize with empty arrays for objectives, categories, and activities.
  }

  // createSampleActivity() method has been removed as it's no longer needed for loading simulated data.

  // Getters para los FormArrays
  get objetivosEspecificos(): FormArray {
    return this.planForm.get('objetivosEspecificos') as FormArray;
  }

  get resourcesAssigned(): FormArray {
    return this.planForm.get('resourcesAssigned') as FormArray;
  }

  get monthlyCompliance(): FormArray {
    return this.planForm.get('monthlyCompliance') as FormArray;
  }

  get firmasFormGroup(): FormGroup {
    return this.planForm.get('firmas') as FormGroup;
  }

  // Métodos para manejar Objetivos Específicos
  createObjetivoEspecificoFormGroup(objetivo: ObjetivoEspecifico | null = null): FormGroup {
    const group = this.fb.group({
      nombre: [objetivo?.nombre || 'Nuevo Objetivo', Validators.required],
      categories: this.fb.array([]),
      compliancePercentage: [objetivo?.compliancePercentage || 0]
    });

    if (objetivo?.categories) {
      objetivo.categories.forEach(cat => {
        this.addActivityCategoryToObjetivo(group, cat);
      });
    } else {
      this.addActivityCategoryToObjetivo(group);
    }

    return group;
  }

  addObjetivoEspecifico(objetivo: ObjetivoEspecifico | null = null): void {
    const newObjetivoGroup = this.createObjetivoEspecificoFormGroup(objetivo);
    this.objetivosEspecificos.push(newObjetivoGroup);
    this.recalculateAllCompliances();
  }

  removeObjetivoEspecifico(index: number): void {
    if (confirm('¿Eliminar este objetivo y todas sus categorías y actividades?')) {
      const objetivoToRemove = this.objetivosEspecificos.at(index);
      this.cleanupObjetivoSubscriptions(objetivoToRemove);
      this.objetivosEspecificos.removeAt(index);
      this.showMessage('Objetivo eliminado', 'success');
      this.recalculateAllCompliances();
    }
  }

  private cleanupObjetivoSubscriptions(objetivoGroup: AbstractControl): void {
    const categories = objetivoGroup.get('categories') as FormArray;
    categories.controls.forEach(categoryControl => {
      const activities = categoryControl.get('activities') as FormArray;
      activities.controls.forEach(activityControl => {
        this.unsubscribeFromActivityChanges(activityControl);
      });
    });
  }

  // Métodos para manejar Categorías
  getCategoriesForObjetivo(objetivoGroup: AbstractControl): FormArray {
    return objetivoGroup.get('categories') as FormArray;
  }

  createActivityCategoryFormGroup(category: ActivityCategory | null = null): FormGroup {
    const group = this.fb.group({
      name: [category?.name || 'Nueva Categoría', Validators.required],
      activities: this.fb.array([]),
      compliancePercentage: [category?.compliancePercentage || 0]
    });

    if (category?.activities) {
      category.activities.forEach(act => {
        this.addActividadToCategory(group, act);
      });
    } else {
      this.addActividadToCategory(group);
    }

    return group;
  }

  addActivityCategoryToObjetivo(objetivoGroup: AbstractControl, category: ActivityCategory | null = null): void {
    const categories = this.getCategoriesForObjetivo(objetivoGroup);
    const newCategoryGroup = this.createActivityCategoryFormGroup(category);
    categories.push(newCategoryGroup);
    this.recalculateAllCompliances();
  }

  removeActivityCategoryFromObjetivo(objetivoGroup: AbstractControl, categoryIndex: number): void {
    if (confirm('¿Eliminar esta categoría y todas sus actividades?')) {
      const categoryToRemove = this.getCategoriesForObjetivo(objetivoGroup).at(categoryIndex);
      this.cleanupCategorySubscriptions(categoryToRemove);
      this.getCategoriesForObjetivo(objetivoGroup).removeAt(categoryIndex);
      this.showMessage('Categoría eliminada', 'success');
      this.recalculateAllCompliances();
    }
  }

  private cleanupCategorySubscriptions(categoryGroup: AbstractControl): void {
    const activities = categoryGroup.get('activities') as FormArray;
    activities.controls.forEach(activityControl => {
      this.unsubscribeFromActivityChanges(activityControl);
    });
  }

  // Métodos para manejar Actividades
  getActivitiesForCategory(categoryGroup: AbstractControl): FormArray {
    return categoryGroup.get('activities') as FormArray;
  }

  createActividadFormGroup(actividad: Actividad | null = null): FormGroup {
    const formGroup = this.fb.group({
      // Removed 'objetivoEspecifico' as per new requirements for PDF table
      actividadTarea: [actividad?.actividadTarea || '', Validators.required],
      requisitoLegal: [actividad?.requisitoLegal || ''],
      responsableActividad: [actividad?.responsableActividad || '', Validators.required],
      presupuestoActividad: [actividad?.presupuestoActividad || ''],
      registroEvidencia: [actividad?.registroEvidencia || ''],
      eneExecuted: [actividad?.eneExecuted || false],
      febExecuted: [actividad?.febExecuted || false],
      marExecuted: [actividad?.marExecuted || false],
      abrExecuted: [actividad?.abrExecuted || false],
      mayExecuted: [actividad?.mayExecuted || false],
      junExecuted: [actividad?.junExecuted || false],
      julExecuted: [actividad?.julExecuted || false],
      agoExecuted: [actividad?.agoExecuted || false],
      sepExecuted: [actividad?.sepExecuted || false],
      octExecuted: [actividad?.octExecuted || false],
      novExecuted: [actividad?.novExecuted || false],
      dicExecuted: [actividad?.dicExecuted || false],
      enePlanned: [actividad?.enePlanned || false],
      febPlanned: [actividad?.febPlanned || false],
      marPlanned: [actividad?.marPlanned || false],
      abrPlanned: [actividad?.abrPlanned || false],
      mayPlanned: [actividad?.mayPlanned || false],
      junPlanned: [actividad?.junPlanned || false],
      julPlanned: [actividad?.julPlanned || false],
      agoPlanned: [actividad?.agoPlanned || false],
      sepPlanned: [actividad?.sepPlanned || false],
      octPlanned: [actividad?.octPlanned || false],
      novPlanned: [actividad?.novPlanned || false],
      dicPlanned: [actividad?.dicPlanned || false],
      porcentajeCumplimientoActividad: [actividad?.porcentajeCumplimientoActividad || 0],
      observaciones: [actividad?.observaciones || ''],
      estado: [actividad?.estado || 'No Iniciado'],
      // Removed date and resource fields as per new requirements for PDF table
      // fechaInicio: [actividad?.fechaInicio || ''],
      // fechaFin: [actividad?.fechaFin || ''],
      // recursosHumanos: [actividad?.recursosHumanos || ''],
      // recursosFisicos: [actividad?.recursosFisicos || ''],
      // recursosTecnologicos: [actividad?.recursosTecnologicos || ''],
      // indicadorMeta: [actividad?.indicadorMeta || ''],
      // fechaSeguimiento: [actividad?.fechaSeguimiento || ''],
      accionesMejora: [actividad?.accionesMejora || '']
    });

    this.subscribeToActivityChanges(formGroup);
    this.calculateActivityCompliance(formGroup);
    return formGroup;
  }

  addActividadToCategory(categoryGroup: AbstractControl, actividad: Actividad | null = null): void {
    const activities = this.getActivitiesForCategory(categoryGroup);
    const newActivityGroup = this.createActividadFormGroup(actividad);
    activities.push(newActivityGroup);
    this.recalculateAllCompliances();
  }

  removeActividadFromCategory(categoryGroup: AbstractControl, activityIndex: number): void {
    if (confirm('¿Eliminar esta actividad?')) {
      const activityToRemove = this.getActivitiesForCategory(categoryGroup).at(activityIndex);
      this.unsubscribeFromActivityChanges(activityToRemove);
      this.getActivitiesForCategory(categoryGroup).removeAt(activityIndex);
      this.showMessage('Actividad eliminada', 'success');
      this.recalculateAllCompliances();
    }
  }

  // Manejo de suscripciones a cambios en actividades
  subscribeToActivityChanges(activityGroup: FormGroup): void {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const subscriptionsForGroup: Subscription[] = [];

    months.forEach(month => {
      const plannedControl = activityGroup.get(`${month}Planned`);
      const executedControl = activityGroup.get(`${month}Executed`);

      if (plannedControl && executedControl) {
        // Suscripción a cambios en P (Planeado)
        subscriptionsForGroup.push(
          plannedControl.valueChanges.subscribe((isPlanned: boolean) => {
            if (!isPlanned) {
              executedControl.setValue(false, { emitEvent: false });
            }
            this.calculateActivityCompliance(activityGroup);
            this.recalculateAllCompliances();
          })
        );

        // Suscripción a cambios en E (Ejecutado)
        subscriptionsForGroup.push(
          executedControl.valueChanges.subscribe((isExecuted: boolean) => {
            if (isExecuted && !plannedControl.value) {
              executedControl.setValue(false, { emitEvent: false });
              this.showMessage('No se puede marcar como ejecutado un mes no planeado', 'error');
            }
            this.calculateActivityCompliance(activityGroup);
            this.recalculateAllCompliances();
          })
        );
      }
    });

    // Removed subscriptions to fechaInicio and fechaFin as these fields are no longer in the form group for activities
    // subscriptionsForGroup.push(
    //   activityGroup.get('fechaInicio')?.valueChanges.subscribe(() => {
    //     this.updatePlannedMonthsBasedOnDates(activityGroup);
    //   }) || new Subscription()
    // );

    // subscriptionsForGroup.push(
    //   activityGroup.get('fechaFin')?.valueChanges.subscribe(() => {
    //     this.updatePlannedMonthsBasedOnDates(activityGroup);
    //   }) || new Subscription()
    // );

    this.activitySubscriptionsMap.set(activityGroup, subscriptionsForGroup);
  }

  // updatePlannedMonthsBasedOnDates method is no longer needed as fechaInicio/fechaFin are removed
  // private updatePlannedMonthsBasedOnDates(activityGroup: FormGroup): void {
  //   const fechaInicio = activityGroup.get('fechaInicio')?.value;
  //   const fechaFin = activityGroup.get('fechaFin')?.value;

  //   if (!fechaInicio || !fechaFin) return;

  //   const startDate = new Date(fechaInicio);
  //   const endDate = new Date(fechaFin);

  //   if (startDate > endDate) {
  //     this.showMessage('La fecha de inicio no puede ser mayor a la fecha fin', 'error');
  //     return;
  //   }

  //   const monthMap = {
  //     0: 'ene', 1: 'feb', 2: 'mar', 3: 'abr', 4: 'may', 5: 'jun',
  //     6: 'jul', 7: 'ago', 8: 'sep', 9: 'oct', 10: 'nov', 11: 'dic'
  //   };

  //   // Reset all planned months
  //   Object.values(monthMap).forEach(month => {
  //     activityGroup.get(`${month}Planned`)?.setValue(false, { emitEvent: false });
  //     activityGroup.get(`${month}Executed`)?.setValue(false, { emitEvent: false });
  //   });

  //   // Set planned months based on date range
  //   const currentDate = new Date(startDate);
  //   while (currentDate <= endDate) {
  //     const month = monthMap[currentDate.getMonth() as keyof typeof monthMap];
  //     activityGroup.get(`${month}Planned`)?.setValue(true, { emitEvent: false });
  //     currentDate.setMonth(currentDate.getMonth() + 1);
  //   }

  //   this.calculateActivityCompliance(activityGroup);
  //   this.recalculateAllCompliances();
  // }

  private unsubscribeFromActivityChanges(activityGroup: AbstractControl): void {
    const subscriptions = this.activitySubscriptionsMap.get(activityGroup);
    if (subscriptions) {
      subscriptions.forEach(sub => sub.unsubscribe());
      this.activitySubscriptionsMap.delete(activityGroup);
    }
  }

  // Cálculos de cumplimiento
  calculateActivityCompliance(activityGroup: FormGroup): void {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    let plannedMonthsCount = 0;
    let executedPlannedMonthsCount = 0;

    months.forEach(month => {
      const isPlanned = activityGroup.get(`${month}Planned`)?.value;
      const isExecuted = activityGroup.get(`${month}Executed`)?.value;

      if (isPlanned) {
        plannedMonthsCount++;
        if (isExecuted) {
          executedPlannedMonthsCount++;
        }
      }
    });

    let compliancePercentage = 0;
    if (plannedMonthsCount > 0) {
      compliancePercentage = Math.round((executedPlannedMonthsCount / plannedMonthsCount) * 100);
    }

    activityGroup.get('porcentajeCumplimientoActividad')?.setValue(compliancePercentage, { emitEvent: false });
    this.updateEstado(activityGroup, compliancePercentage);
  }

  updateEstado(activityGroup: FormGroup, cumplimiento?: number): void {
    const currentCumplimiento = cumplimiento !== undefined ? cumplimiento : activityGroup.get('porcentajeCumplimientoActividad')?.value;
    let estado = 'No Iniciado';

    if (currentCumplimiento === 100) {
      estado = 'Finalizado';
    } else if (currentCumplimiento > 0 && currentCumplimiento < 100) {
      estado = 'En Ejecución';
    } else {
      // Verificar si hay meses planeados en el futuro
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const currentMonth = new Date().getMonth();
      const hasFuturePlannedMonths = months.some((month, index) => {
        return index > currentMonth && activityGroup.get(`${month}Planned`)?.value;
      });

      estado = hasFuturePlannedMonths ? 'Pendiente' : 'No Iniciado';
    }

    activityGroup.get('estado')?.setValue(estado, { emitEvent: false });
  }

  recalculateAllCompliances(): void {
    // 1. Calcular cumplimiento de cada actividad
    this.objetivosEspecificos.controls.forEach(objetivoGroup => {
      this.getCategoriesForObjetivo(objetivoGroup).controls.forEach(categoryGroup => {
        this.getActivitiesForCategory(categoryGroup).controls.forEach(activityGroup => {
          this.calculateActivityCompliance(activityGroup as FormGroup);
        });
      });
    });

    // 2. Calcular cumplimiento de categorías
    this.objetivosEspecificos.controls.forEach(objetivoGroup => {
      this.getCategoriesForObjetivo(objetivoGroup).controls.forEach(categoryGroup => {
        const activities = this.getActivitiesForCategory(categoryGroup).controls;
        const totalActivities = activities.length;
        let totalCompliance = 0;

        activities.forEach(activityControl => {
          totalCompliance += activityControl.get('porcentajeCumplimientoActividad')?.value || 0;
        });

        const compliance = totalActivities > 0 ? Math.round(totalCompliance / totalActivities) : 0;
        categoryGroup.get('compliancePercentage')?.setValue(compliance, { emitEvent: false });
      });
    });

    // 3. Calcular cumplimiento de objetivos
    this.objetivosEspecificos.controls.forEach(objetivoGroup => {
      const categories = this.getCategoriesForObjetivo(objetivoGroup).controls;
      let totalCompliance = 0;
      let totalCategories = 0;

      categories.forEach(categoryControl => {
        totalCompliance += categoryControl.get('compliancePercentage')?.value || 0;
        totalCategories++;
      });

      const compliance = totalCategories > 0 ? Math.round(totalCompliance / totalCategories) : 0;
      objetivoGroup.get('compliancePercentage')?.setValue(compliance, { emitEvent: false });
    });

    // 4. Calcular cumplimiento mensual
    this.recalculateMonthlyCompliance();
  }

  recalculateMonthlyCompliance(): void {
    const monthKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const newMonthlyComplianceData: MonthlyCompliance[] = monthNames.map(month => ({
      month: month,
      activitiesToDevelop: 0,
      activitiesExecuted: 0,
      result: 0,
      meta: 90
    }));

    let overallTotalActivitiesToDevelop = 0;
    let overallTotalActivitiesExecuted = 0;

    // Contar actividades planeadas y ejecutadas por mes
    this.objetivosEspecificos.controls.forEach(objetivoGroup => {
      this.getCategoriesForObjetivo(objetivoGroup).controls.forEach(categoryGroup => {
        this.getActivitiesForCategory(categoryGroup).controls.forEach(activityGroup => {
          monthKeys.forEach((monthKey, index) => {
            const monthData = newMonthlyComplianceData[index];
            const plannedFlag = activityGroup.get(`${monthKey}Planned`)?.value;
            const executedFlag = activityGroup.get(`${monthKey}Executed`)?.value;

            if (plannedFlag) {
              monthData.activitiesToDevelop++;
              overallTotalActivitiesToDevelop++;
            }
            if (plannedFlag && executedFlag) {
              monthData.activitiesExecuted++;
              overallTotalActivitiesExecuted++;
            }
          });
        });
      });
    });

    // Calcular porcentajes
    newMonthlyComplianceData.forEach(monthData => {
      monthData.result = monthData.activitiesToDevelop > 0
        ? Math.round((monthData.activitiesExecuted / monthData.activitiesToDevelop) * 100)
        : 0;
    });

    // Datos para el total
    const totalMonthData: MonthlyCompliance = {
      month: 'TOTAL',
      activitiesToDevelop: overallTotalActivitiesToDevelop,
      activitiesExecuted: overallTotalActivitiesExecuted,
      result: overallTotalActivitiesToDevelop > 0
        ? Math.round((overallTotalActivitiesExecuted / overallTotalActivitiesToDevelop) * 100)
        : 0,
      meta: 90
    };

    // Actualizar el FormArray
    const monthlyComplianceArray = this.planForm.get('monthlyCompliance') as FormArray;
    monthlyComplianceArray.clear();
    newMonthlyComplianceData.forEach(m => monthlyComplianceArray.push(this.fb.group(m)));
    monthlyComplianceArray.push(this.fb.group(totalMonthData));
  }

  // Métodos auxiliares
  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = null;
      this.messageType = null;
    }, 5000);
  }

  getMonthlyMetricValue(month: string, metric: keyof MonthlyCompliance): number | undefined {
    const monthDataControl = (this.monthlyCompliance.controls as FormGroup[]).find(c => c.get('month')?.value === month);
    return monthDataControl?.get(metric)?.value;
  }

  savePlan(): void {
    if (this.planForm.valid) {
      const planDeTrabajo: PlanDeTrabajo = this.planForm.value;
      console.log('Plan a guardar:', planDeTrabajo);
      this.showMessage('Plan guardado correctamente', 'success');

      // Aquí iría la lógica para guardar en backend
      // Ejemplo: this.planService.savePlan(planDeTrabajo).subscribe(...)
    } else {
      this.showMessage('Por favor complete todos los campos requeridos', 'error');
      this.markAllAsTouched(this.planForm);
    }
  }

  private markAllAsTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  /**
   * Genera un PDF estructurado con la información del plan de trabajo.
   * Utiliza jspdf-autotable para un mejor formato de tablas.
   */
  generatePdf(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yOffset = 10;

    try {
      yOffset = this.addPdfHeader(doc, yOffset);
      yOffset = this.addGeneralObjective(doc, yOffset);
      yOffset = this.addSpecificObjectivesAndActivities(doc, yOffset);

      doc.addPage();
      yOffset = 10; // Reset yOffset for new page
      yOffset = this.addResourcesAssigned(doc, yOffset);
      yOffset = this.addMonthlyCompliance(doc, yOffset);

      doc.addPage();
      yOffset = 10; // Reset yOffset for new page
      yOffset = this.addSignatures(doc, yOffset);

      this.addPageNumbers(doc);

      doc.save('plan_de_trabajo_estructurado.pdf');
      this.showMessage('PDF estructurado generado correctamente', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.showMessage('Error al generar el PDF. Intente nuevamente.', 'error');
    }
  }

  private addPdfHeader(doc: jsPDF, yOffset: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PLAN DE TRABAJO Y MEJORAMIENTO', doc.internal.pageSize.width / 2, yOffset, { align: 'center' });
    yOffset += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const headerInfo = this.planForm.value;
    doc.text(`Código: ${headerInfo.codigo || 'N/A'}`, 10, yOffset);
    doc.text(`Versión: ${headerInfo.version || 'N/A'}`, 60, yOffset);
    doc.text(`Fecha: ${headerInfo.fecha || 'N/A'}`, 110, yOffset);
    yOffset += 7;
    doc.text(`Proceso/Área: ${headerInfo.identificacionProcesoArea || 'N/A'}`, 10, yOffset);
    doc.text(`Responsable: ${headerInfo.responsableProcesoArea || 'N/A'}`, 110, yOffset);
    yOffset += 7;
    doc.text(`Periodo de Ejecución: ${headerInfo.periodoEjecucionInicio || 'N/A'} a ${headerInfo.periodoEjecucionFin || 'N/A'}`, 10, yOffset);
    yOffset += 12;
    return yOffset;
  }

  private addGeneralObjective(doc: jsPDF, yOffset: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Objetivo General del Plan', 10, yOffset);
    yOffset += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const objetivoGeneral = this.planForm.value.objetivoGeneral || 'No especificado.';
    const splitObjetivoGeneral = doc.splitTextToSize(objetivoGeneral, 190);
    doc.text(splitObjetivoGeneral, 10, yOffset);
    yOffset += (splitObjetivoGeneral.length * 5) + 10;
    return yOffset;
  }

  private addSpecificObjectivesAndActivities(doc: jsPDF, yOffset: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. Objetivos Específicos y Actividades', 10, yOffset);
    yOffset += 7;

    this.objetivosEspecificos.controls.forEach((objetivoGroup, objIndex) => {
      const objetivoData = objetivoGroup.value;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Objetivo Específico ${objIndex + 1}: ${objetivoData.nombre} (${objetivoData.compliancePercentage}%)`, 10, yOffset);
      yOffset += 6;

      const categories = this.getCategoriesForObjetivo(objetivoGroup).controls;
      categories.forEach((categoryGroup, catIndex) => {
        const categoryData = categoryGroup.value;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`   Categoría ${catIndex + 1}: ${categoryData.name} (${categoryData.compliancePercentage}%)`, 15, yOffset);
        yOffset += 6;

        // Prepare table data for activities
        const activities = this.getActivitiesForCategory(categoryGroup).controls;
        const monthHeader = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const headers = [
          'Actividad/Tarea', 'Req. Legal', 'Responsable',
          'Presupuesto', 'Reg. Evidencia', ...monthHeader.map(m => `P/E\n${m}`),
          '% Cumplimiento', 'Estado', 'Acciones Mejora', 'Observaciones'
        ];

        const body: any[] = [];
        const monthKeys = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

        activities.forEach(activityControl => {
          const activity = activityControl.value;
          const monthlyExecution = monthKeys.map(month => {
            const planned = activity[`${month}Planned`] ? 'P' : '';
            const executed = activity[`${month}Executed`] ? 'E' : '';
            return `${planned}${executed}`;
          });

          body.push([
            activity.actividadTarea || 'N/A',
            activity.requisitoLegal || 'N/A',
            activity.responsableActividad || 'N/A',
            activity.presupuestoActividad || 'N/A',
            activity.registroEvidencia || 'N/A',
            ...monthlyExecution,
            `${activity.porcentajeCumplimientoActividad || 0}%`,
            activity.estado || 'N/A',
            activity.accionesMejora || 'N/A',
            activity.observaciones || 'N/A'
          ]);
        });

        // Define column widths for activities table
        // Re-indexed due to removal of 'Objetivo Específico' and other fields
        const activityColumnStyles: { [key: number]: { cellWidth?: number; minCellWidth?: number; halign?: 'left' | 'center' } } = {
          0: { cellWidth: 25, halign: 'left' },  // Actividad/Tarea
          1: { cellWidth: 15, halign: 'left' },  // Req. Legal
          2: { cellWidth: 18, halign: 'left' },  // Responsable
          3: { cellWidth: 15, halign: 'left' },  // Presupuesto
          4: { cellWidth: 15, halign: 'left' },  // Reg. Evidencia
          17: { cellWidth: 12, halign: 'center' }, // % Cumplimiento (was 18)
          18: { cellWidth: 15, halign: 'center' }, // Estado (was 19)
          19: { cellWidth: 20, halign: 'left' },  // Acciones Mejora (was 27)
          20: { cellWidth: 20, halign: 'left' }   // Observaciones (was 28)
        };

        // Set dynamic width for monthly columns (columns 5 to 16, previously 6 to 17)
        for (let i = 0; i < monthHeader.length; i++) {
          activityColumnStyles[5 + i] = { minCellWidth: 5, halign: 'center' };
        }

        autoTable(doc, {
          startY: yOffset,
          head: [headers],
          body: body,
          theme: 'grid',
          styles: {
            fontSize: 6.5,
            cellPadding: 0.8,
            overflow: 'linebreak',
            lineColor: 150,
            lineWidth: 0.1
          },
          headStyles: {
            fillColor: [230, 230, 230],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle'
          },
          columnStyles: activityColumnStyles,
          didDrawPage: (data: any) => {
            // Page number will be added at the end by addPageNumbers method
          },
          didParseCell: (data: any) => {
            // Custom styling for monthly execution cells (P/E)
            // Adjusted column index for monthly execution (was 6-17, now 5-16)
            if (data.section === 'body' && data.column.index >= 5 && data.column.index <= 16) {
              const value = data.cell.text[0];
              data.cell.styles.fontStyle = 'bold';
              if (value.includes('E') && value.includes('P')) {
                data.cell.styles.fillColor = [200, 255, 200]; // Light green for P+E
              } else if (value.includes('P')) {
                data.cell.styles.fillColor = [255, 255, 200]; // Light yellow for P only
              } else if (value.includes('E')) {
                data.cell.styles.fillColor = [255, 200, 200]; // Light red for E without P (should not happen with logic)
              }
            }
          }
        });
        yOffset = (doc as any).lastAutoTable.finalY + 10;
        if (yOffset > doc.internal.pageSize.height - 40) { // Add new page if close to bottom
          doc.addPage();
          yOffset = 10;
        }
      });
      yOffset += 5;
      if (yOffset > doc.internal.pageSize.height - 40) { // Add new page if close to bottom
        doc.addPage();
        yOffset = 10;
      }
    });
    return yOffset;
  }

  private addResourcesAssigned(doc: jsPDF, yOffset: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Recursos Asignados', 10, yOffset);
    yOffset += 7;

    const resourcesHead = [['TIPO DE RECURSOS', 'DETALLE']];
    const resourcesBody: any[] = [];
    this.resourcesAssigned.controls.forEach(resourceControl => {
      const resource = resourceControl.value;
      resourcesBody.push([resource.type || 'N/A', resource.detail || 'N/A']);
    });

    autoTable(doc, {
      startY: yOffset,
      head: resourcesHead,
      body: resourcesBody,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { cellWidth: 50, halign: 'left' },
        1: { cellWidth: doc.internal.pageSize.width - 70, halign: 'left' } // Adjust to fill remaining width
      },
      didDrawPage: (data: any) => {
        // Page number will be added at the end
      }
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;
    return yOffset;
  }

  private addMonthlyCompliance(doc: jsPDF, yOffset: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('4. Medición y Seguimiento (Cumplimiento Mensual)', 10, yOffset);
    yOffset += 7;

    const monthlyComplianceHead = [['CUMPLIMIENTO DEL PLAN DE MEJORAMIENTO % De', 'VARIABLES', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC', 'TOTAL']];
    const monthlyComplianceBody: any[] = [];

    const monthlyDataRows = [
      { label: 'ACTIVIDADES A DESARROLLAR', metric: 'activitiesToDevelop' },
      { label: 'ACTIVIDADES EJECUTADAS', metric: 'activitiesExecuted' },
      { label: 'RESULTADO', metric: 'result', suffix: '%' },
      { label: 'META', metric: 'meta', suffix: '%' }
    ];

    monthlyDataRows.forEach(rowInfo => {
      const row: any[] = [rowInfo.label, ''];
      ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC', 'TOTAL'].forEach(month => {
        const value = this.getMonthlyMetricValue(month, rowInfo.metric as keyof MonthlyCompliance);
        row.push(`${value !== undefined ? value : '0'}${rowInfo.suffix || ''}`);
      });
      monthlyComplianceBody.push(row);
    });

    autoTable(doc, {
      startY: yOffset,
      head: monthlyComplianceHead,
      body: monthlyComplianceBody,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.5, halign: 'center' },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', valign: 'middle' },
      columnStyles: {
        0: { halign: 'left', cellWidth: 40, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 20 },
      },
      didDrawPage: (data: any) => {
        // Page number will be added at the end
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.row.index === 3) { // 'META' row
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;
    return yOffset;
  }

  private addSignatures(doc: jsPDF, yOffset: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('5. Firmas', 10, yOffset);
    yOffset += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const firmas = this.firmasFormGroup.value;

    const signatureLines = [
      { label: 'Gerente General:', value: firmas.gerenteGeneral || '' },
      { label: 'Responsable del SGSST:', value: firmas.responsableSGSST || '' },
      { label: 'Fecha de Actualización:', value: firmas.fechaActualizacion || '' },
      { label: 'Licencia SGSST:', value: firmas.licenciaSGSST || '' }
    ];

    signatureLines.forEach((line, index) => {
      doc.text(line.label, 10, yOffset);
      doc.line(10, yOffset + 5, 90, yOffset + 5); // Line for signature
      doc.text(line.value, 10, yOffset + 9); // Name/value below line
      yOffset += 15; // Space for next signature line
    });

    return yOffset;
  }

  private addPageNumbers(doc: jsPDF): void {
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${totalPages}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10, { align: 'right' });
    }
  }
}