import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { appProviders } from './app/app.providers'; // ✅ Importa los providers

import { servicioReducer } from './app/store/servicio/servicio.reducer';
import { ServicioEffects } from './app/store/servicio/servicio.effects';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...appConfig.providers!, ...appProviders], // ✅ combina los providers
})
  .catch((err) => console.error(err));

export const servicioFeatureKey = 'servicio';
export const servicioReducers = {
  [servicioFeatureKey]: servicioReducer,
};

export const servicioEffects = [ServicioEffects];
