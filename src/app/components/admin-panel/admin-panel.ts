import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DashboardStats, CreateAdminRequest } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css'
})
export class AdminPanelComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  users = signal<any[]>([]);
  rooms = signal<any[]>([]);
  equipment = signal<any[]>([]);
  pendingReservations = signal<any[]>([]);
  allReservations = signal<any[]>([]);
  
  activeTab = signal<'dashboard' | 'users' | 'rooms' | 'equipment' | 'reservations' | 'all-reservations'>('dashboard');
  
  showCreateAdminModal = signal(false);
  newAdmin: CreateAdminRequest = { name: '', email: '', password: '' };
  
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.loading.set(true);
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('İstatistikler yüklenemedi');
        this.loading.set(false);
      }
    });
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => this.error.set('Kullanıcılar yüklenemedi')
    });
  }

  loadRooms() {
    this.adminService.getAllRooms().subscribe({
      next: (data) => this.rooms.set(data),
      error: (err) => this.error.set('Odalar yüklenemedi')
    });
  }

  loadEquipment() {
    this.adminService.getAllEquipment().subscribe({
      next: (data) => this.equipment.set(data),
      error: (err) => this.error.set('Ekipmanlar yüklenemedi')
    });
  }

  loadPendingReservations() {
    this.adminService.getPendingReservations().subscribe({
      next: (data) => this.pendingReservations.set(data),
      error: (err) => this.error.set('Rezervasyonlar yüklenemedi')
    });
  }

  loadAllReservations() {
    console.log('Tüm rezervasyonlar yükleniyor...');
    this.adminService.getAllReservations().subscribe({
      next: (data) => {
        console.log('Gelen rezervasyonlar:', data);
        this.allReservations.set(data);
      },
      error: (err) => {
        console.error('Rezervasyon yükleme hatası:', err);
        this.error.set('Rezervasyonlar yüklenemedi');
      }
    });
  }

  switchTab(tab: 'dashboard' | 'users' | 'rooms' | 'equipment' | 'reservations' | 'all-reservations') {
    this.activeTab.set(tab);
    this.error.set(null);
    
    switch(tab) {
      case 'users':
        this.loadUsers();
        break;
      case 'rooms':
        this.loadRooms();
        break;
      case 'equipment':
        this.loadEquipment();
        break;
      case 'reservations':
        this.loadPendingReservations();
        break;
      case 'all-reservations':
        this.loadAllReservations();
        break;
    }
  }

  createAdmin() {
    if (!this.newAdmin.name || !this.newAdmin.email || !this.newAdmin.password) {
      this.error.set('Tüm alanları doldurun');
      return;
    }

    this.adminService.createAdmin(this.newAdmin).subscribe({
      next: () => {
        this.showCreateAdminModal.set(false);
        this.newAdmin = { name: '', email: '', password: '' };
        this.loadUsers();
        alert('Admin başarıyla oluşturuldu');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Admin oluşturulamadı');
      }
    });
  }

  promoteToAdmin(userId: number) {
    if (confirm('Bu kullanıcıyı admin yapmak istediğinize emin misiniz?')) {
      this.adminService.promoteToAdmin(userId).subscribe({
        next: () => {
          this.loadUsers();
          alert('Kullanıcı admin yapıldı');
        },
        error: (err) => this.error.set('İşlem başarısız')
      });
    }
  }

  deleteUser(userId: number) {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          alert('Kullanıcı silindi');
        },
        error: (err) => this.error.set('Kullanıcı silinemedi')
      });
    }
  }

  confirmReservation(reservationId: number) {
    this.adminService.confirmReservation(reservationId).subscribe({
      next: () => {
        this.loadPendingReservations();
        alert('Rezervasyon onaylandı');
      },
      error: (err) => this.error.set('Rezervasyon onaylanamadı')
    });
  }

  updateRoomStatus(roomId: number, status: string) {
    this.adminService.updateRoomStatus(roomId, status).subscribe({
      next: () => {
        this.loadRooms();
        alert('Oda durumu güncellendi');
      },
      error: (err) => this.error.set('Durum güncellenemedi')
    });
  }

  updateEquipmentStatus(equipmentId: number, status: string) {
    this.adminService.updateEquipmentStatus(equipmentId, status).subscribe({
      next: () => {
        this.loadEquipment();
        alert('Ekipman durumu güncellendi');
      },
      error: (err) => this.error.set('Durum güncellenemedi')
    });
  }

  cancelReservation(reservationId: number) {
    if (confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      this.adminService.cancelReservation(reservationId).subscribe({
        next: () => {
          this.loadAllReservations();
          alert('Rezervasyon iptal edildi');
        },
        error: (err) => this.error.set('Rezervasyon iptal edilemedi')
      });
    }
  }

  getRoomStatusText(status: string): string {
    switch(status) {
      case 'EMPTY': return 'Boş';
      case 'OCCUPIED': return 'Dolu';
      case 'MAINTENANCE': return 'Bakımda';
      default: return status;
    }
  }

  getEquipmentStatusText(status: string): string {
    switch(status) {
      case 'AVAILABLE': return 'Müsait';
      case 'RESERVED': return 'Rezerveli';
      case 'MAINTENANCE': return 'Bakımda';
      default: return status;
    }
  }
}