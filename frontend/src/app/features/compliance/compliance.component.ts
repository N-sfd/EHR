import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

interface License {
  id: string;
  type: string;
  holder: string;
  number: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'valid' | 'pending' | 'expired' | 'expiring-soon';
  daysUntilExpiry: number;
}

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
}

interface PolicyUpdate {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  isNew: boolean;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TitleCasePipe,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css']
})
export class ComplianceComponent implements OnInit {
  activeTab: 'licensing' | 'audit' | 'policies' = 'licensing';
  
  // Licensing Status
  licenses: License[] = [
    { 
      id: '1', 
      type: 'Medical License', 
      holder: 'Dr. Sarah Johnson', 
      number: 'MD-2024-001', 
      issueDate: new Date('2022-01-15'), 
      expiryDate: new Date('2025-01-15'), 
      status: 'valid', 
      daysUntilExpiry: 352 
    },
    { 
      id: '2', 
      type: 'DEA Registration', 
      holder: 'Dr. James Wilson', 
      number: 'DEA-2024-002', 
      issueDate: new Date('2023-06-01'), 
      expiryDate: new Date('2024-03-15'), 
      status: 'expiring-soon', 
      daysUntilExpiry: 47 
    },
    { 
      id: '3', 
      type: 'Nursing License', 
      holder: 'Emily Chen', 
      number: 'RN-2024-003', 
      issueDate: new Date('2021-08-20'), 
      expiryDate: new Date('2024-08-20'), 
      status: 'pending', 
      daysUntilExpiry: 205 
    },
    { 
      id: '4', 
      type: 'Medical License', 
      holder: 'Dr. Michael Torres', 
      number: 'MD-2024-004', 
      issueDate: new Date('2020-03-10'), 
      expiryDate: new Date('2023-12-31'), 
      status: 'expired', 
      daysUntilExpiry: -28 
    },
    { 
      id: '5', 
      type: 'Lab Certification', 
      holder: 'Robert Kim', 
      number: 'LAB-2024-005', 
      issueDate: new Date('2023-01-10'), 
      expiryDate: new Date('2026-01-10'), 
      status: 'valid', 
      daysUntilExpiry: 717 
    }
  ];
  
  filteredLicenses: License[] = [];
  licenseFilter = 'all';
  
  // Audit Logs
  auditLogs: AuditLog[] = [
    { 
      id: '1', 
      timestamp: new Date('2024-01-28T10:30:00'), 
      user: 'admin@clinic.com', 
      action: 'Updated', 
      resource: 'Patient Record', 
      details: 'Modified patient demographics', 
      ipAddress: '192.168.1.100' 
    },
    { 
      id: '2', 
      timestamp: new Date('2024-01-28T09:15:00'), 
      user: 'doctor.smith@clinic.com', 
      action: 'Viewed', 
      resource: 'Medical History', 
      details: 'Accessed patient medical history', 
      ipAddress: '192.168.1.105' 
    },
    { 
      id: '3', 
      timestamp: new Date('2024-01-28T08:45:00'), 
      user: 'nurse.chen@clinic.com', 
      action: 'Created', 
      resource: 'Appointment', 
      details: 'Scheduled new appointment', 
      ipAddress: '192.168.1.110' 
    },
    { 
      id: '4', 
      timestamp: new Date('2024-01-27T16:20:00'), 
      user: 'admin@clinic.com', 
      action: 'Deleted', 
      resource: 'Document', 
      details: 'Removed outdated document', 
      ipAddress: '192.168.1.100' 
    },
    { 
      id: '5', 
      timestamp: new Date('2024-01-27T14:10:00'), 
      user: 'doctor.wilson@clinic.com', 
      action: 'Updated', 
      resource: 'Prescription', 
      details: 'Modified prescription details', 
      ipAddress: '192.168.1.105' 
    }
  ];
  
  filteredLogs: AuditLog[] = [];
  logSearchTerm = '';
  logDateFilter = 'all';
  logActionFilter = 'all';
  
  // Policy Updates
  policies: PolicyUpdate[] = [
    { 
      id: '1', 
      title: 'HIPAA Compliance Update', 
      description: 'New requirements for patient data encryption', 
      category: 'Privacy', 
      date: new Date('2024-01-25'), 
      isNew: true, 
      priority: 'high' 
    },
    { 
      id: '2', 
      title: 'OSHA Safety Regulations', 
      description: 'Updated workplace safety protocols', 
      category: 'Safety', 
      date: new Date('2024-01-20'), 
      isNew: true, 
      priority: 'high' 
    },
    { 
      id: '3', 
      title: 'Medicare Billing Rules', 
      description: 'Changes to Medicare reimbursement procedures', 
      category: 'Billing', 
      date: new Date('2024-01-15'), 
      isNew: false, 
      priority: 'medium' 
    },
    { 
      id: '4', 
      title: 'Drug Disposal Guidelines', 
      description: 'Updated controlled substance disposal requirements', 
      category: 'Pharmacy', 
      date: new Date('2024-01-10'), 
      isNew: false, 
      priority: 'medium' 
    },
    { 
      id: '5', 
      title: 'Staff Training Requirements', 
      description: 'New mandatory training modules', 
      category: 'HR', 
      date: new Date('2024-01-05'), 
      isNew: false, 
      priority: 'low' 
    }
  ];
  
  filteredPolicies: PolicyUpdate[] = [];
  policyCategoryFilter = 'all';
  
  statuses = ['all', 'valid', 'pending', 'expired', 'expiring-soon'];
  actions = ['all', 'Created', 'Updated', 'Viewed', 'Deleted'];
  selectedTabIndex = 0;
  
  ngOnInit(): void {
    this.filteredLicenses = this.licenses;
    this.filteredLogs = this.auditLogs;
    this.filteredPolicies = this.policies;
  }
  
  onTabChange(index: number) {
    const tabs: ('licensing' | 'audit' | 'policies')[] = ['licensing', 'audit', 'policies'];
    this.activeTab = tabs[index];
  }
  
  setActiveTab(tab: 'licensing' | 'audit' | 'policies') {
    this.activeTab = tab;
    const tabs: ('licensing' | 'audit' | 'policies')[] = ['licensing', 'audit', 'policies'];
    this.selectedTabIndex = tabs.indexOf(tab);
  }
  
  // Licensing methods
  applyLicenseFilter() {
    if (this.licenseFilter === 'all') {
      this.filteredLicenses = this.licenses;
    } else {
      this.filteredLicenses = this.licenses.filter(license => license.status === this.licenseFilter);
    }
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'valid': return 'status-valid';
      case 'pending': return 'status-pending';
      case 'expired': return 'status-expired';
      case 'expiring-soon': return 'status-expiring';
      default: return '';
    }
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  getAbsoluteDays(days: number): number {
    return Math.abs(days);
  }
  
  // Audit Log methods
  applyLogFilters() {
    this.filteredLogs = this.auditLogs.filter(log => {
      const matchesSearch = !this.logSearchTerm || 
        log.user.toLowerCase().includes(this.logSearchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(this.logSearchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(this.logSearchTerm.toLowerCase());
      const matchesAction = this.logActionFilter === 'all' || log.action === this.logActionFilter;
      
      let matchesDate = true;
      if (this.logDateFilter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        
        if (this.logDateFilter === 'today') {
          matchesDate = logDate.getTime() === today.getTime();
        } else if (this.logDateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = logDate >= weekAgo;
        } else if (this.logDateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          matchesDate = logDate >= monthAgo;
        }
      }
      
      return matchesSearch && matchesAction && matchesDate;
    });
  }
  
  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getActionClass(action: string): string {
    switch(action.toLowerCase()) {
      case 'created': return 'action-created';
      case 'updated': return 'action-updated';
      case 'viewed': return 'action-viewed';
      case 'deleted': return 'action-deleted';
      default: return '';
    }
  }
  
  // Policy methods
  applyPolicyFilter() {
    if (this.policyCategoryFilter === 'all') {
      this.filteredPolicies = this.policies;
    } else {
      this.filteredPolicies = this.policies.filter(policy => policy.category === this.policyCategoryFilter);
    }
  }
  
  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }
  
  getCategories(): string[] {
    return ['all', ...Array.from(new Set(this.policies.map(p => p.category)))];
  }
}

