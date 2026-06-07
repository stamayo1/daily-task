import { TestBed } from '@angular/core/testing';
import { FirebaseCrashlytics } from '@awesome-cordova-plugins/firebase-crashlytics/ngx';

import { LoggerServices } from './logger-services';

const mockCrashlyticsInstance = {
  log: jasmine.createSpy('log'),
  logException: jasmine.createSpy('logException'),
};

const mockFirebaseCrashlytics = {
  initialise: jasmine.createSpy('initialise').and.returnValue(mockCrashlyticsInstance),
};

describe('LoggerServices', () => {

  let logger: LoggerServices;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoggerServices,
        { provide: FirebaseCrashlytics, useValue: mockFirebaseCrashlytics },
      ],
    });
    logger = TestBed.inject(LoggerServices);
  });

  afterEach(() => {
    mockCrashlyticsInstance.log.calls.reset();
    mockCrashlyticsInstance.logException.calls.reset();
    mockFirebaseCrashlytics.initialise.calls.reset();
  });

  it('should create and call initialise() on FirebaseCrashlytics', () => {
    expect(logger).toBeTruthy();
    expect(mockFirebaseCrashlytics.initialise).toHaveBeenCalledTimes(1);
  });

  describe('debug()', () => {
    it('logs to console.debug', () => {
      spyOn(console, 'debug');
      logger.debug('test message');
      expect(console.debug).toHaveBeenCalledWith('[DEBUG] test message');
    });

    it('does NOT send anything to Crashlytics', () => {
      logger.debug('test message');
      expect(mockCrashlyticsInstance.log).not.toHaveBeenCalled();
      expect(mockCrashlyticsInstance.logException).not.toHaveBeenCalled();
    });
  });

  describe('info()', () => {
    it('logs to console.info', () => {
      spyOn(console, 'info');
      logger.info('db ready');
      expect(console.info).toHaveBeenCalledWith('[INFO] db ready');
    });

    it('sends breadcrumb to Crashlytics', () => {
      logger.info('db ready');
      expect(mockCrashlyticsInstance.log).toHaveBeenCalledWith('db ready');
    });

    it('does NOT call logException', () => {
      logger.info('db ready');
      expect(mockCrashlyticsInstance.logException).not.toHaveBeenCalled();
    });
  });

  describe('warn()', () => {
    it('logs to console.warn', () => {
      spyOn(console, 'warn');
      logger.warn('connection lost');
      expect(console.warn).toHaveBeenCalledWith('[WARN] connection lost');
    });

    it('sends breadcrumb to Crashlytics with [WARN] prefix', () => {
      logger.warn('connection lost');
      expect(mockCrashlyticsInstance.log).toHaveBeenCalledWith('[WARN] connection lost');
    });

    it('does NOT call logException', () => {
      logger.warn('connection lost');
      expect(mockCrashlyticsInstance.logException).not.toHaveBeenCalled();
    });
  });

  describe('error()', () => {
    beforeEach(() => spyOn(console, 'error'));

    it('logs to console.error', () => {
      logger.error('query failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('calls logException with message only when no error object provided', () => {
      logger.error('query failed');
      expect(mockCrashlyticsInstance.logException).toHaveBeenCalledWith('query failed');
    });

    it('calls logException with message + error.message when Error is provided', () => {
      logger.error('query failed', new Error('syntax error'));
      expect(mockCrashlyticsInstance.logException)
        .toHaveBeenCalledWith('query failed: syntax error');
    });

    it('calls logException with message + string when non-Error is provided', () => {
      logger.error('query failed', 'timeout');
      expect(mockCrashlyticsInstance.logException)
        .toHaveBeenCalledWith('query failed: timeout');
    });

    it('does NOT call log() breadcrumb', () => {
      logger.error('query failed');
      expect(mockCrashlyticsInstance.log).not.toHaveBeenCalled();
    });
  });
});