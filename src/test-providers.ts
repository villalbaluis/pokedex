import { Component, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

@Component({
  selector: 'app-test-route-stub',
  template: '',
})
class TestRouteStubComponent {}

export default [
  provideZonelessChangeDetection(),
  provideRouter([{ path: 'pokemon/:id', component: TestRouteStubComponent }]),
];
