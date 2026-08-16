import { ApplicationConfig } from '@angular/core';
import { provideGogConfig } from '@guildofgleks/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideGogConfig({
      scroll: { size: 'thin', hideDelay: 1200, overscrollBehavior: 'contain' },
    }),
  ],
};
