import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DashboardStats, CreateAdminRequest, CreateRoomRequest, CreateEquipmentRequest } from '../../services/admin.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

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
  
  showCreateRoomModal = signal(false);
  newRoom: CreateRoomRequest = { name: '', capacity: 1, status: 'EMPTY' };
  editingRoom: any = null;
  
  showCreateEquipmentModal = signal(false);
  newEquipment: CreateEquipmentRequest = { name: '', type: '', status: 'AVAILABLE' };
  editingEquipment: any = null;
  
  // Ekipman türleri listesi
  equipmentTypes = [
    'Laptop',
    'Tablet',
    'Projeksiyon',
    'Yazıcı',
    'Mikrofon',
    'Kamera',
    'Hoparlör',
    'Tahta',
    'Mouse',
    'Klavye',
    'Monitör',
    'Kulaklık'
  ];
  
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private adminService: AdminService,
    private router: Router,
    public notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
    this.loadPendingReservations();
  }

  get hasPendingReservations(): boolean {
    return this.pendingReservations().length > 0;
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
        this.notificationService.success('Admin başarıyla oluşturuldu');
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Admin oluşturulamadı');
      }
    });
  }

  promoteToAdmin(userId: number) {
    this.notificationService.confirm(
      'Bu kullanıcıyı admin yapmak istediğinize emin misiniz?',
      () => {
        this.adminService.promoteToAdmin(userId).subscribe({
          next: () => {
            this.loadUsers();
            this.notificationService.success('Kullanıcı admin yapıldı');
          },
          error: (err) => this.notificationService.error('İşlem başarısız')
        });
      }
    );
  }

  deleteUser(userId: number) {
    this.notificationService.confirm(
      'Bu kullanıcıyı silmek istediğinize emin misiniz?',
      () => {
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.loadUsers();
            this.notificationService.success('Kullanıcı silindi');
          },
          error: (err) => this.notificationService.error('Kullanıcı silinemedi')
        });
      }
    );
  }

  confirmReservation(reservationId: number) {
    this.adminService.confirmReservation(reservationId).subscribe({
      next: () => {
        this.loadPendingReservations();
        this.notificationService.success('Rezervasyon onaylandı');
      },
      error: (err) => this.notificationService.error('Rezervasyon onaylanamadı')
    });
  }

  updateRoomStatus(roomId: number, status: string) {
    this.adminService.updateRoomStatus(roomId, status).subscribe({
      next: () => {
        this.loadRooms();
        this.notificationService.success('Oda durumu güncellendi');
      },
      error: (err) => this.notificationService.error('Durum güncellenemedi')
    });
  }

  updateEquipmentStatus(equipmentId: number, status: string) {
    this.adminService.updateEquipmentStatus(equipmentId, status).subscribe({
      next: () => {
        this.loadEquipment();
        this.notificationService.success('Ekipman durumu güncellendi');
      },
      error: (err) => this.notificationService.error('Durum güncellenemedi')
    });
  }

  cancelReservation(reservationId: number) {
    console.log('cancelReservation called with ID:', reservationId);
    this.notificationService.confirm(
      'Bu rezervasyonu iptal etmek istediğinize emin misiniz?',
      () => {
        console.log('Confirm callback executed');
        this.adminService.cancelReservation(reservationId).subscribe({
          next: () => {
            // Hangi tab aktifse onu yenile
            if (this.activeTab() === 'reservations') {
              this.loadPendingReservations();
            } else {
              this.loadAllReservations();
            }
            this.notificationService.success('Rezervasyon iptal edildi');
          },
          error: (err) => this.notificationService.error('Rezervasyon iptal edilemedi')
        });
      }
    );
  }

  // Oda İşlemleri
  openCreateRoomModal() {
    this.showCreateRoomModal.set(true);
    this.editingRoom = null;
    this.newRoom = { name: '', capacity: 1, status: 'EMPTY' };
  }

  openEditRoomModal(room: any) {
    this.showCreateRoomModal.set(true);
    this.editingRoom = room;
    this.newRoom = { name: room.name, capacity: room.capacity, status: room.status };
  }

  saveRoom() {
    if (this.editingRoom) {
      // Güncelleme
      this.adminService.updateRoom(this.editingRoom.roomId, this.newRoom).subscribe({
        next: () => {
          this.loadRooms();
          this.showCreateRoomModal.set(false);
          this.notificationService.success('Oda güncellendi');
        },
        error: (err) => this.notificationService.error('Oda güncellenemedi')
      });
    } else {
      // Yeni ekleme
      this.adminService.createRoom(this.newRoom).subscribe({
        next: () => {
          this.loadRooms();
          this.showCreateRoomModal.set(false);
          this.notificationService.success('Oda eklendi');
        },
        error: (err) => this.notificationService.error('Oda eklenemedi')
      });
    }
  }

  deleteRoom(roomId: number) {
    this.notificationService.confirm(
      'Bu odayı silmek istediğinize emin misiniz?',
      () => {
        this.adminService.deleteRoom(roomId).subscribe({
          next: () => {
            this.loadRooms();
            this.notificationService.success('Oda silindi');
          },
          error: (err) => this.notificationService.error('Oda silinemedi')
        });
      }
    );
  }

  // Ekipman İşlemleri
  openCreateEquipmentModal() {
    this.showCreateEquipmentModal.set(true);
    this.editingEquipment = null;
    this.newEquipment = { name: '', type: '', status: 'AVAILABLE' };
  }

  openEditEquipmentModal(equipment: any) {
    this.showCreateEquipmentModal.set(true);
    this.editingEquipment = equipment;
    this.newEquipment = { name: equipment.name, type: equipment.type, status: equipment.status };
  }

  saveEquipment() {
    if (this.editingEquipment) {
      // Güncelleme
      this.adminService.updateEquipment(this.editingEquipment.equipmentId, this.newEquipment).subscribe({
        next: () => {
          this.loadEquipment();
          this.showCreateEquipmentModal.set(false);
          this.notificationService.success('Ekipman güncellendi');
        },
        error: (err) => this.notificationService.error('Ekipman güncellenemedi')
      });
    } else {
      // Yeni ekleme
      this.adminService.createEquipment(this.newEquipment).subscribe({
        next: () => {
          this.loadEquipment();
          this.showCreateEquipmentModal.set(false);
          this.notificationService.success('Ekipman eklendi');
        },
        error: (err) => this.notificationService.error('Ekipman eklenemedi')
      });
    }
  }

  deleteEquipment(equipmentId: number) {
    this.notificationService.confirm(
      'Bu ekipmanı silmek istediğinize emin misiniz?',
      () => {
        this.adminService.deleteEquipment(equipmentId).subscribe({
          next: () => {
            this.loadEquipment();
            this.notificationService.success('Ekipman silindi');
          },
          error: (err) => this.notificationService.error('Ekipman silinemedi')
        });
      }
    );
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