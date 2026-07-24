import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { RegionNav } from './region-nav';
import { RegionService } from '../../services/region.service';

class FakeRegionService {
  selectedRegion = signal<string | null>(null);
  selectRegion = vi.fn((name: string | null) => this.selectedRegion.set(name));
  getRegions = vi.fn().mockReturnValue(
    of({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'kanto', url: '' },
        { name: 'johto', url: '' },
      ],
    })
  );
}

describe('RegionNav', () => {
  let component: RegionNav;
  let fixture: ComponentFixture<RegionNav>;
  let regionService: FakeRegionService;

  beforeEach(async () => {
    regionService = new FakeRegionService();

    await TestBed.configureTestingModule({
      imports: [RegionNav],
      providers: [{ provide: RegionService, useValue: regionService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegionNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the regions on init', () => {
    expect(regionService.getRegions).toHaveBeenCalled();
  });

  it('should render a chip for "Todos" plus one per region', () => {
    const chips = fixture.nativeElement.querySelectorAll('.chip');
    expect(chips.length).toBe(3);
    expect(chips[1].textContent).toContain('kanto');
    expect(chips[2].textContent).toContain('johto');
  });

  it('should select a region when its chip is clicked', () => {
    const chips = fixture.nativeElement.querySelectorAll('.chip');
    chips[1].click();

    expect(regionService.selectRegion).toHaveBeenCalledWith('kanto');
    expect(regionService.selectedRegion()).toBe('kanto');
  });

  it('should select null (all regions) when the "Todos" chip is clicked', () => {
    regionService.selectRegion('kanto');

    const chips = fixture.nativeElement.querySelectorAll('.chip');
    chips[0].click();

    expect(regionService.selectRegion).toHaveBeenCalledWith(null);
    expect(regionService.selectedRegion()).toBeNull();
  });
});
