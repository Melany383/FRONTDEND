import { createReducer, on } from '@ngrx/store';
import * as ServicioActions from './servicio.actions';

export interface ServicioState {
  datos: any;
  loading: boolean;
  error: any;
}

export const initialState: ServicioState = {
  datos: null,
  loading: false,
  error: null,
};

export const servicioReducer = createReducer(
  initialState,
  on(ServicioActions.cargarDatos, (state: any) => ({ ...state, loading: true })),
  on(ServicioActions.cargarDatosSuccess, (state: any, { datos }: any) => ({
    ...state,
    datos,
    loading: false,
  })),
  on(ServicioActions.cargarDatosFailure, (state: any, { error }: any) => ({
    ...state,
    error,
    loading: false,
  }))
);
