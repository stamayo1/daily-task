import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SqliteServices } from './sqlite-services';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { LoggerServices } from '../loggerServices/logger-services';

describe('SqliteServices', () => {
  let service: SqliteServices;
  let sqliteSpy: jasmine.SpyObj<SQLite>;
  let loggerSpy: jasmine.SpyObj<LoggerServices>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let dbSpy: jasmine.SpyObj<SQLiteObject>;

  beforeEach(() => {
    sqliteSpy = jasmine.createSpyObj('SQLite', ['create']);
    loggerSpy = jasmine.createSpyObj('LoggerServices', ['info', 'warn', 'error', 'debug']);
    platformSpy = jasmine.createSpyObj('Platform', ['ready']);
    
    // Default db mock
    dbSpy = jasmine.createSpyObj('SQLiteObject', ['executeSql', 'sqlBatch']);
    dbSpy.executeSql.and.returnValue(Promise.resolve({ rows: { length: 0, item: () => ({}) } }));
    dbSpy.sqlBatch.and.returnValue(Promise.resolve());
    
    sqliteSpy.create.and.returnValue(Promise.resolve(dbSpy));

    TestBed.configureTestingModule({
      providers: [
        SqliteServices,
        { provide: SQLite, useValue: sqliteSpy },
        { provide: LoggerServices, useValue: loggerSpy },
        { provide: Platform, useValue: platformSpy }
      ]
    });
    
    service = TestBed.inject(SqliteServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should open database and apply migrations', fakeAsync(() => {
      service.open('test.db', 'default');
      tick();

      expect(sqliteSpy.create).toHaveBeenCalledWith({ name: 'test.db', location: 'default' });
      expect(dbSpy.executeSql).toHaveBeenCalledWith('PRAGMA foreign_keys = ON;', []);
      expect(dbSpy.executeSql).toHaveBeenCalledWith(jasmine.stringMatching(/CREATE TABLE IF NOT EXISTS _db_version/), []);
      expect(loggerSpy.info).toHaveBeenCalledWith('[SQLite] Connection ready to test.db');
    }));
  });

  describe('ensureOpen', () => {
    it('should ping if already connected', fakeAsync(() => {
      service.open('test.db', 'default');
      tick();
      sqliteSpy.create.calls.reset();

      service.ensureOpen();
      tick();

      expect(dbSpy.executeSql).toHaveBeenCalledWith('SELECT 1;', []);
      expect(sqliteSpy.create).not.toHaveBeenCalled();
    }));

    it('should reconnect if ping fails', fakeAsync(() => {
      service.open('test.db', 'default');
      tick();
      sqliteSpy.create.calls.reset();

      // Make ping fail
      dbSpy.executeSql.and.callFake((sql: string) => {
        if (sql === 'SELECT 1;') return Promise.reject('Ping failed');
        return Promise.resolve({ rows: { length: 0, item: () => ({}) } });
      });

      service.ensureOpen();
      tick();

      expect(loggerSpy.warn).toHaveBeenCalledWith('Connection not responding, reopening...');
      expect(sqliteSpy.create).toHaveBeenCalled();
    }));

    it('should retry on connection failure', fakeAsync(() => {
      sqliteSpy.create.and.returnValue(Promise.reject('Connection failed'));
      
      service.open('test.db', 'default').catch(() => {});
      
      tick(100); // 1st retry delay
      tick(200); // 2nd retry delay
      tick(300); // 3rd retry delay

      expect(sqliteSpy.create).toHaveBeenCalledTimes(3);
      expect(loggerSpy.warn).toHaveBeenCalledWith(jasmine.stringMatching(/Attempt 1\/3 failed:/), 'Connection failed');
      expect(loggerSpy.warn).toHaveBeenCalledWith(jasmine.stringMatching(/Attempt 2\/3 failed:/), 'Connection failed');
      expect(loggerSpy.warn).toHaveBeenCalledWith(jasmine.stringMatching(/Attempt 3\/3 failed:/), 'Connection failed');
    }));
  });

  describe('Migrations', () => {
    it('should apply pending migrations', fakeAsync(() => {
      // Mock getAppliedVersions to return empty (no migrations applied)
      dbSpy.executeSql.and.callFake((sql: string) => {
        if (sql.includes('SELECT version FROM _db_version')) {
          return Promise.resolve({ rows: { length: 0, item: () => ({}) } });
        }
        return Promise.resolve({ rows: { length: 0, item: () => ({}) } });
      });

      // Provide custom migrations array via bracket notation (since it's private)
      (service as any).upgrades = [
        { toVersion: 1, statements: ['CREATE TABLE test (id INTEGER);'] }
      ];

      service.open('test.db', 'default');
      tick();

      expect(dbSpy.sqlBatch).toHaveBeenCalledWith([
        'CREATE TABLE test (id INTEGER);',
        ['INSERT INTO _db_version (version) VALUES (?);', [1]]
      ]);
    }));

    it('should not apply already applied migrations', fakeAsync(() => {
      // Mock getAppliedVersions to return version 1
      dbSpy.executeSql.and.callFake((sql: string) => {
        if (sql.includes('SELECT version FROM _db_version')) {
          return Promise.resolve({ 
            rows: { 
              length: 1, 
              item: (i: number) => ({ version: 1 }) 
            } 
          });
        }
        return Promise.resolve({ rows: { length: 0, item: () => ({}) } });
      });

      (service as any).upgrades = [
        { toVersion: 1, statements: ['CREATE TABLE test (id INTEGER);'] }
      ];

      service.open('test.db', 'default');
      tick();

      expect(dbSpy.sqlBatch).not.toHaveBeenCalled();
      expect(loggerSpy.info).toHaveBeenCalledWith('[SQLite] No pending migrations');
    }));
  });
});
