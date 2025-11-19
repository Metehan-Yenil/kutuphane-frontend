import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notificationService.notification()) {
      <div class="notification-overlay" (click)="handleOverlayClick()">
        <div class="notification-box" [class]="'notification-' + notificationService.notification()!.type" (click)="$event.stopPropagation()">
          <div class="notification-header">
            <div class="notification-content">
              <p>{{ notificationService.notification()!.message }}</p>
            </div>
            @if (notificationService.notification()!.type !== 'confirm') {
              <button class="notification-close" (click)="notificationService.hide()">✕</button>
            }
          </div>
          @if (notificationService.notification()!.type === 'confirm') {
            <div class="notification-actions">
              <button class="btn-cancel" (click)="notificationService.handleCancel()">Hayır</button>
              <button class="btn-confirm" (click)="notificationService.handleConfirm()">Evet</button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .notification-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .notification-box {
      background: white;
      border-radius: 12px;
      padding: 30px;
      min-width: 400px;
      max-width: 600px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 20px;
      position: relative;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .notification-header {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
    }

    .notification-content {
      flex: 1;
    }

    .notification-content p {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
      line-height: 1.5;
    }

    .notification-close {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #999;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .notification-close:hover {
      background: #f0f0f0;
      color: #333;
    }

    .notification-success {
      border-left: 6px solid #28a745;
    }

    .notification-error {
      border-left: 6px solid #dc3545;
    }

    .notification-warning {
      border-left: 6px solid #ffc107;
    }

    .notification-info {
      border-left: 6px solid #17a2b8;
    }

    .notification-confirm {
      border-left: 6px solid #6c757d;
    }

    .notification-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      width: 100%;
    }

    .btn-confirm,
    .btn-cancel {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-confirm {
      background: #28a745;
      color: white;
    }

    .btn-confirm:hover {
      background: #218838;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    @media (max-width: 768px) {
      .notification-box {
        min-width: auto;
        width: 90%;
        padding: 20px;
      }

      .notification-icon {
        font-size: 2rem;
      }

      .notification-content p {
        font-size: 1rem;
      }
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);

  constructor() {
    console.log('NotificationComponent initialized');
  }

  handleOverlayClick() {
    const current = this.notificationService.notification();
    console.log('Overlay clicked, current notification:', current);
    if (current?.type !== 'confirm') {
      this.notificationService.hide();
    }
  }
}
