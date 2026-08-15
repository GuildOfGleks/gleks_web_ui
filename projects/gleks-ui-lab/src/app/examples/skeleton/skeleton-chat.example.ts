import { Component } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

interface ChatMessage {
  fromMe: boolean;
  width: string;
}

@Component({
  selector: 'app-example',
  imports: [SkeletonComponent],
  template: `
    <div class="chat-thread">
      @for (message of messages; track $index) {
        <div class="chat-row" [class.chat-row--mine]="message.fromMe">
          @if (!message.fromMe) {
            <gog-skeleton shape="circle" size="xsm" />
          }
          <gog-skeleton shape="rect" size="sm" [width]="message.width" />
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      max-width: 420px;
    }
    .chat-thread {
      display: grid;
      gap: 10px;
      max-width: 380px;
    }
    .chat-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }
    .chat-row--mine {
      justify-content: flex-end;
    }
  `,
})
export class SkeletonChatExample {
  protected readonly messages: ChatMessage[] = [
    { fromMe: false, width: '55%' },
    { fromMe: true, width: '38%' },
    { fromMe: false, width: '68%' },
  ];
}
