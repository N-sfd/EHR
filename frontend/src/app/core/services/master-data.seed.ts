import { MasterDepartment, MasterSpecialization, MasterDesignation } from '../models/master-data.model';

// Seed data for Departments
export const SEED_DEPARTMENTS: MasterDepartment[] = [
  { id: '1', name: 'Primary Care', code: 'PRIMARY_CARE', description: 'General primary care services', active: true, specialtyGroup: 'GENERAL' },
  { id: '2', name: 'Cardiology', code: 'CARDIO', description: 'Cardiac and cardiovascular services', active: true, specialtyGroup: 'CARDIAC' },
  { id: '3', name: 'Pediatrics', code: 'PEDS', description: 'Pediatric care services', active: true, specialtyGroup: 'PEDIATRIC' },
  { id: '4', name: 'Orthopedics', code: 'ORTHO', description: 'Orthopedic and musculoskeletal services', active: true, specialtyGroup: 'ORTHOPEDIC' },
  { id: '5', name: 'Dermatology', code: 'DERM', description: 'Dermatology and skin care services', active: true, specialtyGroup: 'DERMATOLOGY' },
  { id: '6', name: 'Radiology', code: 'RADIOLOGY', description: 'Medical imaging and radiology services', active: true, specialtyGroup: 'DIAGNOSTIC' },
  { id: '7', name: 'Laboratory', code: 'LAB', description: 'Laboratory and pathology services', active: true, specialtyGroup: 'DIAGNOSTIC' },
  { id: '8', name: 'Pharmacy', code: 'PHARM', description: 'Pharmacy services', active: true, specialtyGroup: 'SUPPORT' }
];

// Seed data for Specializations (mapped to departments)
export const SEED_SPECIALIZATIONS: MasterSpecialization[] = [
  { id: '1', name: 'Family Medicine', code: 'FAMILY_MED', departmentId: '1', description: 'Family medicine specialization', active: true },
  { id: '2', name: 'Internal Medicine', code: 'INTERNAL_MED', departmentId: '1', description: 'Internal medicine specialization', active: true },
  { id: '3', name: 'Cardiologist', code: 'CARDIOLOGIST', departmentId: '2', description: 'Cardiology specialization', active: true },
  { id: '4', name: 'Pediatrician', code: 'PEDIATRICIAN', departmentId: '3', description: 'Pediatrics specialization', active: true },
  { id: '5', name: 'Orthopedic Surgeon', code: 'ORTHO_SURGEON', departmentId: '4', description: 'Orthopedic surgery specialization', active: true },
  { id: '6', name: 'Dermatologist', code: 'DERMATOLOGIST', departmentId: '5', description: 'Dermatology specialization', active: true },
  { id: '7', name: 'Radiologist', code: 'RADIOLOGIST', departmentId: '6', description: 'Radiology specialization', active: true },
  { id: '8', name: 'Pathology/Lab', code: 'PATHOLOGY', departmentId: '7', description: 'Pathology and laboratory specialization', active: true }
];

// Seed data for Designations
export const SEED_DESIGNATIONS: MasterDesignation[] = [
  { id: '1', name: 'Physician', code: 'PHYSICIAN', description: 'Medical doctor', active: true },
  { id: '2', name: 'Nurse', code: 'NURSE', description: 'Registered nurse', active: true },
  { id: '3', name: 'Front Desk', code: 'FRONT_DESK', description: 'Front desk staff', active: true },
  { id: '4', name: 'Admin', code: 'ADMIN', description: 'Administrative staff', active: true },
  { id: '5', name: 'Lab Technician', code: 'LAB_TECH', description: 'Laboratory technician', active: true },
  { id: '6', name: 'Pharmacist', code: 'PHARMACIST', description: 'Pharmacy staff', active: true },
  { id: '7', name: 'Radiology Tech', code: 'RAD_TECH', description: 'Radiology technician', active: true }
];

