import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-company-code',
  imports: [ CommonModule,ReactiveFormsModule,
      MatInputModule,
      MatButtonModule,
      MatSelectModule,
      MatFormFieldModule ],
  standalone: true,
  templateUrl: './company-code.component.html',
  styleUrl: './company-code.component.scss'
})
export class CompanyCodeComponent {
  loginUser: FormGroup;

  constructor(private fb: FormBuilder,private router: Router) {
    this.loginUser = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginUser.valid) {
      console.log(this.loginUser.value);
    } else {
      console.log('Formulario no válido');
    }
  }
}
