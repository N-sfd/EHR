import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ProviderTemplate, VisitType, NoteTemplate, OrderSet } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class ProviderTemplatesMockService {
  private templates: Map<number, ProviderTemplate> = new Map();

  constructor() {
    // Initialize with default templates for demo providers
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    // Default template for Provider 1 (Dr. Amelia Carter - Family Medicine)
    this.templates.set(1, {
      id: 1,
      providerId: 1,
      providerName: 'Dr. Amelia Carter',
      visitTypes: [
        {
          id: 1,
          name: 'New Patient Visit',
          durationMinutes: 60,
          allowedDepartments: [1],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 2,
          name: 'Follow-up Visit',
          durationMinutes: 30,
          allowedDepartments: [1],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 3,
          name: 'Annual Physical',
          durationMinutes: 45,
          allowedDepartments: [1],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room', 'Lab'],
          allowOverbook: false,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 2 (Dr. Ryan Patel - Cardiology)
    this.templates.set(2, {
      id: 2,
      providerId: 2,
      providerName: 'Dr. Ryan Patel',
      visitTypes: [
        {
          id: 4,
          name: 'Cardiology Consultation',
          durationMinutes: 60,
          allowedDepartments: [2],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room', 'EKG'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 5,
          name: 'Cardiac Follow-up',
          durationMinutes: 30,
          allowedDepartments: [2],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 6,
          name: 'Stress Test Review',
          durationMinutes: 20,
          allowedDepartments: [2],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 3 (Dr. Sophia Nguyen - Pediatrics)
    this.templates.set(3, {
      id: 3,
      providerId: 3,
      providerName: 'Dr. Sophia Nguyen',
      visitTypes: [
        {
          id: 7,
          name: 'Pediatric New Patient',
          durationMinutes: 45,
          allowedDepartments: [3],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 8,
          name: 'Well Child Visit',
          durationMinutes: 30,
          allowedDepartments: [3],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 9,
          name: 'Sick Visit',
          durationMinutes: 20,
          allowedDepartments: [3],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 4 (Dr. Noah Kim - Orthopedics)
    this.templates.set(4, {
      id: 4,
      providerId: 4,
      providerName: 'Dr. Noah Kim',
      visitTypes: [
        {
          id: 10,
          name: 'Orthopedic Consultation',
          durationMinutes: 60,
          allowedDepartments: [4],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room', 'X-Ray'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 11,
          name: 'Follow-up Visit',
          durationMinutes: 30,
          allowedDepartments: [4],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 12,
          name: 'Injection Visit',
          durationMinutes: 15,
          allowedDepartments: [4],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room', 'Procedure Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 5 (Dr. Olivia Garcia - Dermatology)
    this.templates.set(5, {
      id: 5,
      providerId: 5,
      providerName: 'Dr. Olivia Garcia',
      visitTypes: [
        {
          id: 13,
          name: 'Dermatology Consultation',
          durationMinutes: 45,
          allowedDepartments: [5],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 14,
          name: 'Skin Check',
          durationMinutes: 30,
          allowedDepartments: [5],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 15,
          name: 'Procedure Visit',
          durationMinutes: 20,
          allowedDepartments: [5],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room', 'Procedure Room'],
          allowOverbook: false,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 6 (Dr. James Wilson - Internal Medicine)
    this.templates.set(6, {
      id: 6,
      providerId: 6,
      providerName: 'Dr. James Wilson',
      visitTypes: [
        {
          id: 16,
          name: 'Internal Medicine Consultation',
          durationMinutes: 60,
          allowedDepartments: [1],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 17,
          name: 'Follow-up Visit',
          durationMinutes: 30,
          allowedDepartments: [1],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 18,
          name: 'Annual Physical',
          durationMinutes: 45,
          allowedDepartments: [1],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room', 'Lab'],
          allowOverbook: false,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 7 (Dr. Emily Martinez - Endocrinology)
    this.templates.set(7, {
      id: 7,
      providerId: 7,
      providerName: 'Dr. Emily Martinez',
      visitTypes: [
        {
          id: 19,
          name: 'Endocrinology Consultation',
          durationMinutes: 60,
          allowedDepartments: [6],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 20,
          name: 'Diabetes Follow-up',
          durationMinutes: 30,
          allowedDepartments: [6],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 21,
          name: 'Thyroid Check',
          durationMinutes: 20,
          allowedDepartments: [6],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 8 (Dr. Michael Chen - Neurology)
    this.templates.set(8, {
      id: 8,
      providerId: 8,
      providerName: 'Dr. Michael Chen',
      visitTypes: [
        {
          id: 22,
          name: 'Neurology Consultation',
          durationMinutes: 60,
          allowedDepartments: [7],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 23,
          name: 'Headache Follow-up',
          durationMinutes: 30,
          allowedDepartments: [7],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 24,
          name: 'Seizure Follow-up',
          durationMinutes: 30,
          allowedDepartments: [7],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 9 (Dr. Sarah Thompson - Gynecology)
    this.templates.set(9, {
      id: 9,
      providerId: 9,
      providerName: 'Dr. Sarah Thompson',
      visitTypes: [
        {
          id: 25,
          name: 'Gynecology Consultation',
          durationMinutes: 45,
          allowedDepartments: [8],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 26,
          name: 'Annual Exam',
          durationMinutes: 30,
          allowedDepartments: [8],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 27,
          name: 'Follow-up Visit',
          durationMinutes: 20,
          allowedDepartments: [8],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 10 (Dr. David Rodriguez - Pulmonology)
    this.templates.set(10, {
      id: 10,
      providerId: 10,
      providerName: 'Dr. David Rodriguez',
      visitTypes: [
        {
          id: 28,
          name: 'Pulmonology Consultation',
          durationMinutes: 60,
          allowedDepartments: [9],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 29,
          name: 'Asthma Follow-up',
          durationMinutes: 30,
          allowedDepartments: [9],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 30,
          name: 'COPD Management',
          durationMinutes: 30,
          allowedDepartments: [9],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 11 (Dr. Lisa Anderson - Psychiatry)
    this.templates.set(11, {
      id: 11,
      providerId: 11,
      providerName: 'Dr. Lisa Anderson',
      visitTypes: [
        {
          id: 31,
          name: 'Psychiatry Consultation',
          durationMinutes: 60,
          allowedDepartments: [10],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 32,
          name: 'Therapy Session',
          durationMinutes: 45,
          allowedDepartments: [10],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 33,
          name: 'Medication Follow-up',
          durationMinutes: 30,
          allowedDepartments: [10],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });

    // Default template for Provider 12 (Dr. Robert Taylor - Gastroenterology)
    this.templates.set(12, {
      id: 12,
      providerId: 12,
      providerName: 'Dr. Robert Taylor',
      visitTypes: [
        {
          id: 34,
          name: 'Gastroenterology Consultation',
          durationMinutes: 60,
          allowedDepartments: [11],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: false,
          isActive: true
        },
        {
          id: 35,
          name: 'Follow-up Visit',
          durationMinutes: 30,
          allowedDepartments: [11],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        },
        {
          id: 36,
          name: 'Procedure Consultation',
          durationMinutes: 20,
          allowedDepartments: [11],
          defaultProviderType: 'PHYSICIAN',
          requiredResources: ['Exam Room'],
          allowOverbook: true,
          isActive: true
        }
      ],
      noteTemplates: [],
      orderSets: []
    });
  }

  getByProvider(providerId: number): Observable<ProviderTemplate> {
    const template = this.templates.get(providerId);
    if (template) {
      // Return a deep copy to prevent mutations
      return of({
        ...template,
        visitTypes: template.visitTypes.map(vt => ({ ...vt })),
        noteTemplates: template.noteTemplates.map(nt => ({ ...nt })),
        orderSets: template.orderSets.map(os => ({ ...os }))
      }).pipe(delay(200));
    }

    // Return empty template if not found
    const emptyTemplate: ProviderTemplate = {
      id: undefined,
      providerId,
      providerName: `Provider ${providerId}`,
      visitTypes: [],
      noteTemplates: [],
      orderSets: []
    };
    return of(emptyTemplate).pipe(delay(200));
  }

  save(providerId: number, template: ProviderTemplate): Observable<ProviderTemplate> {
    const saved: ProviderTemplate = {
      ...template,
      id: template.id || Math.floor(Math.random() * 1000),
      providerId,
      providerName: template.providerName || `Provider ${providerId}`,
      visitTypes: template.visitTypes.map(vt => ({ ...vt })),
      noteTemplates: template.noteTemplates.map(nt => ({ ...nt })),
      orderSets: template.orderSets.map(os => ({ ...os }))
    };
    this.templates.set(providerId, saved);
    return of({ ...saved }).pipe(delay(300));
  }

  getAll(): Observable<ProviderTemplate[]> {
    return of(Array.from(this.templates.values())).pipe(delay(200));
  }
}

