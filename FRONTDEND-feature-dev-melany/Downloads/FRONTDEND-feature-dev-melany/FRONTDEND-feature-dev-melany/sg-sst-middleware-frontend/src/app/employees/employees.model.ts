export interface Employee {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'employee' | 'supervisor';
    position?: string;
    joinedAt?: Date;
  }
  