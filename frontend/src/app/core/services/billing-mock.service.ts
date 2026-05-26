import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PatientBalance, PatientStatement, PatientPayment } from '../models/patient-snapshot.model';

const STORAGE_KEY_BALANCES = 'patient_balances_v1';
const STORAGE_KEY_STATEMENTS = 'patient_statements_v1';
const STORAGE_KEY_PAYMENTS = 'patient_payments_v1';

@Injectable({
  providedIn: 'root'
})
export class BillingMockService {
  private balances: PatientBalance[] = [];
  private statements: PatientStatement[] = [];
  private payments: PatientPayment[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.balances.length === 0) {
      this.seedDemoData();
    }
  }

  getBalances(patientId: number): Observable<PatientBalance> {
    let balance = this.balances.find(b => b.patientId === patientId);
    if (!balance) {
      balance = {
        patientId,
        insuranceBalance: 0,
        selfPayBalance: 0,
        totalBalance: 0,
        aging: {
          '0-30': 0,
          '31-60': 0,
          '61-90': 0,
          '90+': 0
        }
      };
      this.balances.push(balance);
      this.saveToStorage();
    }
    return of({ ...balance }).pipe(delay(200));
  }

  getStatements(patientId: number, limit: number = 5): Observable<PatientStatement[]> {
    const patientStatements = this.statements
      .filter(s => s.patientId === patientId)
      .sort((a, b) => new Date(b.statementDate).getTime() - new Date(a.statementDate).getTime())
      .slice(0, limit);
    return of([...patientStatements]).pipe(delay(200));
  }

  getPayments(patientId: number, limit: number = 5): Observable<PatientPayment[]> {
    const patientPayments = this.payments
      .filter(p => p.patientId === patientId)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, limit);
    return of([...patientPayments]).pipe(delay(200));
  }

  private seedDemoData(): void {
    // Seed balances
    this.balances = [
      {
        patientId: 1,
        insuranceBalance: 1250.00,
        selfPayBalance: 350.00,
        totalBalance: 1600.00,
        aging: {
          '0-30': 800.00,
          '31-60': 500.00,
          '61-90': 250.00,
          '90+': 50.00
        }
      },
      {
        patientId: 2,
        insuranceBalance: 0,
        selfPayBalance: 125.00,
        totalBalance: 125.00,
        aging: {
          '0-30': 125.00,
          '31-60': 0,
          '61-90': 0,
          '90+': 0
        }
      },
      {
        patientId: 3,
        insuranceBalance: 500.00,
        selfPayBalance: 0,
        totalBalance: 500.00,
        aging: {
          '0-30': 0,
          '31-60': 300.00,
          '61-90': 200.00,
          '90+': 0
        }
      }
    ];

    // Seed statements
    this.statements = [
      {
        id: 1,
        patientId: 1,
        statementDate: '2024-12-15',
        invoiceNumber: 'INV-2024-001',
        charged: 500.00,
        outstanding: 500.00,
        status: 'OUTSTANDING'
      },
      {
        id: 2,
        patientId: 1,
        statementDate: '2024-11-20',
        invoiceNumber: 'INV-2024-002',
        charged: 800.00,
        outstanding: 600.00,
        status: 'PARTIAL'
      },
      {
        id: 3,
        patientId: 1,
        statementDate: '2024-10-10',
        invoiceNumber: 'INV-2024-003',
        charged: 300.00,
        outstanding: 300.00,
        status: 'OUTSTANDING'
      },
      {
        id: 4,
        patientId: 2,
        statementDate: '2024-12-01',
        invoiceNumber: 'INV-2024-004',
        charged: 125.00,
        outstanding: 125.00,
        status: 'OUTSTANDING'
      },
      {
        id: 5,
        patientId: 3,
        statementDate: '2024-11-15',
        invoiceNumber: 'INV-2024-005',
        charged: 500.00,
        outstanding: 500.00,
        status: 'OUTSTANDING'
      }
    ];

    // Seed payments
    this.payments = [
      {
        id: 1,
        patientId: 1,
        paymentDate: '2024-12-10',
        paymentType: 'PAYMENT',
        amount: 200.00,
        paymentMethod: 'CREDIT_CARD',
        referenceNumber: 'CC-123456'
      },
      {
        id: 2,
        patientId: 1,
        paymentDate: '2024-11-25',
        paymentType: 'COPAY',
        amount: 25.00,
        paymentMethod: 'CASH'
      },
      {
        id: 3,
        patientId: 2,
        paymentDate: '2024-12-05',
        paymentType: 'COPAY',
        amount: 30.00,
        paymentMethod: 'DEBIT_CARD',
        referenceNumber: 'DB-789012'
      },
      {
        id: 4,
        patientId: 1,
        paymentDate: '2024-10-20',
        paymentType: 'PAYMENT',
        amount: 150.00,
        paymentMethod: 'CHECK',
        referenceNumber: 'CHK-345678'
      },
      {
        id: 5,
        patientId: 3,
        paymentDate: '2024-11-10',
        paymentType: 'DEDUCTIBLE',
        amount: 100.00,
        paymentMethod: 'ONLINE',
        referenceNumber: 'ONL-901234'
      }
    ];

    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const balancesStored = localStorage.getItem(STORAGE_KEY_BALANCES);
      if (balancesStored) {
        this.balances = JSON.parse(balancesStored);
      }

      const statementsStored = localStorage.getItem(STORAGE_KEY_STATEMENTS);
      if (statementsStored) {
        this.statements = JSON.parse(statementsStored);
      }

      const paymentsStored = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      if (paymentsStored) {
        this.payments = JSON.parse(paymentsStored);
      }
    } catch (e) {
      console.warn('Failed to load billing data from localStorage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_BALANCES, JSON.stringify(this.balances));
      localStorage.setItem(STORAGE_KEY_STATEMENTS, JSON.stringify(this.statements));
      localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(this.payments));
    } catch (e) {
      console.error('Failed to save billing data to localStorage:', e);
    }
  }
}

