
'use client';

import { create } from 'zustand';

export type Customer = {
  id: string;
  name: string;
  rating: 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Blue';
  status: 'Active' | 'Inactive';
};

const initialCustomers: Customer[] = [
    { id: 'CUST-001', name: 'Global Petro Services', rating: 'Gold', status: 'Active' },
    { id: 'CUST-002', name: 'Modern Industries', rating: 'Platinum', status: 'Active' },
    { id: 'CUST-003', name: 'Tech Solutions Inc.', rating: 'Silver', status: 'Active' },
    { id: 'CUST-004', name: 'Future Ventures', rating: 'Silver', status: 'Inactive' },
    { id: 'CUST-005', name: 'Innovate LLC', rating: 'Bronze', status: 'Active' },
    { id: 'CUST-006', name: 'Saudi Logistics', rating: 'Platinum', status: 'Active' },
    { id: 'CUST-007', name: 'Riyadh Foods Co.', rating: 'Gold', status: 'Active' },
    { id: 'CUST-008', name: 'Dammam Heavy-Lift', rating: 'Blue', status: 'Active' },
];


type CustomerState = {
  customers: Customer[];
};

type CustomerActions = {
  setCustomers: (customers: Customer[]) => void;
};

export const useCustomerStore = create<CustomerState & CustomerActions>((set) => ({
  customers: initialCustomers,
  setCustomers: (customers) => set({ customers }),
}));
