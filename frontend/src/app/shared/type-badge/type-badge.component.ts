import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { colorForType } from '../../core/constants/type-colors';

@Component({
  selector: 'app-type-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [style.--badge-color]="color()">
      {{ type() }}
    </span>
  `,
  styleUrl: './type-badge.component.scss',
})
export class TypeBadgeComponent {
  type = input.required<string>();
  color = computed(() => colorForType(this.type()));
}
