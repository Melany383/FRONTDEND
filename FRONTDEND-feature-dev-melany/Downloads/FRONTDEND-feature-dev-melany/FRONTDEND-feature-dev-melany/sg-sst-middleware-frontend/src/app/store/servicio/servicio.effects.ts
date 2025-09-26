import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServicioApiService } from '../../servicio-api.service';
import * as ServicioActions from './servicio.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class ServicioEffects {
  constructor(private actions$: Actions, private api: ServicioApiService) {}

  cargarDatos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ServicioActions.cargarDatos),
      mergeMap(() =>
        this.api.obtenerDatos().pipe(
          map(datos => ServicioActions.cargarDatosSuccess({ datos })),
          catchError(error => of(ServicioActions.cargarDatosFailure({ error })))
        )
      )
    )
  );
}
