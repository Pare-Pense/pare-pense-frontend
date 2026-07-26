import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBell, LucideUser } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-top-bar',
  imports: [ButtonModule, RouterLink, LucideBell, LucideUser],
  templateUrl: './top-bar.html',
})
export class TopBar {
  public title = input.required<string>();
}
