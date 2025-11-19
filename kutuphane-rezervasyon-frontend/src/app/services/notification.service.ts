import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notification = signal<Notification | null>(null);

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000) {
    this.notification.set({ message, type, duration });
    
    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3000) {
    this.show(message, 'warning', duration);
  }

  confirm(message: string, onConfirm: () => void, onCancel?: () => void) {
    console.log('Confirm called with message:', message);
    this.notification.set({
      message,
      type: 'confirm',
      onConfirm,
      onCancel
    });
    console.log('Notification set:', this.notification());
  }

  hide() {
    this.notification.set(null);
  }

  handleConfirm() {
    const current = this.notification();
    if (current?.onConfirm) {
      current.onConfirm();
    }
    this.hide();
  }

  handleCancel() {
    const current = this.notification();
    if (current?.onCancel) {
      current.onCancel();
    }
    this.hide();
  }
}
