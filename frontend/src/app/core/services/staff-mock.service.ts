import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Staff } from '../models/staff.model';

@Injectable({
  providedIn: 'root'
})
export class StaffMockService {
  private mockStaff: Staff[] = [
    // Doctors
    {
      id: 1,
      staffCode: 'S-001',
      firstName: 'Amelia',
      lastName: 'Carter',
      emailAddress: 'amelia.carter@example.com',
      phoneNumber: '555-1001',
      isDoctor: true,
      doctorCode: 'D-001',
      departmentId: 1,
      designationId: 1,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 2,
      staffCode: 'S-002',
      firstName: 'Ryan',
      lastName: 'Patel',
      emailAddress: 'ryan.patel@example.com',
      phoneNumber: '555-1002',
      isDoctor: true,
      doctorCode: 'D-002',
      departmentId: 2,
      designationId: 1,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=15'
    },
    {
      id: 3,
      staffCode: 'S-003',
      firstName: 'Sophia',
      lastName: 'Nguyen',
      emailAddress: 'sophia.nguyen@example.com',
      phoneNumber: '555-1003',
      isDoctor: true,
      doctorCode: 'D-003',
      departmentId: 3,
      designationId: 1,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=20'
    },
    {
      id: 4,
      staffCode: 'S-004',
      firstName: 'Noah',
      lastName: 'Kim',
      emailAddress: 'noah.kim@example.com',
      phoneNumber: '555-1004',
      isDoctor: true,
      doctorCode: 'D-004',
      departmentId: 4,
      designationId: 1,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=33'
    },
    {
      id: 5,
      staffCode: 'S-005',
      firstName: 'Olivia',
      lastName: 'Garcia',
      emailAddress: 'olivia.garcia@example.com',
      phoneNumber: '555-1005',
      isDoctor: true,
      doctorCode: 'D-005',
      departmentId: 5,
      designationId: 1,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=47'
    },
    // Nurses
    {
      id: 6,
      staffCode: 'S-006',
      firstName: 'Emily',
      lastName: 'Watson',
      emailAddress: 'emily.watson@example.com',
      phoneNumber: '555-2001',
      isDoctor: false,
      departmentId: 1,
      designationId: 2,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=24'
    },
    {
      id: 7,
      staffCode: 'S-007',
      firstName: 'Michael',
      lastName: 'Roberts',
      emailAddress: 'michael.roberts@example.com',
      phoneNumber: '555-2002',
      isDoctor: false,
      departmentId: 2,
      designationId: 2,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=25'
    },
    {
      id: 8,
      staffCode: 'S-008',
      firstName: 'Sarah',
      lastName: 'Mitchell',
      emailAddress: 'sarah.mitchell@example.com',
      phoneNumber: '555-2003',
      isDoctor: false,
      departmentId: 3,
      designationId: 2,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=26'
    },
    {
      id: 9,
      staffCode: 'S-009',
      firstName: 'David',
      lastName: 'Lee',
      emailAddress: 'david.lee@example.com',
      phoneNumber: '555-2004',
      isDoctor: false,
      departmentId: 1,
      designationId: 2,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=27'
    },
    {
      id: 10,
      staffCode: 'S-010',
      firstName: 'Lisa',
      lastName: 'Anderson',
      emailAddress: 'lisa.anderson@example.com',
      phoneNumber: '555-2005',
      isDoctor: false,
      departmentId: 4,
      designationId: 2,
      employmentStatus: 'ACTIVE',
      status: 'ACTIVE',
      photoUrl: 'https://i.pravatar.cc/150?img=28'
    }
  ];

  getAll(): Observable<Staff[]> {
    return of([...this.mockStaff]).pipe(delay(300));
  }

  getById(id: number | string): Observable<Staff> {
    const staffId = typeof id === 'string' ? parseInt(id, 10) : id;
    const staff = this.mockStaff.find(s => s.id === staffId);
    if (staff) {
      return of({ ...staff }).pipe(delay(200));
    }
    return of(null as any).pipe(delay(200));
  }

  create(staff: Staff): Observable<Staff> {
    const newStaff: Staff = {
      ...staff,
      id: this.mockStaff.length + 1,
      staffCode: `S-${String(this.mockStaff.length + 1).padStart(3, '0')}`,
      status: 'ACTIVE'
    };
    this.mockStaff.push(newStaff);
    return of(newStaff).pipe(delay(400));
  }

  update(id: string, staff: Staff): Observable<Staff> {
    const staffId = parseInt(id, 10);
    const index = this.mockStaff.findIndex(s => s.id === staffId);
    if (index >= 0) {
      this.mockStaff[index] = { ...this.mockStaff[index], ...staff };
      return of(this.mockStaff[index]).pipe(delay(400));
    }
    return of(staff).pipe(delay(400));
  }

  delete(id: string): Observable<void> {
    const staffId = parseInt(id, 10);
    const index = this.mockStaff.findIndex(s => s.id === staffId);
    if (index >= 0) {
      this.mockStaff.splice(index, 1);
    }
    return of(undefined).pipe(delay(300));
  }
}

