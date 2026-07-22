import { Component, inject, signal } from '@angular/core';
import { RegionService } from '../../region.service';
import { NamedAPIResource } from '../../../shared/models/named-api-resource.model';

@Component({
  selector: 'app-region-nav',
  imports: [],
  templateUrl: './region-nav.html',
  styleUrl: './region-nav.scss'
})
export class RegionNav {
  private readonly regionService = inject(RegionService);

  protected readonly regions = signal<NamedAPIResource[]>([]);
  protected readonly selectedRegion = this.regionService.selectedRegion;

  ngOnInit(): void {
    this.regionService.getRegions().subscribe((response) => {
      this.regions.set(response.results);
    });
  }

  protected select(name: string | null): void {
    this.regionService.selectRegion(name);
  }
}