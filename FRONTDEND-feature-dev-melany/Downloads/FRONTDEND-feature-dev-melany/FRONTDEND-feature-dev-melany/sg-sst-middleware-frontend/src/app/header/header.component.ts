import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 

// Import Angular Material Modules needed for the header
import { MatButtonModule } from '@angular/material/button'; // For mat-button, mat-flat-button, mat-stroked-button
import { MatIconModule } from '@angular/material/icon';     // For mat-icon
import { MatMenuModule } from '@angular/material/menu';     // For matMenuTriggerFor and mat-menu
import { MatDividerModule } from '@angular/material/divider'; // For mat-divider in the menu

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<any>;
  userFullName: string = 'Usuario';
  userCompany$: Observable<any>; 

  // Nuevo observable para determinar si el usuario tiene una empresa (booleano)
  userHasCompany$: Observable<boolean>; 

  constructor(
    public authService: AuthService, // Mantenerlo público para usarlo directamente en el template si es necesario
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUser$ = this.authService.currentUser$;
    this.userCompany$ = this.authService.userCompany$; // Asignar el observable de la empresa

    // Mapear userCompany$ a un booleano para controlar la visibilidad en el HTML
    this.userHasCompany$ = this.authService.userCompany$.pipe(
      map(company => !!company && !!company.company_id) // Verifica si el objeto existe y si tiene un company_id
    );
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      if (user) {
        const nombre = user.user_name || '';
        const apellido = user.user_last_name || '';
        this.userFullName = `${nombre} ${apellido}`.trim();
      } else {
        this.userFullName = 'Usuario';
      }
    });
  }

  openHome(): void {
    this.router.navigate(['/']);
  }

  openRegisterForm(): void {
    this.router.navigate(['/registro']);
  }

  openLoginForm(): void {
    this.router.navigate(['/iniciar-sesion']);
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}