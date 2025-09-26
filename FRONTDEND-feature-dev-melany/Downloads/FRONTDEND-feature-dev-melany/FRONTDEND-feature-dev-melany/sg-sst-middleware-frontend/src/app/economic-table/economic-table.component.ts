import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EconomicActivity {
  tipo_riesgo: number;
  codigo_ciiu: string;
  codigo_adicional: string;
  descripcion: string;
}

@Component({
  selector: 'app-economic-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './economic-table.component.html',
  styleUrls: ['./economic-table.component.scss']
})
export class EconomicTableComponent {
  activities: EconomicActivity[] = [];
  filteredActivities: EconomicActivity[] = [];
  currentPage = 1;
  readonly itemsPerPage = 5; // Fijo en 5 elementos por página
  searchTerm = '';
  selectedActivity: EconomicActivity | null = null;
  
  @Output() activitySelected = new EventEmitter<EconomicActivity | null>();

  constructor(private http: HttpClient) {
    this.loadData();
  }

  loadData(): void {
    this.http.get<EconomicActivity[]>('/act-econ(complete).json').subscribe({
      next: (data) => {
        this.activities = data;
        this.filteredActivities = [...this.activities];
      },
      error: (err) => console.error('Error loading data:', err)
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredActivities = [...this.activities];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredActivities = this.activities.filter(activity => 
        activity.codigo_ciiu.toLowerCase().includes(term) ||
        activity.codigo_adicional.toLowerCase().includes(term) ||
        activity.descripcion.toLowerCase().includes(term) ||
        activity.tipo_riesgo.toString().includes(term)
      );
    }
    this.currentPage = 1;
  }

  get paginatedActivities(): EconomicActivity[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredActivities.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredActivities.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar primera página, página actual y últimas páginas
      pages.push(1);
      
      if (this.currentPage > 2) {
        pages.push(this.currentPage - 1);
      }
      if (this.currentPage > 1 && this.currentPage < this.totalPages) {
        pages.push(this.currentPage);
      }
      if (this.currentPage < this.totalPages - 1) {
        pages.push(this.currentPage + 1);
      }
      
      pages.push(this.totalPages);
    }
    
    return [...new Set(pages)]; // Eliminar duplicados
  }

  toggleSelection(activity: EconomicActivity): void {
    if (this.isSelected(activity)) {
      this.clearSelection();
    } else {
      this.selectedActivity = activity;
      this.activitySelected.emit(activity);
    }
  }

  clearSelection(): void {
    this.selectedActivity = null;
    this.activitySelected.emit(null);
  }

  isSelected(activity: EconomicActivity): boolean {
    return this.selectedActivity?.codigo_ciiu === activity.codigo_ciiu && 
           this.selectedActivity?.codigo_adicional === activity.codigo_adicional;
  }

  getCurrentRange(): string {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredActivities.length);
    return `${start}-${end}`;
  }
}