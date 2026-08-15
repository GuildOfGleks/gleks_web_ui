import { Component } from '@angular/core';
import { GogColumn, ScrollComponent, TableComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TableComponent, GogColumn, ScrollComponent],
  template: `
    <!-- gog-scroll rather than a bare overflow-y: auto — a native scrollbar is the one piece of
         chrome no --gog-* token can reach, which is the whole reason the component exists.

         Note that the header does not actually hold in this version: gog-table wraps its own
         markup in a horizontal gog-scroll, and a sticky element resolves against its nearest
         scrolling ancestor, so that inner viewport wins over this region. See the note above
         the demo. Nothing here works around it — the fix belongs in the component. -->
    <gog-scroll class="box" ariaLabel="Components">
      <gog-table [value]="rows" [stickyHeader]="true">
        <gog-column field="component" header="Component" />
        <gog-column field="status" header="Status" />
        <gog-column field="owner" header="Owner" />
      </gog-table>
    </gog-scroll>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
    .box {
      height: 260px;
    }
  `,
})
export class TableStickyExample {
  protected readonly rows = [
    { component: 'Buttons', status: 'Ready', owner: 'Design' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },
    { component: 'Table', status: 'In review', owner: 'Data' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },
    { component: 'Spinner', status: 'Ready', owner: 'Feedback' },
    { component: 'Toast', status: 'Ready', owner: 'Feedback' },
    { component: 'Tabs', status: 'In review', owner: 'Navigation' },
    { component: 'Tooltip', status: 'Ready', owner: 'Overlays' },
    { component: 'Dialog', status: 'Ready', owner: 'Overlays' },
    { component: 'Select', status: 'In review', owner: 'Forms' },
    { component: 'Slider', status: 'Ready', owner: 'Forms' },
    { component: 'Paginator', status: 'Planned', owner: 'Data' },
  ];
}
