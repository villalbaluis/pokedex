import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isLoading as false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should report loading as true after a request starts', () => {
    service.start();
    expect(service.isLoading()).toBe(true);
  });

  it('should stay loading while there are still pending requests', () => {
    service.start();
    service.start();
    service.stop();

    expect(service.isLoading()).toBe(true);
  });

  it('should report loading as false once every pending request has stopped', () => {
    service.start();
    service.start();
    service.stop();
    service.stop();

    expect(service.isLoading()).toBe(false);
  });

  it('should never report a negative amount of pending requests', () => {
    service.stop();
    service.stop();

    expect(service.isLoading()).toBe(false);

    service.start();
    expect(service.isLoading()).toBe(true);
  });
});
