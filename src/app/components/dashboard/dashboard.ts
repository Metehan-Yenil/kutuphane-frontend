import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ReservationService } from '../../services/reservation';
import { RoomService } from '../../services/room';
import { EquipmentService } from '../../services/equipment';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private roomService = inject(RoomService);
  private equipmentService = inject(EquipmentService);

  currentUser = this.authService.getCurrentUser();
  myReservations: Reservation[] = [];
  roomCount = 0;
  equipmentCount = 0;
  activeReservationCount = 0;
  isLoading = true;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.currentUser?.userId) return;

    // Kullanıcının rezervasyonlarını yükle
    this.reservationService.getUserActiveReservations(this.currentUser.userId).subscribe({
      next: (reservations) => {
        this.myReservations = reservations;
        this.activeReservationCount = reservations.length;
      },
      error: (error) => console.error('Rezervasyonlar yüklenemedi:', error)
    });

    // Toplam oda sayısı
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.roomCount = rooms.length;
      },
      error: (error) => console.error('Odalar yüklenemedi:', error)
    });

    // Toplam ekipman sayısı
    this.equipmentService.getAllEquipment().subscribe({
      next: (equipment) => {
        this.equipmentCount = equipment.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ekipmanlar yüklenemedi:', error);
        this.isLoading = false;
      }
    });
  }

  getStatusBadge(status: string): string {
    switch(status) {
      case 'ONAYLANDI': return 'badge-success';
      case 'BEKLENIYOR': return 'badge-warning';
      case 'IPTAL_EDILDI': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'ONAYLANDI': return 'Onaylandı';
      case 'BEKLENIYOR': return 'Bekliyor';
      case 'IPTAL_EDILDI': return 'İptal Edildi';
      default: return status;
    }
  }

  cancelReservation(reservationId: number | undefined): void {
    if (!reservationId) return;
    
    if (confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      this.reservationService.cancelReservation(reservationId).subscribe({
        next: () => {
          alert('Rezervasyon iptal edildi!');
          this.loadDashboardData();
        },
        error: (error) => {
          alert('Rezervasyon iptal edilemedi: ' + (error.error?.message || 'Bilinmeyen hata'));
        }
      });
    }
  }
}