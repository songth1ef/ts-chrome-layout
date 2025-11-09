import {
  getGlobalConfig,
  setGlobalConfig,
  resetGlobalConfig,
  getEnvConfig,
} from '../../../src/core/config';

describe('Config', () => {
  beforeEach(() => {
    resetGlobalConfig();
  });

  describe('getGlobalConfig', () => {
    it('should return default config', () => {
      const config = getGlobalConfig();
      expect(config).toHaveProperty('defaultEnableValidation');
      expect(config).toHaveProperty('defaultEnablePerformanceMonitoring');
      expect(config).toHaveProperty('defaultEnableCache');
      expect(config).toHaveProperty('defaultCacheSize');
      expect(config).toHaveProperty('defaultLogLevel');
      expect(config.defaultEnableValidation).toBe(true);
    });

    it('should return a copy of config', () => {
      const config1 = getGlobalConfig();
      const config2 = getGlobalConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('setGlobalConfig', () => {
    it('should update global config', () => {
      setGlobalConfig({
        defaultEnableValidation: false,
        defaultCacheSize: 200,
      });

      const config = getGlobalConfig();
      expect(config.defaultEnableValidation).toBe(false);
      expect(config.defaultCacheSize).toBe(200);
      expect(config.defaultEnableCache).toBe(false);
    });

    it('should merge partial config', () => {
      const originalConfig = getGlobalConfig();
      setGlobalConfig({
        defaultCacheSize: 300,
      });

      const config = getGlobalConfig();
      expect(config.defaultCacheSize).toBe(300);
      expect(config.defaultEnableValidation).toBe(originalConfig.defaultEnableValidation);
    });
  });

  describe('resetGlobalConfig', () => {
    it('should reset to default values', () => {
      setGlobalConfig({
        defaultEnableValidation: false,
        defaultCacheSize: 500,
      });

      resetGlobalConfig();

      const config = getGlobalConfig();
      expect(config.defaultEnableValidation).toBe(true);
      expect(config.defaultCacheSize).toBe(100);
    });
  });

  describe('getEnvConfig', () => {
    it('should return empty config when no env vars set', () => {
      const config = getEnvConfig();
      expect(config).toEqual({});
    });

    it('should parse LAYOUT_ENABLE_VALIDATION', () => {
      const originalEnv = process.env.LAYOUT_ENABLE_VALIDATION;
      process.env.LAYOUT_ENABLE_VALIDATION = 'false';

      const config = getEnvConfig();
      expect(config.defaultEnableValidation).toBe(false);

      if (originalEnv !== undefined) {
        process.env.LAYOUT_ENABLE_VALIDATION = originalEnv;
      } else {
        delete process.env.LAYOUT_ENABLE_VALIDATION;
      }
    });

    it('should parse LAYOUT_ENABLE_PERFORMANCE_MONITORING', () => {
      const originalEnv = process.env.LAYOUT_ENABLE_PERFORMANCE_MONITORING;
      process.env.LAYOUT_ENABLE_PERFORMANCE_MONITORING = 'true';

      const config = getEnvConfig();
      expect(config.defaultEnablePerformanceMonitoring).toBe(true);

      if (originalEnv !== undefined) {
        process.env.LAYOUT_ENABLE_PERFORMANCE_MONITORING = originalEnv;
      } else {
        delete process.env.LAYOUT_ENABLE_PERFORMANCE_MONITORING;
      }
    });

    it('should parse LAYOUT_ENABLE_CACHE', () => {
      const originalEnv = process.env.LAYOUT_ENABLE_CACHE;
      process.env.LAYOUT_ENABLE_CACHE = 'true';

      const config = getEnvConfig();
      expect(config.defaultEnableCache).toBe(true);

      if (originalEnv !== undefined) {
        process.env.LAYOUT_ENABLE_CACHE = originalEnv;
      } else {
        delete process.env.LAYOUT_ENABLE_CACHE;
      }
    });

    it('should parse LAYOUT_CACHE_SIZE', () => {
      const originalEnv = process.env.LAYOUT_CACHE_SIZE;
      process.env.LAYOUT_CACHE_SIZE = '500';

      const config = getEnvConfig();
      expect(config.defaultCacheSize).toBe(500);

      if (originalEnv !== undefined) {
        process.env.LAYOUT_CACHE_SIZE = originalEnv;
      } else {
        delete process.env.LAYOUT_CACHE_SIZE;
      }
    });

    it('should parse LAYOUT_LOG_LEVEL', () => {
      const originalEnv = process.env.LAYOUT_LOG_LEVEL;
      process.env.LAYOUT_LOG_LEVEL = 'error';

      const config = getEnvConfig();
      expect(config.defaultLogLevel).toBe('error');

      if (originalEnv !== undefined) {
        process.env.LAYOUT_LOG_LEVEL = originalEnv;
      } else {
        delete process.env.LAYOUT_LOG_LEVEL;
      }
    });
  });
});
