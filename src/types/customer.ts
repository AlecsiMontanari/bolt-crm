export interface Visit {
  id: string;
  date: Date;
  summary: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit?: Date;
  summary: string;
  visits: Visit[];
}