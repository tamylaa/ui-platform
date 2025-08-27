#!/usr/bin/env node
/**
 * Logging Utilities
 * Centralized logging with consistent formatting
 */

import chalk from 'chalk';

export class Logger {
  static info(message, prefix = '') {
    const prefixStr = prefix ? `[${prefix}] ` : '';
    console.log(chalk.blue(`${prefixStr}${message}`));
  }

  static success(message, prefix = '') {
    const prefixStr = prefix ? `[${prefix}] ` : '';
    console.log(chalk.green(`✅ ${prefixStr}${message}`));
  }

  static warning(message, prefix = '') {
    const prefixStr = prefix ? `[${prefix}] ` : '';
    console.log(chalk.yellow(`⚠️  ${prefixStr}${message}`));
  }

  static error(message, prefix = '') {
    const prefixStr = prefix ? `[${prefix}] ` : '';
    console.log(chalk.red(`❌ ${prefixStr}${message}`));
  }

  static step(stepNumber, message, prefix = '') {
    const prefixStr = prefix ? `[${prefix}] ` : '';
    console.log(chalk.yellow(`\n📋 Step ${stepNumber}: ${prefixStr}${message}`));
  }

  static header(title) {
    console.log(chalk.blue.bold(`\n🚀 ${title}`));
    console.log(chalk.gray('=' .repeat(60)));
  }

  static subheader(title) {
    console.log(chalk.cyan.bold(`\n📦 ${title}`));
    console.log(chalk.gray('-' .repeat(40)));
  }

  static detail(message, indent = 1) {
    const indentStr = '   '.repeat(indent);
    console.log(chalk.gray(`${indentStr}${message}`));
  }

  static command(command, cwd = '') {
    const cwdStr = cwd ? ` (in ${cwd})` : '';
    console.log(chalk.cyan(`   Running: ${command}${cwdStr}`));
  }

  static separator() {
    console.log(chalk.gray('-' .repeat(60)));
  }

  static newline() {
    console.log('');
  }

  static table(data, title = '') {
    if (title) {
      this.subheader(title);
    }

    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (typeof item === 'object') {
          console.log(chalk.yellow(`${index + 1}. ${item.name || item.title || 'Item'}`));
          Object.entries(item).forEach(([key, value]) => {
            if (key !== 'name' && key !== 'title') {
              this.detail(`${key}: ${value}`);
            }
          });
        } else {
          console.log(chalk.yellow(`${index + 1}. ${item}`));
        }
      });
    } else if (typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        console.log(chalk.yellow(`${key}: ${value}`));
      });
    }
  }

  static progress(current, total, message = '') {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    console.log(chalk.blue(`[${progressBar}] ${percentage}% ${message}`));
  }
}
