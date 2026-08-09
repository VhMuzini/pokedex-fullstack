import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '../translate.pipe';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="scan" role="status">
      <span class="ring"></span>
      <span class="ring ring--delay"></span>
      <span class="label mono-tag">{{ label() | translate }}</span>
    </div>
  `,
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  label = input<string>('common.loading');
}
