import { Component, ElementRef, OnInit, inject, signal, viewChild, } from '@angular/core';
import { RegionService } from '../../services/region.service';
import { NamedAPIResource } from '../../models/named-api-resource.model';

@Component({
  selector: 'app-region-nav',
  imports: [],
  templateUrl: './region-nav.html',
  styleUrl: './region-nav.scss',
})
export class RegionNav implements OnInit {
  private readonly regionService = inject(RegionService);
  protected readonly regions = signal<NamedAPIResource[]>([]);
  protected readonly selectedRegion = this.regionService.selectedRegion;

  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  ngOnInit(): void {
    this.loadRegions();
  }

  private loadRegions(): void {
    this.regionService.getRegions().subscribe((response) => {
      this.regions.set(response.results);
      requestAnimationFrame(() => this.updateEdges());
    });
  }

  protected select(name: string | null): void {
    this.regionService.selectRegion(name);
  }

  protected scrollBy(direction: -1 | 1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;

    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  }

  protected updateEdges(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    this.atStart.set(el.scrollLeft <= 2);
    this.atEnd.set(el.scrollLeft >= max - 2);
  }
}