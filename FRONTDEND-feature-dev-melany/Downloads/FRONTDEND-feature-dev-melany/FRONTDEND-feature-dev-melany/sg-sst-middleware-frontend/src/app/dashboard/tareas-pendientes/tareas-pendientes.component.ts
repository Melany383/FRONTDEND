import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareasService, Tarea } from '../../services/tareas.service';

@Component({
  selector: 'app-tareas-pendientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tareas-pendientes.component.html',
  styleUrls: ['./tareas-pendientes.component.scss']
})
export class TareasPendientesComponent implements OnInit {
  esAdmin = false; // Simulado
  usuarioActual = 'juan.perez';

  tareas: Tarea[] = [];

  nuevaTarea: Partial<Tarea> = {
    titulo: '',
    prioridad: 'Media',
    fecha: '',
    asignadoA: ''
  };

  constructor(private tareasService: TareasService) {}

  ngOnInit(): void {
    this.tareasService.getTareas().subscribe(data => {
      this.tareas = data;
    });
  }

  agregarTarea() {
    if (this.nuevaTarea.titulo && this.nuevaTarea.fecha && this.nuevaTarea.asignadoA) {
      this.tareasService.crearTarea({
        ...this.nuevaTarea,
        completada: false
      }).subscribe(tareaCreada => {
        this.tareas.push(tareaCreada);
        this.nuevaTarea = { prioridad: 'Media' };
      });
    }
  }

  marcarComoCompletada(tarea: Tarea) {
    this.tareasService.marcarComoCompletada(tarea.id).subscribe(tareaActualizada => {
      tarea.completada = true;
    });
  }

  tareasPendientes() {
    return this.tareas.filter(t => !t.completada && (this.esAdmin || t.asignadoA === this.usuarioActual));
  }

  tareasCompletadas() {
    return this.tareas.filter(t => t.completada && (this.esAdmin || t.asignadoA === this.usuarioActual));
  }
}
