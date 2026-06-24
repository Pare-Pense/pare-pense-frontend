import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LucideHouse, LucideAtom, LucideGlasses, LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-nav-bottom-button',
  imports: [LucideDynamicIcon],
  templateUrl: 'button.html',
})
export class NavBottomButton {
  public checked = input(false);
  public icon = input.required<'house' | 'atom' | 'glasses'>();
  public url = input.required<string>();
  private router = inject(Router);

  protected iconProp = computed(() => {
    switch (this.icon()) {
      case 'house':
        return LucideHouse;
      case 'atom':
        return LucideAtom;
      case 'glasses':
        return LucideGlasses;
    }
  });

  onClick() {
    this.router.navigateByUrl(this.url());
  }
}
