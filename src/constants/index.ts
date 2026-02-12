import { HttpMethod } from '@/types';

export const HTTP_METHODS = Object.values(HttpMethod);

export const HTTP_METHOD_COLORS: Record<HttpMethod, string> = {
  [HttpMethod.GET]: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950',
  [HttpMethod.POST]: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950',
  [HttpMethod.PUT]: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950',
  [HttpMethod.PATCH]: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950',
  [HttpMethod.DELETE]: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950',
  [HttpMethod.HEAD]: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-950',
  [HttpMethod.OPTIONS]: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950',
};

export const DEFAULT_HEADERS = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Accept', value: '*/*' },
  { key: 'User-Agent', value: 'Tinx/1.0.0' },
];

export const COMMON_CONTENT_TYPES = [
  'application/json',
  'application/xml',
  'text/plain',
  'text/html',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

export const STATUS_CODE_COLORS: Record<string, string> = {
  '2': 'text-green-600 dark:text-green-400',
  '3': 'text-blue-600 dark:text-blue-400',
  '4': 'text-yellow-600 dark:text-yellow-400',
  '5': 'text-red-600 dark:text-red-400',
};

export const KEYBOARD_SHORTCUTS = {
  SEND_REQUEST: 'Ctrl+Enter',
  NEW_REQUEST: 'Ctrl+N',
  SAVE: 'Ctrl+S',
  COMMAND_PALETTE: 'Ctrl+Shift+P',
  QUICK_OPEN: 'Ctrl+P',
  TOGGLE_SIDEBAR: 'Ctrl+B',
  CLOSE_TAB: 'Ctrl+W',
};
