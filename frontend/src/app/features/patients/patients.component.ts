import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, finalize } from 'rxjs';
import { PatientService } from '../../core/services/patient.service';
import { Patient } from '../../core/models/patient.model';
import { PatientUpdateDrawerComponent } from '../../shared/components/patient-update-drawer/patient-update-drawer.component';

type SortKey = 'name' | 'dob' | 'status' | 'code';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PatientUpdateDrawerComponent],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit, OnDestroy {
  private patientService = inject(PatientService);
  private cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  private destroy$ = new Subject<void>();
  private reload$ = new Subject<void>();
  private search$ = new Subject<string>();

  // Data
  patients: Patient[] = [];
  filtered: Patient[] = [];
  paginated: Patient[] = [];

  // State
  isLoading = false;
  errorMessage: string | null = null;
  searchTerm = '';
  statusFilter = 'all';

  // Sort
  sortKey: SortKey = 'name';
  sortDir: SortDir = 'asc';

  // Pagination
  page = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  totalPages = 1;

  // Counts
  activeCount = 0;
  inactiveCount = 0;

  // Drawer
  selectedPatient: Patient | null = null;
  showDrawer = false;

  // Delete confirmation
  deletingId: number | null = null;

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.page = 1; this.buildView(); });

    this.reload$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        this.patients = [];
        return this.patientService.getAll().pipe(finalize(() => this.isLoading = false));
      })
    ).subscribe({
      next: (list) => {
        this.patients = (list || []).map(p => ({ ...p, id: (p as any).patientId || p.id }));
        this.page = 1;
        this.buildView();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load patients. Please try again.';
        this.patients = [];
        this.buildView();
      }
    });

    this.reload$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void { if (!this.isLoading) this.reload$.next(); }

  onSearch(): void { this.search$.next(this.searchTerm); }

  clearSearch(): void { this.searchTerm = ''; this.search$.next(''); }

  onFilterChange(): void { this.page = 1; this.buildView(); }

  setSort(key: SortKey): void {
    this.sortDir = this.sortKey === key ? (this.sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    this.sortKey = key;
    this.buildView();
  }

  getSortIcon(key: SortKey): string {
    if (this.sortKey !== key) return 'fa-sort';
    return this.sortDir === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  setPageSize(size: number): void { this.pageSize = +size; this.page = 1; this.buildView(); }
  goToPage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.page = p; this.buildView(); } }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  private dob(d?: string): number {
    if (!d) return 0;
    const t = Date.parse(d);
    return isNaN(t) ? 0 : t;
  }

  private buildView(): void {
    const s = this.searchTerm.trim().toLowerCase();

    let list = this.patients.filter(p => {
      if (this.statusFilter !== 'all' && p.status !== this.statusFilter) return false;
      if (!s) return true;
      const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase();
      return name.includes(s)
        || (p.patientCode ?? '').toLowerCase().includes(s)
        || (p.phoneNumber ?? '').includes(s)
        || (p.emailAddress ?? p.email ?? '').toLowerCase().includes(s)
        || (p.dateOfBirth ?? '').includes(s);
    });

    list.sort((a, b) => {
      const dir = this.sortDir === 'asc' ? 1 : -1;
      let av: any, bv: any;
      if (this.sortKey === 'name') {
        av = `${a.lastName ?? ''} ${a.firstName ?? ''}`.toLowerCase();
        bv = `${b.lastName ?? ''} ${b.firstName ?? ''}`.toLowerCase();
      } else if (this.sortKey === 'dob') {
        av = this.dob(a.dateOfBirth); bv = this.dob(b.dateOfBirth);
      } else if (this.sortKey === 'code') {
        av = a.patientCode ?? ''; bv = b.patientCode ?? '';
      } else {
        av = a.status ?? ''; bv = b.status ?? '';
      }
      return av > bv ? dir : av < bv ? -dir : 0;
    });

    this.activeCount = this.patients.filter(p => p.status === 'ACTIVE').length;
    this.inactiveCount = this.patients.filter(p => p.status !== 'ACTIVE').length;

    this.totalPages = list.length === 0 ? 1 : Math.ceil(list.length / this.pageSize);
    if (this.page > this.totalPages) this.page = this.totalPages;

    const start = (this.page - 1) * this.pageSize;
    this.filtered = list;
    this.paginated = list.slice(start, start + this.pageSize);
  }

  openDrawer(p: Patient): void { this.selectedPatient = p; this.showDrawer = true; }
  closeDrawer(): void { this.showDrawer = false; this.selectedPatient = null; }

  onPatientSaved(updated: Patient): void {
    const idx = this.patients.findIndex(p => p.id === updated.id);
    if (idx >= 0) this.patients[idx] = { ...updated };
    this.buildView();
    this.closeDrawer();
  }

  confirmDelete(p: Patient): void { this.deletingId = p.id ?? null; }
  cancelDelete(): void { this.deletingId = null; }

  deletePatient(p: Patient): void {
    if (!p.id) return;
    this.patientService.delete(p.id).subscribe({
      next: () => {
        this.patients = this.patients.filter(x => x.id !== p.id);
        this.deletingId = null;
        this.buildView();
      },
      error: () => { this.deletingId = null; alert('Failed to delete patient.'); }
    });
  }

  getAge(dob?: string): string {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return isNaN(age) || age < 0 ? '—' : `${age}y`;
  }

  getAvatar(p: Patient): string {
    if (p.photoUrl) return p.photoUrl;
    const initials = `${(p.firstName ?? '')[0] ?? ''}${(p.lastName ?? '')[0] ?? ''}`.toUpperCase() || '?';
    const colors = ['#004F4F','#2EC8A7','#3AAFBF','#1a6b6b','#006666'];
    const color = colors[(p.patientCode ?? 'A').charCodeAt(2) % colors.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="${color}"/><text x="20" y="26" font-size="15" font-family="Inter,sans-serif" font-weight="700" fill="#fff" text-anchor="middle">${initials}</text></svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
  }

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    img.src = this.getAvatar({ firstName: '', lastName: '' } as Patient);
    img.onerror = null;
  }

  exportCsv(): void {
    const rows = this.filtered.map(p => [
      p.patientCode ?? '', p.firstName ?? '', p.lastName ?? '',
      p.dateOfBirth ?? '', p.gender ?? '', p.status ?? '',
      p.phoneNumber ?? '', p.emailAddress ?? p.email ?? ''
    ]);
    const header = ['Code','First Name','Last Name','DOB','Gender','Status','Phone','Email'];
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `patients_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  trackById(_: number, p: Patient): any { return p.id ?? p.patientCode; }
}
