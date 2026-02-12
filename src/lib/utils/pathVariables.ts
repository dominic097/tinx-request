/**
 * Extracts path variables from a URL
 * Example: /users/:userId/posts/:postId -> ['userId', 'postId']
 */
export function extractPathVariables(url: string): string[] {
  const pathVarRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const matches = url.matchAll(pathVarRegex);
  return Array.from(matches, m => m[1]);
}

/**
 * Replaces path variables in a URL with their values
 * Example: /users/:userId with { userId: '123' } -> /users/123
 */
export function replacePathVariables(
  url: string,
  variables: Array<{ key: string; value: string }>
): string {
  let result = url;
  variables.forEach(variable => {
    result = result.replace(`:${variable.key}`, variable.value);
  });
  return result;
}
