import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomesPage } from './receitas-page';

describe('IncomesPage', () => {
  let component: IncomesPage;
  let fixture: ComponentFixture<IncomesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
