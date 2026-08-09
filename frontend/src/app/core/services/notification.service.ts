import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _message = signal<string | null>(null);
  readonly message = this._message.asReadonly();
  private timeoutId?: ReturnType<typeof setTimeout>;

  show(message: string, durationMs = 4000) {
    this._message.set(message);
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this._message.set(null), durationMs);
  }

  dismiss() {
    this._message.set(null);
    clearTimeout(this.timeoutId);
  }
}
