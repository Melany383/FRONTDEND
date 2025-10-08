import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators'; // Importar map

export const companyRegisteredGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userCompany$.pipe(
    map(companyInfo => {
      // Si el usuario tiene información de empresa, redirige al dashboard y no permite el acceso
      if (companyInfo && companyInfo.company_id) {
        router.navigate(['/tablero/menu']); // O la ruta principal de tu dashboard
        return false;
      }
      // Si el usuario NO tiene información de empresa, permite el acceso a la ruta (crear/unirse)
      return true;
    })
  );
};

// Nuevo guard para asegurar que el usuario TIENE una empresa para acceder a rutas de tablero
export const companyRequiredGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.userCompany$.pipe(
    map(companyInfo => {
      // Si el usuario NO tiene información de empresa, redirige a crear/unirse
      if (!companyInfo || !companyInfo.company_id) {
        // Podrías mostrar un mensaje al usuario para que registre o se una a una empresa
        router.navigate(['/crear-empresa']); // O una página de bienvenida para unirse
        return false;
      }
      // Si el usuario TIENE información de empresa, permite el acceso
      return true;
    })
  );
};