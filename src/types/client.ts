export interface Client {
  id: string;
  name: string;
  identification: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
  registrationDate: string;
  updatedAt?: string;
  notes?: string;
}

export type ClientStatus = 'active' | 'inactive' | 'all';
