export interface User {
  id: number;
  phoneNumber: string;
  fullName: string;
}

export interface Field {
  id: number;
  name: string;
  area: number;
  location: string;
  soilType: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Greenhouse {
  id: number;
  name: string;
  area: number;
  notes?: string;
}

export interface Product {
  id: number;
  name: string;
  type: string;
  description?: string;
}

export interface Planting {
  id: number;
  productId: number;
  product?: Product | null;
  fieldId?: number;
  field?: Field;
  greenhouseId?: number;
  greenhouse?: Greenhouse;
  quantity: number;
  plantedArea: number;
  plantingDate: string;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Harvest {
  id: number;
  fieldId: number;
  plantingId: number;
  harvestDate: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Irrigation {
  id: number;
  fieldId?: number;
  field?: Field;
  greenhouseId?: number;
  greenhouse?: Greenhouse;
  productId: number;
  product: Product;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Inventory {
  id: number;
  name: string;
  description?: string;
  invoiceNumber?: string;
  purchaseDate: string;
  supplierCompany?: SupplierCompany;
}

export interface SupplierCompany {
  id: number;
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface Fertilization {
  id: number;
  date: string;
  plantingId: number;
  planting?: Planting;
  productId: number;
  product?: Product;
  fieldId?: number;
  field?: Field;
  greenhouseId?: number;
  greenhouse?: Greenhouse;
  notes?: string;
}

export interface Pesticide {
  id: number;
  chemical: string;
  applicationDate: string;
  plantingId: number;
  planting?: Planting;
  notes?: string;
}

export interface SoilTest {
  id: number;
  sampleCode: string;
  sampleDate: string;
  fieldId?: number;
  greenhouseId?: number;
  notes?: string;
}

export interface SoilTestResult {
  id: number;
  soilTestId: number;
  parameter: string;
  value: number;
  unit: string;
  sampleCode?: string;
}
