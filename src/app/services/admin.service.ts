import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalRooms: number;
  emptyRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalEquipment: number;
  availableEquipment: number;
  reservedEquipment: number;
  maintenanceEquipment: number;
  totalReservations: number;
  pendingReservations: number;
  totalTimeSlots: number;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/admin';

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  createAdmin(request: CreateAdminRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/create-admin`, request);
  }

  promoteToAdmin(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/promote`, {});
  }

  updateUser(userId: number, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, user);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  getAllRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rooms`);
  }

  getAllEquipment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/equipment`);
  }

  getPendingReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/pending`);
  }

  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations`);
  }

  confirmReservation(reservationId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reservations/${reservationId}/confirm`, {});
  }

  cancelReservation(reservationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservations/${reservationId}`);
  }

  updateRoomStatus(roomId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/rooms/${roomId}/status?status=${status}`, {});
  }

  updateEquipmentStatus(equipmentId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/equipment/${equipmentId}/status?status=${status}`, {});
  }

  cancelReservationAdmin(reservationId: number): Observable<any> {
  return this.http.patch(`http://localhost:8080/api/reservations/${reservationId}/cancel`, {});
}
}