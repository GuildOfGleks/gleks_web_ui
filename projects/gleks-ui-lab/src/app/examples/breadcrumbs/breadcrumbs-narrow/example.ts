import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbsComponent, GogBreadcrumbDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [BreadcrumbsComponent, GogBreadcrumbDirective, RouterLink],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsNarrowExample {
  protected readonly trail = ['Workspace', 'Sales', 'Europe', 'Germany', 'Berlin', 'Q3 orders'];
}
