import { Component } from '@angular/core';
import { SpinnerComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [SpinnerComponent],
  template: `
    <gog-spinner variant="custom" size="lg" ariaLabel="Loading, custom variant">
      <div class="dots-loader"><span></span><span></span><span></span></div>
    </gog-spinner>
  `,
  styles: `
    .dots-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 100%;
    }
    .dots-loader span {
      width: 22%;
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--gog-spinner-color, var(--gog-accent-color));
      animation: dots-bounce 0.9s ease-in-out infinite;
    }
    .dots-loader span:nth-child(2) {
      animation-delay: 0.15s;
    }
    .dots-loader span:nth-child(3) {
      animation-delay: 0.3s;
    }
    @keyframes dots-bounce {
      0%,
      80%,
      100% {
        transform: scale(0.6);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
  `,
})
export class SpinnerCustomVariantExample {}
