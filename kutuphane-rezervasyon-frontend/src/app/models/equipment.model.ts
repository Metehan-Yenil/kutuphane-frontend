export interface Equipment {
  equipmentId?: number;
  name: string;
  type: string;
  status: 'AVAILABLE' | 'RESERVED' | 'MAINTENANCE';
}
