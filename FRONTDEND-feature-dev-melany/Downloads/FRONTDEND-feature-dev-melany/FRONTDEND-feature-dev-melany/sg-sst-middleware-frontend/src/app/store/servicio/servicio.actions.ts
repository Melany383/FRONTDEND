import { createAction, props } from '@ngrx/store';

export const cargarDatos = createAction('[Servicio] Cargar Datos');
export const cargarDatosSuccess = createAction(
  '[Servicio] Cargar Datos Success',
  props<{ datos: any }>()
);
export const cargarDatosFailure = createAction(
  '[Servicio] Cargar Datos Failure',
  props<{ error: any }>()
);
