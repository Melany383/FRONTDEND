import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionEmpresaComponent } from './configuracion-empresa.component';

describe('ConfiguracionEmpresaComponent', () => {
  let component: ConfiguracionEmpresaComponent;
  let fixture: ComponentFixture<ConfiguracionEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionEmpresaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
