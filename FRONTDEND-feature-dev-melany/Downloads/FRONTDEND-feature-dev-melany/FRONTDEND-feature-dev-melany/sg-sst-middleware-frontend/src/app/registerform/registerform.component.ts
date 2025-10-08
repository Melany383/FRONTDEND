import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-registerform',
  standalone: true,
  imports: [
    CommonModule,             
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './registerform.component.html',
  styleUrls: ['./registerform.component.scss']
})
export class RegisterformComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.noSpacesValidator]],
       telefono: [
                '',
    [
      Validators.required,
      Validators.pattern(/^[0-9]*$/),  // solo números
      Validators.minLength(10),        // mínimo 10
      Validators.maxLength(10)         // máximo 10
    ]
  ],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
      confirmPassword: ['', Validators.required],
      
    }, { validator: this.passwordMatchValidator });
  }

   noSpacesValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.indexOf(' ') >= 0) {
      return { noSpaces: true };
    }
    return null;
  }
  
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const userData = {
      user_name: this.registerForm.value.nombres,
      user_last_name: this.registerForm.value.apellidos,
      user_email: this.registerForm.value.email,
      user_password: this.registerForm.value.password,
      phone_number: this.registerForm.value.telefono
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '¡Registro exitoso! Redirigiendo...';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar. Por favor, inténtalo de nuevo.';

      }
    });
  }
}
