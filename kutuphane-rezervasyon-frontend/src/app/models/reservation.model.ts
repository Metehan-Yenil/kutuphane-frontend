import { User } from './user.model';
import { Room } from './room.model';
import { Equipment } from './equipment.model';
import { TimeSlot } from './timeslot.model';

export interface Reservation {
  reservationId?: number;
  user?: User;
  room?: Room;
  equipment?: Equipment;
  timeSlot?: TimeSlot;
  reservationDate: string;
  status: 'ONAYLANDI' | 'IPTAL_EDILDI' | 'BEKLENIYOR';
}

export interface ReservationRequest {
  userId: number;
  roomId?: number;
  equipmentId?: number;
  timeSlotId: number;
  reservationDate: string;
}
