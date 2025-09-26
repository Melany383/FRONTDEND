import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Correct import for autoTable

interface InspectionItem {
  name: string;
  compliance: boolean;
  observations: string;
}

interface InspectionArea {
  name: string;
  items: InspectionItem[];
  compliancePercentage: number;
  isAddingNew: boolean;
  newItemName: string;
  newItemCompliance: boolean;
  newItemObservations: string;
}

// CORRECTED INTERFACE HERE
interface InspectionSummary {
  area: string;
  completed: number;
  pending: number; // This should be 'pending', not 'isAddingNew'
  compliance: number;
}

interface AreaTemplate {
  name: string;
  items: string[];
}

@Component({
  selector: 'app-inspecciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspecciones.component.html',
  styleUrls: ['./inspecciones.component.scss']
})
export class InspeccionesComponent implements OnInit {
  isAddingNewArea = false;
  newAreaName = '';
  selectedTemplate: string = '';
  showTemplateSelector = false;

  // Plantillas predefinidas para cada área
  areaTemplates: AreaTemplate[] = [
    {
      name: 'Bodegas',
      items: [
        'Condiciones de ventilación',
        'Iluminación adecuada',
        'Piso libre de obstáculos',
        'Accesibilidad de rutas de evacuación',
        'Señalización de emergencia visible'
      ]
    },
    {
      name: 'Establecimiento Principal',
      items: [
        'Iluminación adecuada',
        'Condiciones de temperatura',
        'Señalización de seguridad visible',
        'Accesibilidad a rutas de evacuación',
        'Zonas libres de obstáculos'
      ]
    },
    {
      name: 'Oficinas',
      items: [
        'Iluminación adecuada',
        'Ventilación adecuada',
        'Zonas de trabajo libres de obstáculos',
        'Condiciones de temperatura',
        'Accesibilidad a las rutas de evacuación'
      ]
    },
    {
      name: 'Pasillos y Áreas Comunes',
      items: [
        'Accesibilidad de rutas de evacuación',
        'Señalización visible',
        'Zonas de paso libres de obstáculos',
        'Estado de las puertas de emergencia'
      ]
    },
    {
      name: 'Zonas de Trabajo',
      items: [
        'Condiciones de ventilación',
        'Condiciones de ruido',
        'Condiciones de iluminación',
        'Señalización visible',
        'Uso de EPP'
      ]
    },
    {
      name: 'Salidas de Emergencia',
      items: [
        'Almacenaje adecuado',
        'Ventilación adecuada',
        'Estado de los muebles',
        'Accesibilidad y limpieza'
      ]
    },
    {
      name: 'Cocina',
      items: [
        'Ventilación adecuada',
        'Estado de los muebles',
        'Accesibilidad y limpieza'
      ]
    },
    {
      name: 'Baños',
      items: [
        'Estado de limpieza',
        'Accesibilidad',
        'Higiene y orden'
      ]
    },
    {
      name: 'Equipos de Protección',
      items: [
        'Disponibilidad de EPP',
        'Estado de los EPP',
        'Accesibilidad de EPP'
      ]
    },
    {
      name: 'Almacenamiento de Productos Químicos',
      items: [
        'Almacenaje adecuado',
        'Seguridad de productos químicos'
      ]
    },
    {
      name: 'Áreas de Descanso',
      items: [
        'Estado de limpieza',
        'Comodidad',
        'Accesibilidad'
      ]
    }
  ];

  inspectionAreas: InspectionArea[] = [];
  inspectionSummary: InspectionSummary[] = [];

  constructor() { }

  ngOnInit() {
    this.loadInspections(); // Cargar los datos al iniciar el componente
    this.updateSummary();
  }

  // Método para agregar nueva área
  addNewArea() {
    this.showTemplateSelector = true;
  }

  // Método para seleccionar plantilla
  selectTemplate() {
    const template = this.areaTemplates.find(t => t.name === this.selectedTemplate);
    if (template) {
      this.inspectionAreas.push({
        name: template.name,
        items: template.items.map(item => ({
          name: item,
          compliance: false,
          observations: ''
        })),
        compliancePercentage: 0,
        isAddingNew: false,
        newItemName: '',
        newItemCompliance: false,
        newItemObservations: ''
      });
      this.calculateAllCompliancePercentages();
      this.updateSummary();
      this.showTemplateSelector = false;
      this.selectedTemplate = '';
      this.saveInspections(); // Guardar cambios
    }
  }

  // Método para crear área personalizada
  createCustomArea() {
    if (this.newAreaName.trim()) {
      this.inspectionAreas.push({
        name: this.newAreaName,
        items: [],
        compliancePercentage: 0,
        isAddingNew: false,
        newItemName: '',
        newItemCompliance: false,
        newItemObservations: ''
      });
      this.newAreaName = '';
      this.isAddingNewArea = false;
      this.showTemplateSelector = false;
      this.updateSummary();
      this.saveInspections(); // Guardar cambios
    }
  }

  cancelTemplateSelection() {
    this.showTemplateSelector = false;
    this.selectedTemplate = '';
    this.newAreaName = ''; // Limpiar el nombre del área personalizada al cancelar
  }

  // Resto de métodos (addNewItem, saveNewItem, removeArea, removeItem, etc.)
  addNewItem(areaIndex: number) {
    this.inspectionAreas[areaIndex].isAddingNew = true;
  }

  saveNewItem(areaIndex: number) {
    const area = this.inspectionAreas[areaIndex];
    if (area.newItemName.trim()) {
      area.items.push({
        name: area.newItemName.trim(),
        compliance: area.newItemCompliance,
        observations: area.newItemObservations.trim()
      });
      area.newItemName = '';
      area.newItemCompliance = false;
      area.newItemObservations = '';
      area.isAddingNew = false;
      this.calculateCompliancePercentage(areaIndex);
      this.updateSummary();
      this.saveInspections(); // Guardar cambios
    }
  }

  cancelNewItem(areaIndex: number) {
    const area = this.inspectionAreas[areaIndex];
    area.isAddingNew = false;
    area.newItemName = '';
    area.newItemCompliance = false;
    area.newItemObservations = '';
  }

  removeArea(areaIndex: number) {
    if (confirm('¿Está seguro de eliminar esta área y todos sus ítems?')) {
      this.inspectionAreas.splice(areaIndex, 1);
      this.updateSummary();
      this.saveInspections(); // Guardar cambios
    }
  }

  removeItem(areaIndex: number, itemIndex: number) {
    if (confirm('¿Está seguro de eliminar este ítem?')) {
      this.inspectionAreas[areaIndex].items.splice(itemIndex, 1);
      this.calculateCompliancePercentage(areaIndex);
      this.updateSummary();
      this.saveInspections(); // Guardar cambios
    }
  }

  calculateCompliancePercentage(areaIndex: number) {
    const area = this.inspectionAreas[areaIndex];
    if (area.items.length === 0) {
      area.compliancePercentage = 0;
      return;
    }

    const compliantItems = area.items.filter(item => item.compliance).length;
    area.compliancePercentage = Math.round((compliantItems / area.items.length) * 100);
    this.updateSummary(); // Asegurarse de que el resumen se actualice con cada cambio de porcentaje
  }

  calculateAllCompliancePercentages() {
    this.inspectionAreas.forEach((area, index) => {
      this.calculateCompliancePercentage(index);
    });
  }

  updateSummary() {
    this.inspectionSummary = this.inspectionAreas.map(area => {
      const completed = area.items.filter(item => item.compliance).length;
      const pending = area.items.length - completed;
      const compliance = area.items.length > 0 ? Math.round((completed / area.items.length) * 100) : 0;

      return {
        area: area.name,
        completed,
        pending, // This is correctly assigned as 'pending'
        compliance
      };
    });
  }

  // Métodos para guardar y cargar datos
  saveInspections() {
    localStorage.setItem('inspectionData', JSON.stringify(this.inspectionAreas));
  }

  loadInspections() {
    const savedData = localStorage.getItem('inspectionData');
    if (savedData) {
      this.inspectionAreas = JSON.parse(savedData);
      // Asegurarse de que las propiedades reactivas estén inicializadas si se cargan desde el almacenamiento local
      this.inspectionAreas.forEach(area => {
        if (typeof area.isAddingNew === 'undefined') {
          area.isAddingNew = false;
        }
        if (typeof area.newItemName === 'undefined') {
          area.newItemName = '';
        }
        if (typeof area.newItemCompliance === 'undefined') {
          area.newItemCompliance = false;
        }
        if (typeof area.newItemObservations === 'undefined') {
          area.newItemObservations = '';
        }
        this.calculateCompliancePercentage(this.inspectionAreas.indexOf(area)); // Recalcular porcentajes al cargar
      });
    }
  }

  exportToPDF() {
    const doc = new jsPDF();

    const title = 'Reporte de Inspecciones de Seguridad';
    const date = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    // Título y fecha
    doc.setFontSize(18);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${date}`, 14, 25);

    const tableData: (string | { content: string; colSpan?: number; styles?: any })[][] = [];

    // Encabezado de la tabla principal
    const mainTableHeaders = [['Área/Sección', 'Ítem de Inspección', 'Cumplimiento', 'Observaciones', 'Cumplimiento (%)']];

    this.inspectionAreas.forEach(area => {
      // Fila para el nombre del área
      tableData.push([{
        content: area.name,
        colSpan: 5, // Abarca todas las columnas
        styles: { fillColor: [200, 200, 200], fontStyle: 'bold' }
      }]);

      if (area.items.length === 0) {
        tableData.push([
          '', // Columna Área (vacía ya que la abarca el título del área)
          'No hay ítems registrados para esta área.',
          '',
          '',
          `${area.compliancePercentage}%`
        ]);
      } else {
        area.items.forEach((item, index) => {
          tableData.push([
            '', // Columna Área (vacía ya que la abarca el título del área)
            item.name,
            item.compliance ? 'Sí' : 'No',
            item.observations,
            index === 0 ? `${area.compliancePercentage}%` : '' // Solo para la primera fila del área
          ]);
        });
      }
    });

    // Call autoTable as a function, passing the doc instance
    autoTable(doc, {
      head: mainTableHeaders,
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 }, // Área
        1: { cellWidth: 'auto' }, // Ítem
        2: { cellWidth: 20, halign: 'center' }, // Cumplimiento
        3: { cellWidth: 'auto' }, // Observaciones
        4: { cellWidth: 25, halign: 'center' } // Cumplimiento (%)
      },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    // Añadir resumen
    doc.addPage(); // Nueva página para el resumen
    doc.setFontSize(16);
    doc.text('Resumen de Inspecciones', 14, 20);

    const summaryHeaders = [['Área', 'Realizadas', 'Pendientes', 'Cumplimiento']];
    const summaryData: (string | number)[][] = this.inspectionSummary.map(summary => [
      summary.area,
      summary.completed,
      summary.pending, // Now 'pending' exists in the InspectionSummary interface
      summary.compliance + '%'
    ]);

    // Call autoTable as a function for the summary table as well
    autoTable(doc, {
      head: summaryHeaders,
      body: summaryData,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [34, 139, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' }
      },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`Inspecciones_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  }
}