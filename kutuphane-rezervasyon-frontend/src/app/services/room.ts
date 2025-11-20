import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = 'https://backend-production-e7d0.up.railway.app/api/rooms';

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  getAvailableRooms(date: string, timeSlotId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/available`, {
      params: { date, timeSlotId: timeSlotId.toString() }
    });
  }

  createRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, room);
  }

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}