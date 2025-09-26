import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tarea {
  id: string;
  titulo: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  fecha: string;
  asignadoA: string;
  completada: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private apiUrl = 'http://localhost:3000/tareas';  // URL FALSA HAY QUE CAMBIARLA POR UNA REAL

  constructor(private http: HttpClient) {}

  getTareas(): Observable<Tarea[]> {
    return this.http.get<Tarea[]>(this.apiUrl);
  }

  crearTarea(tarea: Partial<Tarea>): Observable<Tarea> {
    return this.http.post<Tarea>(this.apiUrl, tarea);
  }

  marcarComoCompletada(id: string): Observable<Tarea> {
    return this.http.patch<Tarea>(`${this.apiUrl}/${id}`, { completada: true });
  }
}
