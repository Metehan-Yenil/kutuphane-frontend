export interface Room {
  roomId?: number;
  name: string;
  capacity: number;
  status: 'EMPTY' | 'OCCUPIED' | 'MAINTENANCE';
}
