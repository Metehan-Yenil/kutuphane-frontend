import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, RouterLink],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class ReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);

  allReservations: Reservation[] = [];
  activeReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];
  
  selectedTab: 'all' | 'active' | 'past' = 'active';
  isLoading = true;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.userId) {
      this.errorMessage = 'Kullanıcı bilgisi bulunamadı!';
      this.isLoading = false;
      return;
    }

    this.reservationService.getUserReservations(currentUser.userId).subscribe({
      next: (reservations) => {
        this.allReservations = reservations;
        this.categorizeReservations();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Rezervasyonlar yüklenemedi:', error);
        this.errorMessage = 'Rezervasyonlar yüklenirken bir hata oluştu!';
        this.isLoading = false;
      }
    });
  }

  categorizeReservations(): void {
    const now = new Date();
    
    this.activeReservations = this.allReservations.filter(r => {
      if (r.status === 'IPTAL_EDILDI') return false;
      
      const resDate = new Date(r.reservationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Tarih bugünden önceyse geçmiş
      if (resDate < today) return false;
      
      // Tarih bugünse ve zaman dilimi varsa
      if (resDate.getTime() === today.getTime() && r.timeSlot?.endTime) {
        const [hours, minutes] = r.timeSlot.endTime.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours, minutes, 0, 0);
        
        // Bitiş saati geçmişse geçmiş
        if (now > endTime) return false;
      }
      
      return true;
    });

    this.pastReservations = this.allReservations.filter(r => {
      // İptal edilmişlerse geçmiş
      if (r.status === 'IPTAL_EDILDI') return true;
      
      const resDate = new Date(r.reservationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Tarih bugünden önceyse geçmiş
      if (resDate < today) return true;
      
      // Tarih bugünse ve zaman dilimi varsa
      if (resDate.getTime() === today.getTime() && r.timeSlot?.endTime) {
        const [hours, minutes] = r.timeSlot.endTime.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours, minutes, 0, 0);
        
        // Bitiş saati geçmişse geçmiş
        if (now > endTime) return true;
      }
      
      return false;
    });
  }

  getCurrentReservations(): Reservation[] {
    switch(this.selectedTab) {
      case 'all': return this.allReservations;
      case 'active': return this.activeReservations;
      case 'past': return this.pastReservations;
      default: return [];
    }
  }

  cancelReservation(reservationId: number | undefined): void {
    if (!reservationId) return;
    
    if (confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      this.reservationService.cancelReservation(reservationId).subscribe({
        next: () => {
          this.successMessage = 'Rezervasyon başarıyla iptal edildi! ✅';
          this.loadReservations();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Rezervasyon iptal edilemedi!';
          setTimeout(() => this.errorMessage = '', 5000);
        }
      });
    }
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
      case 'ONAYLANDI': return 'Onaylandı ✓';
      case 'BEKLENIYOR': return 'Bekliyor ⏳';
      case 'IPTAL_EDILDI': return 'İptal Edildi ✗';
      default: return status;
    }
  }

  canCancel(reservation: Reservation): boolean {
    const resDate = new Date(reservation.reservationDate);
    const today = new Date();
    return resDate >= today && reservation.status !== 'IPTAL_EDILDI';
  }
}