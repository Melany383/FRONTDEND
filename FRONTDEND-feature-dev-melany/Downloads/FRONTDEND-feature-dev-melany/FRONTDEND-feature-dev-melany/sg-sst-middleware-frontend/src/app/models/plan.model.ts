export interface Actividad {
  id?: string;
  objetivoEspecifico: string;
  actividadTarea: string;
  requisitoLegal: string;
  responsableActividad: string;
  presupuestoActividad: string;
  registroEvidencia: string;

  // Ejecución mensual
  eneExecuted: boolean;
  febExecuted: boolean;
  marExecuted: boolean;
  abrExecuted: boolean;
  mayExecuted: boolean;
  junExecuted: boolean;
  julExecuted: boolean;
  agoExecuted: boolean;
  sepExecuted: boolean;
  octExecuted: boolean;
  novExecuted: boolean;
  dicExecuted: boolean;

  // Planeación mensual
  enePlanned: boolean;
  febPlanned: boolean;
  marPlanned: boolean;
  abrPlanned: boolean;
  mayPlanned: boolean;
  junPlanned: boolean;
  julPlanned: boolean;
  agoPlanned: boolean;
  sepPlanned: boolean;
  octPlanned: boolean;
  novPlanned: boolean;
  dicPlanned: boolean;

  porcentajeCumplimientoActividad: number;
  observaciones: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  recursosHumanos: string;
  recursosFisicos: string;
  recursosTecnologicos: string;
  indicadorMeta: string;
  fechaSeguimiento: string;
  accionesMejora?: string;
}

export interface ActivityCategory {
  id?: string;
  name: string;
  activities: Actividad[];
  compliancePercentage: number;
}

export interface ObjetivoEspecifico {
  id?: string;
  nombre: string;
  categories: ActivityCategory[];
  compliancePercentage: number;
}

export interface Resource {
  type: string;
  detail: string;
}

export interface MonthlyCompliance {
  month: string;
  activitiesToDevelop: number;
  activitiesExecuted: number;
  result: number;
  meta: number;
}

export interface PlanDeTrabajo {
  id?: string;
  codigo: string;
  version: string;
  fecha: string;
  identificacionProcesoArea: string;
  periodoEjecucionInicio: string;
  periodoEjecucionFin: string;
  responsableProcesoArea: string;
  objetivosEspecificos: ObjetivoEspecifico[];
  resourcesAssigned: Resource[];
  monthlyCompliance: MonthlyCompliance[];
  firmas: {
    gerenteGeneral: string;
    responsableSGSST: string;
    fechaActualizacion: string;
    licenciaSGSST: string;
  };
}