import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';
import { GogColumn, TableComponent } from '@guildofgleks/ui/table';

/** Every seventh row wraps, so the rows genuinely differ in height. */
const ROWS = Array.from({ length: 10_000 }, (_, i) => ({
  component:
    i % 7 === 0
      ? `Component ${i + 1} — with a long note attached, the kind that wraps across several lines`
      : `Component ${i + 1}`,
  status: ['Ready', 'In review', 'Planned'][i % 3],
  owner: ['Design', 'Forms', 'Data', 'Navigation', 'Feedback'][i % 5],
}));

@Component({
  selector: 'app-example',
  imports: [CheckboxComponent, GogColumn, TableComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableVirtualizeExample {
  protected readonly rows = ROWS;
  protected readonly virtualize = signal(true);
}
