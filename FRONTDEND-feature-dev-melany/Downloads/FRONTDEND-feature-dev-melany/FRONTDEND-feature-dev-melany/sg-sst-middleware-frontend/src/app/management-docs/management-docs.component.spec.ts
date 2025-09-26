import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementDocsComponent } from './management-docs.component';

describe('ManagementDocsComponent', () => {
  let component: ManagementDocsComponent;
  let fixture: ComponentFixture<ManagementDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
