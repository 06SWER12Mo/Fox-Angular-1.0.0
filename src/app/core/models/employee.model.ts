export interface Employee {
  id: number;
  name: string;
  passportNumber: string;
  phoneNumber: string;
  email: string;
  salary: number;
  role: string;
  active: boolean;
  daysOfWork: number;
  hoursOfWork: number;
  employeeSince: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequest {
  name: string;
  passportNumber: string;
  phoneNumber: string;
  email: string;
  salary: number;
  role: string;
  isActive?: boolean;
  daysOfWork?: number;
  hoursOfWork?: number;
  employeeSince?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  adminCount: number;
  managerCount: number;
  employeeCount: number;
}