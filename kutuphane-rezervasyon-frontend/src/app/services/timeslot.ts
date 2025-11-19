import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeSlot } from '../models/timeslot.model';

@Injectable({
  providedIn: 'root'
})
export class TimeslotService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/timeslots';

  getAllTimeSlots(): Observable<TimeSlot[]> {
    return this.http.get<TimeSlot[]>(this.apiUrl);
  }

  getTimeSlotById(id: number): Observable<TimeSlot> {
    return this.http.get<TimeSlot>(`${this.apiUrl}/${id}`);
  }

  createTimeSlot(timeSlot: TimeSlot): Observable<TimeSlot> {
    return this.http.post<TimeSlot>(this.apiUrl, timeSlot);
  }

  updateTimeSlot(id: number, timeSlot: TimeSlot): Observable<TimeSlot> {
    return this.http.put<TimeSlot>(`${this.apiUrl}/${id}`, timeSlot);
  }

  deleteTimeSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}