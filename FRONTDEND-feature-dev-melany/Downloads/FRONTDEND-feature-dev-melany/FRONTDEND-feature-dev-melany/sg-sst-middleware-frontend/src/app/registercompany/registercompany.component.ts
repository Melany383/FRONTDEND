import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
// Eliminar la importación de DaneService
// import { DaneService } from '../services/dane.service';
import { CompanyService } from '../services/company.service';
import { EconomicTableComponent } from '../economic-table/economic-table.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registercompany',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    EconomicTableComponent
  ],
  // Eliminar DaneService de providers
  providers: [AuthService], // Solo AuthService
  templateUrl: './registercompany.component.html',
  styleUrls: ['./registercompany.component.scss']
})
export class RegistercompanyComponent implements OnInit {
  registerCompany: FormGroup;
  showEconomicTable = false;
  selectedActivity: any = null;

  // Ya no necesitamos 'departments' ni 'filteredMunicipalities'
  // departments: any[] = [];
  // filteredMunicipalities: any[] = [];

  personTypes = [
    { id: '1', name: 'Jurídica' },
    { id: '2', name: 'Natural' }
  ];

  taxRegimes = [
    { id: '1', name: 'Régimen común' },
    { id: '2', name: 'Régimen especial' },
    { id: '3', name: 'Régimen simplificado' }
  ];

  arlList = [
    { id: '14-4', name: 'AXA COLPATRIA SEGUROS S.A.' },
    { id: '14-25', name: 'COLMENA SEGUROS RIESGOS LABORALES S.A.' },
    { id: '14-7', name: 'COMPAÑÍA DE SEGUROS BOLÍVAR S.A.' },
    { id: '14-33', name: 'COMPAÑÍA DE SEGUROS COLSANITAS S.A.' },
    { id: '14-8', name: 'COMPAÑIA DE SEGUROS DE VIDA AURORA S.A.' },
    { id: '14-29', name: 'LA EQUIDAD SEGUROS DE VIDA' },
    { id: '14-18', name: 'LIBERTY SEGUROS DE VIDA S.A.' },
    { id: '14-23', name: 'POSITIVA COMPAÑIA DE SEGUROS S.A.' },
    { id: '14-11', name: 'SEGUROS DE RIESGOS LABORALES SURAMERICANA S.A.' },
    { id: '14-17', name: 'SEGUROS DE VIDA ALFA S.A.' }
  ];

  idTypes = [
    { id: '1', name: 'Cédula de ciudadanía' },
    { id: '2', name: 'Cédula de extranjería' },
    { id: '3', name: 'Número único de identificación' },
    { id: '4', name: 'Pasaporte' },
    { id: '5', name: 'Permiso especial de permanencia' },
    { id: '6', name: 'Permiso especial de trabajo' }
  ];

  userHasCompany: boolean = false;

  constructor(
    private fb: FormBuilder,
    // Eliminar la inyección de DaneService
    // private daneService: DaneService,
    private companyService: CompanyService,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerCompany = this.fb.group({
      company: ['', Validators.required],
      nit: ['', Validators.required],
      verificationDigit: ['', [Validators.required, Validators.min(0), Validators.max(9)]],
      personType: ['', Validators.required],
      taxRegime: ['', Validators.required],
      numberOfWorkers: ['', [Validators.required, Validators.min(1)]],
      arl: ['', Validators.required],
      representativeIdType: ['', Validators.required],
      representativeId: ['', Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      firstLastName: ['', Validators.required],
      secondLastName: [''],
      headquartersName: ['', Validators.required],
      address: ['', Validators.required],
      phone: [''],
      mobile: ['', Validators.required],
      // Cambiar de select a input de texto
      department: ['', Validators.required], // Ahora será un string
      municipality: ['', Validators.required], // Ahora será un string
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      economicActivityCode: [''],
      economicActivityDescription: [''],
      riskLevel: ['']
    });
  }

  ngOnInit(): void {
    // Eliminar la llamada a loadDepartments()
    // this.loadDepartments();
    this.setupFormListeners();

    this.authService.userCompany$.subscribe(company => {
      this.userHasCompany = !!company;
      if (this.userHasCompany) {
        this.registerCompany.disable();
        this.router.navigate(['/tablero/menu']);
      } else {
        this.registerCompany.enable();
      }
    });
  }

  setupFormListeners(): void {
    this.registerCompany.get('confirmEmail')?.valueChanges.subscribe((value) => {
      const email = this.registerCompany.get('email')?.value;
      if (email && value !== email) {
        this.registerCompany.get('confirmEmail')?.setErrors({ mismatch: true });
      } else {
        this.registerCompany.get('confirmEmail')?.setErrors(null);
      }
    });

    // Eliminar el listener para el cambio de departamento y carga de municipios
    // this.registerCompany.get('department')?.valueChanges.subscribe((departmentId) => {
    //   if (departmentId) {
    //     this.loadMunicipalities(departmentId);
    //     this.registerCompany.get('municipality')?.reset();
    //   } else {
    //     this.filteredMunicipalities = [];
    //   }
    // });
  }

  // Eliminar estos métodos ya que no se usará la API
  // loadDepartments(): void {
  //   this.daneService.getDepartamentos().subscribe({
  //     next: (data) => this.departments = data,
  //     error: (err) => {
  //       console.error('Error cargando departamentos:', err);
  //       this.departments = [];
  //     }
  //   });
  // }

  // loadMunicipalities(departmentId: string): void {
  //   this.daneService.getMunicipiosPorDepartamento(departmentId).subscribe({
  //     next: (data) => this.filteredMunicipalities = data,
  //     error: (err) => {
  //       console.error('Error cargando municipios:', err);
  //       this.filteredMunicipalities = [];
  //     }
  //   });
  // }

  openEconomicTable(): void {
    this.showEconomicTable = true;
  }

  closeEconomicTable(): void {
    this.showEconomicTable = false;
  }

  onActivitySelected(activity: any): void {
    this.selectedActivity = activity;
    this.registerCompany.patchValue({
      economicActivityCode: activity.codigo_ciiu,
      economicActivityDescription: activity.descripcion,
      riskLevel: activity.tipo_riesgo
    });
    this.closeEconomicTable();
  }

  removeActivity(): void {
    this.selectedActivity = null;
    this.registerCompany.patchValue({
      economicActivityCode: '',
      economicActivityDescription: '',
      riskLevel: ''
    });
  }

  onSubmit(): void {
    if (this.userHasCompany) {
      console.warn('El usuario ya tiene una empresa registrada. No se puede registrar otra.');
      return;
    }

    const currentUser = this.authService.getStoredUser();

    if (!currentUser || !currentUser.id_user) {
      console.error('Usuario no autenticado o ID no disponible');
      return;
    }

    if (this.registerCompany.valid) {
      const formData = this.registerCompany.value;

      const payload = {
        id_user: currentUser.id_user,
        company_name: formData.company,
        company_nit: formData.nit,
        verification_digit: formData.verificationDigit,
        person_type: formData.personType,
        tax_regime: formData.taxRegime,
        number_of_workers: formData.numberOfWorkers,
        company_arl: formData.arl,
        representative_id_type: formData.representativeIdType,
        representative_id: formData.representativeId,
        first_name: formData.firstName,
        middle_name: formData.middleName,
        first_last_name: formData.firstLastName,
        second_last_name: formData.secondLastName,
        headquarters_name: formData.headquartersName,
        company_address: formData.address,
        phone_number: formData.phone,
        mobile: formData.mobile,
        company_department: formData.department, // Ahora es un string del input
        company_municipality: formData.municipality, // Ahora es un string del input
        company_email: formData.email,
        confirm_email: formData.confirmEmail,
        economic_activity_code: formData.economicActivityCode,
        economic_activity_description: formData.economicActivityDescription,
        risk_level: formData.riskLevel
      };

      this.companyService.registerCompany(payload).subscribe({
        next: (res) => {
          console.log('Empresa registrada correctamente:', res);
          this.authService.setUserCompany({
            company_id: res.company_id,
            company_name: res.company_name
          });
          this.router.navigate(['/tablero/menu']);
        },
        error: (err) => {
          console.error('Error al registrar empresa:', err);
        }
      });
    } else {
      this.registerCompany.markAllAsTouched();
      console.warn('Formulario inválido');
    }
  }
}