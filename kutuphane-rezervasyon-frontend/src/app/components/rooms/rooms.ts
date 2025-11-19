import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../services/room';
import { EquipmentService } from '../../services/equipment';
import { TimeslotService } from '../../services/timeslot';
import { ReservationService } from '../../services/reservation';
import { AuthService } from '../../services/auth';
import { Room } from '../../models/room.model';
import { Equipment } from '../../models/equipment.model';
import { TimeSlot } from '../../models/timeslot.model';
import { ReservationRequest } from '../../models/reservation.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css'
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  private equipmentService = inject(EquipmentService);
  private timeslotService = inject(TimeslotService);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  public notificationService = inject(NotificationService);

  rooms: Room[] = [];
  equipment: Equipment[] = [];
  allRooms: Room[] = []; // Tüm odaların orijinal halleri
  allEquipment: Equipment[] = []; // Tüm ekipmanların orijinal halleri
  timeSlots: TimeSlot[] = [];
  
  selectedType: 'room' | 'equipment' = 'room';
  selectedDate: string = '';
  selectedTimeSlotId: number | null = null;
  selectedResourceId: number | null | undefined = null;
  
  availableRooms: Room[] = [];
  availableEquipment: Equipment[] = [];
  
  isLoading = false;
  showReservationForm = false;

  ngOnInit(): void {
    this.setDefaultDate();
    this.loadTimeSlots();
    this.loadAllResources();
  }

  setDefaultDate(): void {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.selectedDate = tomorrow.toISOString().split('T')[0];
  }

  loadTimeSlots(): void {
    this.timeslotService.getAllTimeSlots().subscribe({
      next: (slots) => {
        this.timeSlots = slots;
      },
      error: (error) => console.error('Zaman dilimleri yüklenemedi:', error)
    });
  }

  loadAllResources(): void {
    this.roomService.getAllRooms().subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        this.rooms = [...rooms]; // Kopyasını oluştur
      },
      error: (error) => console.error('Odalar yüklenemedi:', error)
    });

    this.equipmentService.getAllEquipment().subscribe({
      next: (equipment) => {
        this.allEquipment = equipment;
        this.equipment = [...equipment]; // Kopyasını oluştur
      },
      error: (error) => console.error('Ekipmanlar yüklenemedi:', error)
    });
  }

  searchAvailability(): void {
    if (!this.selectedDate || !this.selectedTimeSlotId) {
      this.notificationService.error('Lütfen tarih ve zaman dilimi seçiniz!');
      return;
    }

    this.isLoading = true;

    if (this.selectedType === 'room') {
      this.roomService.getAvailableRooms(this.selectedDate, this.selectedTimeSlotId).subscribe({
        next: (availableRooms) => {
          // Müsait odaları filtrele (sadece EMPTY olanlar)
          this.availableRooms = availableRooms.filter(room => room.status === 'EMPTY');
          
          // Tüm odaları güncelle: müsait olmayanları OCCUPIED yap
          const availableRoomIds = new Set(availableRooms.map(r => r.roomId));
          this.rooms = this.allRooms.map(room => ({
            ...room,
            status: availableRoomIds.has(room.roomId) 
              ? availableRooms.find(r => r.roomId === room.roomId)!.status 
              : 'OCCUPIED' as 'OCCUPIED'
          }));
          
          this.isLoading = false;
          this.showReservationForm = true;
        },
        error: (error) => {
          console.error('Müsait odalar bulunamadı:', error);
          this.notificationService.error('Müsait odalar yüklenemedi!');
          this.isLoading = false;
        }
      });
    } else {
      this.equipmentService.getAvailableEquipment(this.selectedDate, this.selectedTimeSlotId).subscribe({
        next: (availableEquipment) => {
          // Müsait ekipmanları filtrele (sadece AVAILABLE olanlar)
          this.availableEquipment = availableEquipment.filter(equip => equip.status === 'AVAILABLE');
          
          // Tüm ekipmanları güncelle: müsait olmayanları RESERVED yap
          const availableEquipmentIds = new Set(availableEquipment.map(e => e.equipmentId));
          this.equipment = this.allEquipment.map(equip => ({
            ...equip,
            status: availableEquipmentIds.has(equip.equipmentId)
              ? availableEquipment.find(e => e.equipmentId === equip.equipmentId)!.status
              : 'RESERVED' as 'RESERVED'
          }));
          
          this.isLoading = false;
          this.showReservationForm = true;
        },
        error: (error) => {
          console.error('Müsait ekipmanlar bulunamadı:', error);
          this.notificationService.error('Müsait ekipmanlar yüklenemedi!');
          this.isLoading = false;
        }
      });
    }
  }

  makeReservation(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.userId) {
      this.notificationService.error('Kullanıcı bilgisi bulunamadı!');
      return;
    }

    if (!this.selectedResourceId || !this.selectedTimeSlotId) {
      this.notificationService.error('Lütfen bir kaynak seçiniz!');
      return;
    }

    const request: ReservationRequest = {
      userId: currentUser.userId,
      timeSlotId: this.selectedTimeSlotId,
      reservationDate: this.selectedDate,
      ...(this.selectedType === 'room' 
        ? { roomId: this.selectedResourceId }
        : { equipmentId: this.selectedResourceId }
      )
    };

    this.isLoading = true;
    this.reservationService.createReservation(request).subscribe({
      next: (reservation) => {
        this.notificationService.success('Rezervasyon başarıyla oluşturuldu! Lütfen yöneticinin onaylamasını bekleyiniz.');
        this.selectedResourceId = null;
        this.showReservationForm = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error(error.error?.message || 'Rezervasyon oluşturulamadı!');
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'EMPTY': return 'status-available';
      case 'AVAILABLE': return 'status-available';
      case 'OCCUPIED': return 'status-occupied';
      case 'RESERVED': return 'status-reserved';
      case 'MAINTENANCE': return 'status-maintenance';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'EMPTY': return 'Boş';
      case 'AVAILABLE': return 'Müsait';
      case 'OCCUPIED': return 'Dolu';
      case 'RESERVED': return 'Rezerve';
      case 'MAINTENANCE': return 'Bakımda';
      default: return status;
    }
  }

  getEquipmentIcon(type: string): string {
    const typeLC = type?.toLowerCase().trim() || '';
    
    if (typeLC.includes('laptop')) return '💻';
    if (typeLC.includes('tablet') || typeLC.includes('ipad')) return '📱';
    if (typeLC.includes('projeksiyon')) return '📽️';
    if (typeLC.includes('yazıcı') || typeLC.includes('yazici') || typeLC.includes('printer')) return '🖨️';
    if (typeLC.includes('mikrofon') || typeLC.includes('microphone') || typeLC.includes('mic')) return '🎤';
    if (typeLC.includes('kamera') || typeLC.includes('camera') || typeLC.includes('webcam')) return '📷';
    if (typeLC.includes('hoparlör') || typeLC.includes('hoparlar') || typeLC.includes('speaker') || typeLC.includes('ses')) return '🔊';
    if (typeLC.includes('tahta') || typeLC.includes('board') || typeLC.includes('beyaz tahta')) return '📋';
    if (typeLC.includes('mouse') || typeLC.includes('fare')) return '🖱️';
    if (typeLC.includes('klavye') || typeLC.includes('keyboard')) return '⌨️';
    if (typeLC.includes('monitör') || typeLC.includes('monitor') || typeLC.includes('ekran')) return '🖥️';
    if (typeLC.includes('kulaklık') || typeLC.includes('headphone') || typeLC.includes('kulaklik')) return '🎧';
    
    return '🔧'; // Varsayılan ikon
  }
}