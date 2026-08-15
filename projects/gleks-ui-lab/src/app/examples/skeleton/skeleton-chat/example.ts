import { Component } from '@angular/core';
import { SkeletonComponent } from '@guildofgleks/ui';

interface ChatMessage {
  fromMe: boolean;
  width: string;
}

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [SkeletonComponent],
})
export class SkeletonChatExample {
  protected readonly messages: ChatMessage[] = [
    { fromMe: false, width: '55%' },
    { fromMe: true, width: '38%' },
    { fromMe: false, width: '68%' },
  ];
}
