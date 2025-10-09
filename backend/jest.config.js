export default {
  // Entorno de pruebas
  testEnvironment: 'node',
  
  // Transformar archivos ES6
  transform: {},
  
  // Extensiones de archivos
  moduleFileExtensions: ['js', 'json'],
  
  // Patrón de archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/seeds/**'
  ],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Reportes de cobertura
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Timeout para tests
  testTimeout: 30000,
  
  // Variables de entorno para tests
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Ignorar archivos
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
  
  // Modo verbose para más información
  verbose: true
};
