import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MatrixService {
    

  private rawCsvData: string = `
,,,,MATRIZ DE PELIGRO SKINCARE,,,,,,,,,,,,,,,,,,,,,,,Código:,FSST - 07,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,Versión:,1,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,Fecha:,13/3/2023,,,,
,Elaborado por: KARINA VERGARA JIMENEZ LIC: 2021060010213 ,,,,,,,,,,,,Aprobado por: ,,,,,,,,,,,,,,,,,,,
,Actualización fecha: Enero 2024,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
ACTIVIDAD / CARGO,FACTOR DE RIESGO,PELIGRO O FUENTE DEL FACTOR DE RIESGO,POSIBLES CONSECUENCIAS,ACTIVIDAD,,EXPUESTOS ,,,HORAS DE EXPOSICIÓN- DÍA,FUENTE GENERADORA ,DESCRIPCIÓN DE LAS MEDIDAS DE CONTROL EXISTENTES,,,,PROBABILIDAD,,,,CONSECUENCIAS,,,,,ESTIMACIÓN DEL RIESGO (GRADO DE RIESGO),INTERPRETACION,PLANES DE ACCION,,,,,,
,,,,RUTINARIA,NO RUTINARIA,VINCULADOS,TEMPORALES- COOPERATIVAS,TOTAL,,,FUENTE,MEDIO,PERSONAS,MÉTODO,BAJA,MEDIA,ALTA,#,LIGERAMENTE DAÑINO,DAÑINO,EXTREMADAMENTE DAÑINO,#,Vr,,,"ELIMINACIÓN: 
Proyectos. Modificar un diseño o proceso para eliminar el peligro. ","SUSTITUCIÓN:
Remplazar por material menos peligroso o reducir la energía del sistema ","CONTROLES DE INGENIERIA: Instalar sistemas de ventilación, protección para las maquinas, enclavamiento, cerramientos acústicos, etc. 
","CONTROLES ADMINISTRATIVOS, SEÑALIZACIÓN Y ADVERTENCIAS: Instalación de alarmas, procedimientos de seguridad, inspecciones de los equipos, controles de acceso, capacitación del personal. ","EQUIPOS DE PROTECCION PERSONAL:  
Gafas de seguridad, protección auditiva, mascaras faciales, sistemas de detección de caídas, respiradores, guantes. 
 ",#,Vr
"PERSONAL ADMINISTRATIVO, GERENTE",MECANICO,Golpes,"Golpes, contusiones, lesiones, fracturas",X,,9,,9,8,"Maquinaria, herramientas, estructuras",NA,NA,NA,NA,,X,,2,,X,,2,4,RIESGO TOLERABLE,,NA,NA,NA,"Capacitaciones de autocuidado
Programa de Orden y Aseo",NA,#REF!,
,MECANICO,Golpeado por o contra,"Golpes, contusiones, lesiones, fracturas",X,,9,,9,8,Herramientas manuales.,NA,NA,Dotación de casco,NA,X,,,1,,X,,2,2,RIESGO TRIVIAL,,NA,NA,NA,Seguimiento al uso de EPP,Señalización,,
,MECANICO,Caidas a nivel,"Golpes, contusiones, lesiones, fracturas",X,,9,,9,8,Desplazamiento por las distintas áreas ,NA,NA,NA,NA,,X,,2,,X,,2,4,RIESGO TOLERABLE,,NA,NA,NA,"Reporte de condiciones peligrosas e incidentes
Capacitaciones de autocuidado
Programa de Orden y Aseo",NA,#REF!,
,MECANICO,Caidas a desnivel,"Golpes, contusiones, lesiones, fracturas",X,,9,,9,8,Desplazamiento por escalas,NA,NA,NA,NA,,X,,2,,X,,2,4,RIESGO TOLERABLE,,NA,NA,NA,"Reporte de condiciones peligrosas e incidentes
Capacitaciones de autocuidado",NA,#REF!,
,ERGONOMICO,Posición sentado,"Fatiga//Trastornos osteomusculares, traumas acumulativos, lumbalgias ",X,,9,,9,8,Posición normal de la tarea,NA,NA,NA,NA,,X,,2,,X,,2,4,RIESGO TOLERABLE,,NA,NA,Inspección de puestos de trabajo,"SVE Osteomuscular
Capacitación en Higiene Postural, Realización de examenes medicos periodicos
Realizar indice de ausentismo por el concepto osteomuscular, ",Pausas Activas ,#REF!,
,ERGONOMICO,Movimiento repetitivo,"Fatiga//Trastornos osteomusculares, traumas acumulativos ",X,,9,,9,8,Digitación y uso del mouse,NA,NA,NA,NA,,,X,3,,X,,2,6,RIESGO MODERADO,,NA,NA,Inspección de puestos de trabajo,"SVE Osteomuscular
Capacitación en Higiene Postural, Realización de examenes medicos periodicos
Realizar indice de ausentismo por el concepto osteomuscular, ",Pausas Activas ,#REF!,
,FISICOQUIMICO,Incendios y explosiones,"Lesiones incapacitantes, quemaduras diversas",X,,9,,9,8,"Instalaciones electricas,",NA,"Extintores,",NA,NA,,X,,2,,X,,2,4,RIESGO TOLERABLE,,NA,NA,NA,"Plan de emergencias
Inspecciones de extintores, 
Entrenamiento en que hacer Antes, Durante y Despues
Conformación de brigada",NA,#REF!,
,PSICOSOCIAL,"Cumplimiento de tiempos de entrega, relaciones interpersonales, actividades extralaborales",Estrés y alteración de la conducta.,X,,9,,9,8,"Cumplimiento de indicadores, relaciones interpersonales, actividades extralaborales",NA,NA,NA,NA,,X,,2,,X,,2,4,RIESGO TOLERABLE,,Programa psicosocial,NA,NA,Programas extralaborales,NA,#REF!,
SERVICIOS GENERALES,FISICO,Iluminacion deficiente,"Fatiga visual, Jaqueca",X,,9,,9,8,"Lugar de trabajo,
con alta densidad de iluminación.",,"Mantenimiento.
",,,,X,,2,,X,,2,4,RIESGO TOLERABLE,,,,,"Capacitarlas en la importancia
del cuidado, de la salud visual",,,
,FISICO,Ruido,"Fatiga auditiva
Jaquecas
vertigo",X,,9,,9,8,Actividad continua de llamada.,,,EPP,,,X,,2,,X,,2,4,RIESGO TOLERABLE,,,,,,Cambio y mantenimiento de diademas.,,
,QUIMICO,Contacto con quimicos de limpieza,"Abrasiones, dermatitis",X,,1,,1,8,No utilizar los EPP entregados,,,EPP,,,X,,2,X,,,1,2,Riesgo Tolerable,,,,Programa manejo de quimicos,Capacitación permanente,,,
,QUIMICO,Salpicadura quimicos de limpieza,Irritaciones o lesiones oculares,X,,1,,1,2,No utilizar los EPP entregados,NA,NA,NA,NA,,X,,2,,X,,2,4,Riesgo Moderado,,,,Programa manejo de quimicos,,Dotar de Gafas de seguridad y verificar uso,,
,MECANICO,Golpes,"Golpes, contusiones, lesiones, fracturas",X,,1,,1,8,Herramientas manuales.,NA,NA,NA,NA,,X,,2,,X,,2,4,Riesgo Moderado,,,NA,NA,"Capacitaciones de autocuidado
Programa de Orden y Aseo",NA,#REF!,
,MECANICO,Golpeado por o contra,"Golpes, contusiones, lesiones, fracturas",X,,1,,1,8,"Objetos almacenados en partes altas o que vuelan proyectados, cuando esta en la oficina.",NA,NA,Dotación de casco,NA,,X,,2,,X,,2,4,Riesgo Moderado,,NA,NA,NA,Seguimiento al uso de EPP,Señalización,,
,MECANICO,Caidas a nivel,"Golpes, contusiones, lesiones, fracturas",X,,1,,1,4,Pisos humedos sin señalización,NA,NA,NA,Aviso piso humedo,NA,X,,1,,X,,2,2,Riesgo Moderado,X,,,Programa de Orden y Aseo,,,,
,MECANICO,Caidas a desnivel,"Golpes, contusiones, lesiones, fracturas",X,,1,,1,4,No utilizar el pasamanos para subir y bajar escalas,NA,Pasamanos,NA,NA,NA,X,,1,,,X,,X,Risgo Importante,,NA,NA,NA,Señalización y capcitación.,,,
,MECANICO,Contacto con objetos corto punzantes,Heridas,X,,1,,1,2,"Tijeras, cuchillos",NA,NA,NA,NA,NA,X,,1,X,,,1,1,Riesgo Tolerable,,NA,NA,NA,Capacitaciones de autocuidado.,NA,,
,MECANICO,Contacto con superficies calientes,Quemaduras,X,,1,,1,2,Greca,NA,NA,NA,NA,NA,X,,1,,X,,2,2,Riesgo Moderado,,NA,NA,NA,Señalización y capacitación.,,,
,ERGONOMICO,Posición prolongada de pie o sentado prolongado (mas del 70% de la jornada) ,Lesiones del sistema musculo esquelético.,X,,1,,1,4,No realizar Pausas activas,NA,NA,NA,NA,NA,X,,1,,X,,2,2,Riesgo Moderado,,NA,NA,PVE osteomuscular,,,,
,ELECTRICO,Contacto indirecto (con baja),"Quemaduras, electrocución.",X,,1,,1,6,Maquinaria,NA,NA,NA,NA,,X,,2,,X,,2,4,Riesgo Moderado,,NA,NA,NA,"Inspección riesgo Electrico
Capacitaciones
Señalización",NA,,
,FISICOQUIMICO,Incendios ,"Lesiones incapacitantes, quemaduras diversas",X,,1,,1,8,Maquinas que se dejan encendidas ,NA,"Extintores,",NA,NA,,X,,2,X,,,,X,Riesgo Tolerable,,NA,NA,Plan de Emergencias,"Inspecciones de extintores, Entrenamiento en que hacer Antes, Durante y Despues",Señalización,Señalización,
`;

  // Mapped headers based on visual inspection of your CSV
  // Estos nombres de encabezado deben coincidir con las propiedades de la interfaz MatrixRow
  private headers: string[] = [
    'actividad_cargo',
    'factor_riesgo',
    'peligro_fuente_factor_riesgo',
    'posibles_consecuencias',
    'actividad_rutinaria',
    'actividad_no_rutinaria',
    'expuestos_vinculados',
    'expuestos_temporales_cooperativas',
    'expuestos_total',
    'horas_exposicion_dia',
    'fuente_generadora',
    'descripcion_control_existente_fuente',
    'descripcion_control_existente_medio',
    'descripcion_control_existente_personas',
    'descripcion_control_existente_metodo',
    'probabilidad_baja',
    'probabilidad_media',
    'probabilidad_alta',
    'probabilidad_num',
    'consecuencias_ligeramente_danino',
    'consecuencias_danino',
    'consecuencias_extremadamente_danino',
    'consecuencias_num',
    'estimacion_riesgo_grado_vr',
    'interpretacion',
    'planes_accion_eliminacion',
    'planes_accion_sustitucion',
    'planes_accion_controles_ingenieria',
    'planes_accion_controles_administrativos',
    'planes_accion_epp',
    'planes_accion_num',
    'planes_accion_vr'
  ];

  constructor(private http: HttpClient) { }

  private parseCsv(csv: string): any[] { // Cambiado a any[] ya que MatrixRow no está importado aquí
    const lines = csv.split('\n');
    const dataRows: any[] = []; // Cambiado a any[]

    let startIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('PERSONAL ADMINISTRATIVO, GERENTE')) {
        startIndex = i;
        break;
      }
    }

    if (startIndex === -1) {
      console.error('Could not find the start of data in CSV.');
      return [];
    }

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cleanedLine = line.replace(/,"([^"]*)",/g, (match, p1) => {
        return `,"${p1.replace(/,/g, '{{COMMA_PLACEHOLDER}}')}",`;
      });

      const values = cleanedLine.split(',').map(val =>
        val.replace(/{{COMMA_PLACEHOLDER}}/g, ',').trim().replace(/^"|"$/g, '')
      );

      const row: { [key: string]: any } = {}; // Usar un índice de cadena para la fila
      this.headers.forEach((header, index) => {
        const value = values[index] === '#REF!' ? undefined : values[index];
        row[header] = value;
      });
      dataRows.push(row);
    }
    return dataRows;
  }

  // Ahora devuelve Observable<any[]> ya que MatrixRow no se importa aquí
  getParsedMatrixData(): Observable<any[]> {
    return of(this.parseCsv(this.rawCsvData));
  }

 
  getInstructionsHtml(): Observable<string> {
    return this.http.get('assets/Instrucciones formato PFR.html', { responseType: 'text' });
  }
}