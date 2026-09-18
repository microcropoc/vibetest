import { Component, input } from '@angular/core';

@Component({
  selector: 'app-player-page',
  templateUrl: './player-page.html',
  styleUrl: '../../../shared/ui/page-placeholder/page-placeholder.scss',
})
export class PlayerPage {
  readonly courseId = input.required<string>();
  readonly moduleId = input.required<string>();
}
