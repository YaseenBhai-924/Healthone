/**
 * Mock for the 'server-only' package in Vitest (Node.js environment).
 *
 * 'server-only' throws when imported outside a React Server Component bundle.
 * In Vitest the default export path is used (not react-server), so we need to
 * replace it with a no-op to allow testing server-only modules.
 */
export {};
