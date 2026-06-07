import { TestBed } from '@angular/core/testing';

import { AppInitializer } from './app-initializer';

describe('AppInitializer', () => {
  let service: AppInitializer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppInitializer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
