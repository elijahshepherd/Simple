#!/usr/bin/env node
const { main } = require('../dist/index.js');

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});