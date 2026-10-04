import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbsComponent, GogBreadcrumbDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [BreadcrumbsComponent, GogBreadcrumbDirective, RouterLink],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsSeparatorExample {}
