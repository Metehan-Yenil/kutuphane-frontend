import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = 'https://backend-production-e7d0.up.railway.app/api/reservations';

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  getUserReservations(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUserActiveReservations(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}/active`);
  }

  createReservation(request: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, request);
  }

  cancelReservation(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}