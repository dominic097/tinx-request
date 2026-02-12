import type { Environment } from '@/types';
import { replaceDynamicVariables } from '@/lib/dynamicVariables';

/**
 * Substitutes variables in a string with values from the environment
 * Supports {{variableName}} syntax and dynamic variables like {{$guid}}
 */
export function substituteVariables(
  input: string,
  environment: Environment | null
): string {
  // First, replace dynamic variables ({{$guid}}, etc.)
  let result = replaceDynamicVariables(input);

  if (!environment) return result;

  const enabledVariables = environment.variables.filter(v => v.enabled);

  // Then replace environment variables
  enabledVariables.forEach(variable => {
    const regex = new RegExp(`\\{\\{\\s*${variable.key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, variable.value);
  });

  return result;
}

/**
 * Substitutes variables in headers object
 */
export function substituteHeaderVariables(
  headers: Record<string, string>,
  environment: Environment | null
): Record<string, string> {
  if (!environment) return headers;

  const substitutedHeaders: Record<string, string> = {};

  Object.entries(headers).forEach(([key, value]) => {
    substitutedHeaders[substituteVariables(key, environment)] =
      substituteVariables(value, environment);
  });

  return substitutedHeaders;
}
