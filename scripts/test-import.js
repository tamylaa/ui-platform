#!/usr/bin/env node
console.log('Test script starting...');

import { Logger } from './utils/logger.js';

console.log('Logger imported');
Logger.info('Test message');
