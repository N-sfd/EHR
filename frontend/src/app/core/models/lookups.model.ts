// HR lookups

export interface Role {
    id: number;
    name: string;
    description?: string;
  }
  
  export interface Designation {
    id: number;
    name: string;
  }
  
  export interface Department {
    id: number;
    name: string;
    parentId?: number;
    type?: 'ADMIN' | 'CLINICAL';
  }
  
  // TEMP: will move out of HR when Provider/Doctor MS exists
  export interface Specialization {
    id: number;
    name: string;
    description?: string;
  }
  