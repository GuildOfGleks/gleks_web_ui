import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-component-preview-page',
  templateUrl: './component-preview-page.html',
  styleUrl: './component-preview-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentPreviewPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly componentName = toSignal(
    this.route.params.pipe(map((params) => params['name'])),
    { initialValue: '' },
  );
}
