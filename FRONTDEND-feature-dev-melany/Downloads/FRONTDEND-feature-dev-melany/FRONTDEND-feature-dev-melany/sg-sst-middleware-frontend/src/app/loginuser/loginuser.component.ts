import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';




import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loginuser',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatError,
    MatLabel,
    MatIconModule,  
    MatButtonModule
  ],
  templateUrl: './loginuser.component.html',
  styleUrls: ['./loginuser.component.scss']
})
export class LoginuserComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;
  hidePassword: boolean = true;
  hideNewPassword: boolean = true;
  hideConfirmPassword: boolean = true;

  
  
  recoverForm!: FormGroup;
  serverMessage: string | null = null;
showOTPInput: boolean = false;
showResetPassword: boolean = false;

otpCode: string = '';
generatedOTP: string = '';
otpAssociatedEmail: string = '';
otpExpired: boolean = false;
otpError: string | null = null;
canRequestNewCode: boolean = false;
otpTimer: any;
otpCountdown: number = 300;

resetPasswordForm!: FormGroup;
passwordsMatch: boolean = false;
showRecoverPassword: boolean = false;
  showEmailInput: boolean | undefined;
  email: string | undefined;
  newPassword: string | undefined;
  showLogin: boolean | undefined;
  


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.noSpacesValidator]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]]
    });
   
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.noSpacesValidator]]
    });

  }
  ngOnInit(): void {
  this.loginForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        this.noSpacesValidator,
        this.validDomainValidator
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        this.noSpacesValidator
      ]
    ]
  });

  this.recoverForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        this.noSpacesValidator,
        this.validDomainValidator
      ]
    ]
  });

  this.resetPasswordForm = this.fb.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        this.noSpacesValidator
      ]
    ],
    confirmPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(12),
        this.noSpacesValidator
      ]
    ]
  });
}



   noSpacesValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.indexOf(' ') >= 0) {
      return { noSpaces: true };
    }
    return null;
  }

 validDomainValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  if (/\s/.test(value)) {
    return null;
  }

  if (!value.includes('@') || !/\.[a-zA-Z]{2,}$/.test(value)) {
    return { missingDomain: true };
  }

  return null;
}



  
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const credentials = {
      user_email: this.loginForm.value.email,
      user_password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        if (!this.authService.isAuthenticated()) {
          this.errorMessage = 'Error inesperado en la autenticación';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
        console.error('Error en login:', err);
      }
    });
  }
  goToLogin() {
  this.showResetPassword = false;
  this.showOTPInput = false;
  this.showEmailInput = false;

  this.email = '';
  this.otpCode = '';
  this.newPassword = '';

  this.showLogin = true;
}

goToRecover(): void {
  this.showRecoverPassword = true;
  this.showOTPInput = false;
  this.showResetPassword = false;
  this.serverMessage = null;
  this.recoverForm.reset();
}

cancelRecover(): void {
  this.showRecoverPassword = false;
  this.showOTPInput = false;
  this.showResetPassword = false;
  this.serverMessage = null;
  this.recoverForm.reset();
}




sendRecoverEmail(): void {
  if (this.recoverForm.invalid) {
    this.recoverForm.markAllAsTouched();
    return;
  }

  const email = this.recoverForm.value.email;

  this.generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpAssociatedEmail = email;

  this.showResetPassword = false; 
  this.showOTPInput = true;         

  this.serverMessage = `Se envió un código de verificación a ${email}`;
  this.otpError = null;
  this.startOTPTimer();
  console.log('[DEMO] Código enviado:', this.generatedOTP);
}

startOTPTimer(): void {
  this.otpCountdown = 300;
  this.otpExpired = false;
  this.canRequestNewCode = false;
  clearInterval(this.otpTimer);

  this.otpTimer = setInterval(() => {
    if (this.otpCountdown > 0) {
      this.otpCountdown--;
    } else {
      this.otpExpired = true;
      clearInterval(this.otpTimer);
      this.canRequestNewCode = true;
    }
  }, 1000);
}

verifyOTP(): void {
  if (this.otpCode === this.generatedOTP && !this.otpExpired) {
    this.showOTPInput = false;
    this.showResetPassword = true;
    this.otpError = null;
    clearInterval(this.otpTimer);
  } else {
    this.otpError = this.otpExpired
      ? 'El código ha caducado. Solicita uno nuevo.'
      : 'El código ingresado es incorrecto.';
  }
}

requestNewOTP(): void {
  if (!this.canRequestNewCode) return;

  this.generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpExpired = false;
  this.otpCountdown = 300;
  this.canRequestNewCode = false;
  this.startOTPTimer();
  this.otpError = null;
  console.log('[DEMO] Nuevo código OTP:', this.generatedOTP);
  this.serverMessage = 'Se ha enviado un nuevo código a tu correo.';
}

cancelOTP(): void {
  clearInterval(this.otpTimer);
  this.showOTPInput = false;
  this.showResetPassword = false;
  this.recoverForm.reset();
  this.otpError = null;
  this.serverMessage = null;
}

updatePasswordsMatch(): void {
  const newPass = this.resetPasswordForm.get('newPassword')?.value;
  const confirmPass = this.resetPasswordForm.get('confirmPassword')?.value;
  this.passwordsMatch = newPass === confirmPass;
}

submitNewPassword(): void {
  if (this.resetPasswordForm.invalid || !this.passwordsMatch) return;

  const newPass = this.resetPasswordForm.value.newPassword;
  console.log('[DEMO] Nueva contraseña para:', this.otpAssociatedEmail, '=>', newPass);

  this.serverMessage = 'Contraseña actualizada correctamente.';
  this.showResetPassword = false;
  this.showResetPassword = false;
  this.recoverForm.reset();
  this.resetPasswordForm.reset();
}



  openRegisterForm(): void {
    this.router.navigate(['/registro']);
  }
}
