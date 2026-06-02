import { Component, computed, input } from '@angular/core';
import { LucideHouse, LucideAtom, LucideGlasses, LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-nav-bottom-button',
  imports: [LucideDynamicIcon],
  templateUrl: 'button.html',
})
export class NavBottomButton {
  public checked = input(false);
  public icon = input.required<'house' | 'atom' | 'glasses'>();

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
}
