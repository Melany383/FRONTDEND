import { Component, OnInit } from '@angular/core';
import { EmployeesService } from './employees.service';
import { Employee } from './employees.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 


@Component({
  selector: 'app-employees',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  isEditModalOpen = false;

  constructor(private employeesService: EmployeesService) {}

  ngOnInit(): void {
    const companyId = 'empresa123';
    this.employeesService.getEmployeesByCompany(companyId).subscribe(data => {
      this.employees = data;
    });
  }

  openEditModal(employee: Employee): void {
    this.selectedEmployee = { ...employee };
    this.isEditModalOpen = true;
  }

  saveEmployee(): void {
    if (this.selectedEmployee) {
      const index = this.employees.findIndex(e => e.id === this.selectedEmployee!.id);
      if (index !== -1) {
        this.employees[index] = { ...this.selectedEmployee };

        this.isEditModalOpen = false;
        this.selectedEmployee = null;
      }
    }
  }

  cancelEdit(): void {
    this.isEditModalOpen = false;
    this.selectedEmployee = null;
  }

  confirmDelete(employee: Employee): void {
    const confirmed = confirm(`¿Seguro que deseas eliminar a ${employee.name}?`);
    if (confirmed) {
      this.employees = this.employees.filter(e => e.id !== employee.id);
    
    }
  }
}