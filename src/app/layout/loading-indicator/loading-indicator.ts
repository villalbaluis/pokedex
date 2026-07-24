import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/loading/loading.service';

@Component({
  selector: 'app-loading-indicator',
  imports: [],
  templateUrl: './loading-indicator.html',
  styleUrl: './loading-indicator.scss'
})
export class LoadingIndicator {
  protected readonly loadingService = inject(LoadingService);
}