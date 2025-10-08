import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.employeeForm = this.fb.group({
      identificacionPersonal: this.fb.group({
        nombreCompleto: ['', Validators.required],
        documentoIdentidad: ['', Validators.required],
        sexo: ['', Validators.required],
        fechaNacimiento: ['', Validators.required],
        edad: ['', [Validators.required, Validators.min(18)]],
        estadoCivil: ['', Validators.required],
        nacionalidad: ['', Validators.required],
      }),
      contacto: this.fb.group({
        direccion: ['', Validators.required],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        correo: ['', [Validators.required, Validators.email]],
      }),
      salud: this.fb.group({
        tipoSangre: [''],
        alergias: [''],
        enfermedades: [''],
        medicamentos: [''],
        discapacidad: [''],
        examenesPrevios: [''],
      }),
      laboral: this.fb.group({
        cargo: ['', Validators.required],
        fechaIngreso: ['', Validators.required],
        tipoContrato: ['', Validators.required],
        grupoOcupacional: [''],
        actividades: [''],
        horarios: [''],
      }),
      condicionesTrabajo: this.fb.group({
        riesgos: [''],
        usoEPP: [''],
        condicionesEntorno: [''],
      }),
      familiares: this.fb.group({
        dependientes: this.fb.array([]),
        contactoEmergencia: this.fb.group({
          nombre: ['', Validators.required],
          telefono: ['', Validators.required]
        })
      }),
      otros: this.fb.group({
        nivelEducativo: [''],
        experienciaLaboral: ['']
      })
    });
  }

  get dependientes(): FormArray {
    return this.employeeForm.get('familiares.dependientes') as FormArray;
  }

  agregarDependiente() {
    this.dependientes.push(
      this.fb.group({
        nombre: ['', Validators.required],
        parentesco: ['', Validators.required]
      })
    );
  }

  eliminarDependiente(index: number) {
    this.dependientes.removeAt(index);
  }

  enviarFormulario() {
    if (this.employeeForm.valid) {
      console.log(this.employeeForm.value);
      // Aquí puedes agregar la lógica para enviar los datos
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }
}