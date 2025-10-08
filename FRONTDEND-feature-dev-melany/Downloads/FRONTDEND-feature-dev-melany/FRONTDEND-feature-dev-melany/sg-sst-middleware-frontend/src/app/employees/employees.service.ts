import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from './employees.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  private mockEmployees: Employee[] = [
    { id: '1', name: 'Juan Pérez', email: 'juan@empresa.com', role: 'employee', position: 'Analista', joinedAt: new Date('2024-03-01') },
    { id: '2', name: 'Laura Gómez', email: 'laura@empresa.com', role: 'supervisor', position: 'Líder', joinedAt: new Date('2023-11-15') },
    { id: '3', name: 'Carlos Ruiz', email: 'carlos@empresa.com', role: 'admin', position: 'Gerente', joinedAt: new Date('2023-06-10') },
  ];

  getEmployeesByCompany(companyId: string): Observable<Employee[]> {
    return of(this.mockEmployees);
  }
}
