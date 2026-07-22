import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegionNav } from './region-nav';

describe('RegionNav', () => {
  let component: RegionNav;
  let fixture: ComponentFixture<RegionNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
