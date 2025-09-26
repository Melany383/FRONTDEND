import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
   imports: [CommonModule, RouterModule], 
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  footerMenus = [
    {
      title: 'Empresa',
      items: [
        { text: 'Sobre nosotros', link: '/nosotros' },
        { text: 'Blog', link: '/blog' },
        { text: 'Carreras', link: '/carreras' }
      ]
    },
    {
      title: 'Producto',
      items: [
        { text: 'Funciones', link: '/funciones' },
        { text: 'Precios', link: '/precios' },
        { text: 'Preguntas frecuentes', link: '/faq' }
      ]
    },
    {
      title: 'Soporte',
      items: [
        { text: 'Centro de ayuda', link: '/ayuda' },
        { text: 'Contáctanos', link: '/contacto' },
        { text: 'Términos', link: '/terminos' }
      ]
    }
  ];
}
