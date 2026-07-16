#!/usr/bin/env node
import { main } from '../dist/index.js';

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});