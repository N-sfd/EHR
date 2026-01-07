import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BudgetItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface BillingAlert {
  id: string;
  type: 'overdue' | 'insurance';
  title: string;
  description: string;
  amount?: number;
  date: Date;
  priority: 'high' | 'medium' | 'low';
}

interface Expense {
  id: string;
  date: Date;
  category: string;
  description: string;
  amount: number;
  vendor: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css']
})
export class FinanceComponent implements OnInit {
  activeTab: 'budget' | 'alerts' | 'expenses' = 'budget';
  
  // Budget Overview
  budgetData: BudgetItem[] = [
    { category: 'Personnel', amount: 450000, percentage: 45, color: '#004F4F' },
    { category: 'Equipment', amount: 200000, percentage: 20, color: '#3AAFBF' },
    { category: 'Facilities', amount: 150000, percentage: 15, color: '#3A4A4A' },
    { category: 'Supplies', amount: 100000, percentage: 10, color: '#2EC8A7' },
    { category: 'Other', amount: 100000, percentage: 10, color: '#0D1F2D' }
  ];
  
  totalBudget = 1000000;
  
  // Billing Alerts
  alerts: BillingAlert[] = [
    { 
      id: '1', 
      type: 'overdue', 
      title: 'Invoice #INV-2024-001', 
      description: 'Payment overdue by 15 days', 
      amount: 12500, 
      date: new Date('2024-01-15'), 
      priority: 'high' 
    },
    { 
      id: '2', 
      type: 'insurance', 
      title: 'Insurance Claim Pending', 
      description: 'BlueCross claim requires additional documentation', 
      date: new Date('2024-01-20'), 
      priority: 'high' 
    },
    { 
      id: '3', 
      type: 'overdue', 
      title: 'Invoice #INV-2024-002', 
      description: 'Payment overdue by 5 days', 
      amount: 8500, 
      date: new Date('2024-01-25'), 
      priority: 'medium' 
    },
    { 
      id: '4', 
      type: 'insurance', 
      title: 'Medicare Reimbursement', 
      description: 'Awaiting approval for Q4 2023 claims', 
      date: new Date('2024-01-22'), 
      priority: 'low' 
    }
  ];
  
  filteredAlerts: BillingAlert[] = [];
  alertFilter = 'all';
  
  // Expense Tracker
  expenses: Expense[] = [
    { id: '1', date: new Date('2024-01-28'), category: 'Medical Supplies', description: 'Surgical gloves and masks', amount: 2500, vendor: 'MedSupply Co.', status: 'approved' },
    { id: '2', date: new Date('2024-01-27'), category: 'Equipment', description: 'X-Ray machine maintenance', amount: 5000, vendor: 'TechMed Services', status: 'pending' },
    { id: '3', date: new Date('2024-01-26'), category: 'Utilities', description: 'Monthly electricity bill', amount: 3200, vendor: 'City Power', status: 'approved' },
    { id: '4', date: new Date('2024-01-25'), category: 'Office Supplies', description: 'Stationery and printing', amount: 800, vendor: 'Office Depot', status: 'approved' },
    { id: '5', date: new Date('2024-01-24'), category: 'Facilities', description: 'Building maintenance', amount: 4500, vendor: 'Maintenance Pro', status: 'pending' }
  ];
  
  filteredExpenses: Expense[] = [];
  expenseSearchTerm = '';
  expenseCategoryFilter = 'all';
  expenseStatusFilter = 'all';
  sortColumn = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  editingExpenseId: string | null = null;
  
  categories = ['all', 'Medical Supplies', 'Equipment', 'Utilities', 'Office Supplies', 'Facilities', 'Other'];
  statuses = ['all', 'pending', 'approved', 'rejected'];
  
  ngOnInit(): void {
    this.filteredAlerts = this.alerts;
    this.filteredExpenses = this.expenses;
  }
  
  setActiveTab(tab: 'budget' | 'alerts' | 'expenses') {
    this.activeTab = tab;
  }
  
  // Budget methods
  getBudgetPercentage(item: BudgetItem): number {
    return item.percentage;
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  
  getCircumference(): number {
    return 2 * Math.PI * 80;
  }
  
  getOffset(index: number): number {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += (this.budgetData[i].percentage / 100) * this.getCircumference();
    }
    return -offset;
  }
  
  // Alert methods
  applyAlertFilter() {
    if (this.alertFilter === 'all') {
      this.filteredAlerts = this.alerts;
    } else {
      this.filteredAlerts = this.alerts.filter(alert => alert.type === this.alertFilter);
    }
  }
  
  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  // Expense methods
  applyExpenseFilters() {
    this.filteredExpenses = this.expenses.filter(expense => {
      const matchesSearch = !this.expenseSearchTerm || 
        expense.description.toLowerCase().includes(this.expenseSearchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(this.expenseSearchTerm.toLowerCase());
      const matchesCategory = this.expenseCategoryFilter === 'all' || expense.category === this.expenseCategoryFilter;
      const matchesStatus = this.expenseStatusFilter === 'all' || expense.status === this.expenseStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
    this.sortExpenses();
  }
  
  sortExpenses() {
    this.filteredExpenses.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch(this.sortColumn) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'vendor':
          aValue = a.vendor;
          bValue = b.vendor;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortExpenses();
  }
  
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
  
  startEdit(expense: Expense) {
    this.editingExpenseId = expense.id;
  }
  
  saveEdit(expense: Expense) {
    this.editingExpenseId = null;
    // In a real app, this would save to backend
  }
  
  cancelEdit() {
    this.editingExpenseId = null;
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }
}

