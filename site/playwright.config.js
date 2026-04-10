'use strict';

module.exports = {
  testDir: './tests',
  testMatch: ['*.e2e.js'],
  webServer: {
    command: 'node serve.js',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
    timeout: 10000
  },
  use: {
    baseURL: 'http://127.0.0.1:4321'
  }
};
