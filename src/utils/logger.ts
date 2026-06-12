export function log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
  const timestamp = new Date().toLocaleTimeString('zh-CN');
  const colors = {
    info: '\x1b[36m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    success: '\x1b[32m',
    reset: '\x1b[0m',
  };
  console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
}
