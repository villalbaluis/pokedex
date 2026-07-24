import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

export default [
  provideZonelessChangeDetection(),
  provideRouter([]),
];
