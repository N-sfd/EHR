import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './health-records.component.html',
  styleUrls: ['./health-records.component.css']
})
export class HealthRecordsComponent implements OnInit {
  private http = inject(HttpClient);

  records: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadRecords();
  }

  private loadRecords(): void {
    this.http.get<any[]>(`/api/patient/health-records`, { withCredentials: true })
      .pipe(catchError(() => of([])))
      .subscribe(data => {
        this.records = data || [];
        this.isLoading = false;
      });
  }

  downloadRecord(record: any): void {
    if (record.fileUrl) {
      window.open(record.fileUrl, '_blank');
    }
  }
}
