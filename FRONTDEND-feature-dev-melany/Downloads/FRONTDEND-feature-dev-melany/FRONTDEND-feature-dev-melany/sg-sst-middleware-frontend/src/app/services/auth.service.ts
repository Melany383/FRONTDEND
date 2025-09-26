import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  // Nuevo BehaviorSubject para la información de la empresa del usuario
  private userCompanySubject = new BehaviorSubject<any>(this.getStoredUserCompany());
  public userCompany$: Observable<any> = this.userCompanySubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Cuando el usuario inicia sesión o carga la aplicación, intenta cargar la empresa
    this.loadUserCompanyStatus();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  public getStoredUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Nuevo método para obtener la información de la empresa del localStorage
  public getStoredUserCompany(): any {
    const company = localStorage.getItem('user_company');
    return company ? JSON.parse(company) : null;
  }

  // Nuevo método para verificar si el usuario tiene una empresa
  public userHasCompany(): boolean {
    return !!this.getStoredUserCompany();
  }

  login(credentials: { user_email: string; user_password: string }): Observable<any> {
    return new Observable(observer => {
          this.http.post(`${this.baseUrl}/auth/login`, credentials).subscribe({
        next: (res: any) => {
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('user', JSON.stringify(res.user));

          // Asumiendo que res.user.company contiene la info de la empresa si existe
          if (res.user && res.user.company_name) { // Ajusta esto según la estructura real de tu backend
            const companyInfo = {
              company_id: res.user.company_id, // Asegúrate de que el backend envía el ID de la empresa
              company_name: res.user.company_name
            };
            localStorage.setItem('user_company', JSON.stringify(companyInfo));
            this.userCompanySubject.next(companyInfo);
          } else {
            localStorage.removeItem('user_company');
            this.userCompanySubject.next(null);
          }

          this.isLoggedInSubject.next(true);
          this.currentUserSubject.next(res.user);
          observer.next(res);
          observer.complete();
          this.router.navigate(['/tablero/menu']);
        },
        error: (err) => observer.error(err)
      });
    });
  }

  // Método para actualizar la información de la empresa del usuario
  // Esto sería útil si el registro de empresa es exitoso y necesitas actualizar el estado.
  setUserCompany(companyInfo: any): void {
    if (companyInfo) {
      localStorage.setItem('user_company', JSON.stringify(companyInfo));
    } else {
      localStorage.removeItem('user_company');
    }
    this.userCompanySubject.next(companyInfo);
  }

  // Método para cargar el estado de la empresa al iniciar el servicio
  private loadUserCompanyStatus(): void {
    const company = this.getStoredUserCompany();
    this.userCompanySubject.next(company);
  }


  register(user: { user_name: string; user_email: string; user_password: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.baseUrl}/users/register`, user).subscribe({
        next: (res: any) => {
          this.login({ user_email: user.user_email, user_password: user.user_password }).subscribe({
            next: (loginRes) => {
              observer.next(loginRes);
              observer.complete();
            },
            error: (err) => observer.error(err)
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_company'); // Limpiar información de la empresa al cerrar sesión
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.userCompanySubject.next(null); // Emitir null al cerrar sesión
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}