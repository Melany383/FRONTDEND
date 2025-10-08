
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Section {
  title: string;
  subsections: string[];
}

@Component({
  selector: 'app-management-docs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './management-docs.component.html',
  styleUrls: ['./management-docs.component.scss']
})
export class ManagementDocsComponent {
  searchText = signal('');
  selectedSubsection = signal<string | null>(null);
  lastOpenedSection = signal<string | null>(null);

  // Datos de ejemplo con documentos existentes
  existingDocuments: Record<string, boolean> = {
    'Política SST': true,
    'Objetivos': false,
    'Reglamento de la Empresa': true,
    'Plan de emergencias': true
  };

  sections = [
    {
      title: 'Planificación',
      subsections: [
        'Política SST',
        'Objetivos',
        'Responsable del SGSST',
        'Reglamento de la Empresa',
        'Requisitos Legales',
        'Roles y Responsabilidades',
        'Capacitación',
        'Comunicaciones',
        'Control Documental',
        'Identificación de peligros',
        'Evaluación de Estándares Mínimos',
        'Plan de trabajo Anual'
      ]
    },
    {
      title: 'Aplicación',
      subsections: [
        'Comité de convivencia',
        'Copasst - Vigía',
        'Gestión del cambio',
        'Adquisiciones'
      ]
    },
    {
      title: 'Medicina Preventiva',
      subsections: [
        'Reintegro',
        'Promoción y prevención',
        'Ergonomía',
        'Ausentismo',
        'Exámenes Médicos',
        'Perfil Sociodemográfico'
      ]
    },
    {
      title: 'Seguridad Industrial',
      subsections: [
        'Plan de emergencias',
        'Inspecciones',
        'Elementos de protección personal'
      ]
    },
    {
      title: 'Auditoría y Revisión',
      subsections: [
        'Registro de Accidentalidad',
        'Investigación de Accidente de Trabajo',
        'Indicadores SST'
      ]
    },
    {
      title: 'Mejoramiento Continuo',
      subsections: [
        'Acciones Preventivas, Correctivas y de Mejora'
      ]
    }
  ];

  // Computed properties con Signals
  filteredSections = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    
    if (!search) {
      return this.sections;
    }

    return this.sections
      .map(section => ({
        ...section,
        subsections: section.subsections.filter(sub => 
          sub.toLowerCase().includes(search) ||
          section.title.toLowerCase().includes(search)
        )
      }))
      .filter(section => section.subsections.length > 0);
  });

  totalFilteredSubsections = computed(() => {
    return this.filteredSections().reduce(
      (total, section) => total + section.subsections.length, 0
    );
  });

  onSearch(): void {
    // Forzar actualización si es necesario
    this.filteredSections();
  }

  clearSearch(): void {
    this.searchText.set('');
    this.selectedSubsection.set(null);
  }

  selectSubsection(subsection: string): void {
    this.selectedSubsection.set(subsection);
  }

  clearSelection(): void {
    this.selectedSubsection.set(null);
  }

  uploadDocument(): void {
    if (this.selectedSubsection()) {
      // Lógica para subir documento
      console.log(`Subiendo documento para: ${this.selectedSubsection()}`);
      this.existingDocuments[this.selectedSubsection()!] = true;
    }
  }

  downloadDocument(): void {
    if (this.selectedSubsection()) {
      // Lógica para descargar documento
      console.log(`Descargando documento: ${this.selectedSubsection()}`);
    }
  }

  hasDocument(subsection: string): boolean {
    return !!this.existingDocuments[subsection];
  }

  onPanelOpened(section: Section): void {
    this.lastOpenedSection.set(section.title);
  }
}