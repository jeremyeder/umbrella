/**
 * Path validator for workspace security
 * Prevents path traversal attacks
 */
import { PathTraversalError } from '../errors/types.js';
import * as path from 'node:path';

/**
 * Validate a file path to prevent path traversal attacks
 * @param filePath - The path to validate (should be relative)
 * @param allowAbsolute - Whether to allow absolute paths (default: false)
 * @throws PathTraversalError if path is invalid
 */
export function validatePath(filePath: string, allowAbsolute: boolean = false): void {
  // Check for null or empty
  if (!filePath || filePath.trim() === '') {
    throw new PathTraversalError('Path cannot be empty');
  }

  // Check for absolute paths (unless explicitly allowed)
  if (!allowAbsolute && path.isAbsolute(filePath)) {
    throw new PathTraversalError(
      'Absolute paths are not allowed. Use relative paths from workspace root.'
    );
  }

  // Normalize the path to resolve any .. or . segments
  const normalized = path.normalize(filePath);

  // Check if normalized path tries to escape (contains leading ..)
  if (normalized.startsWith('..') || normalized.includes(`${path.sep}..${path.sep}`)) {
    throw new PathTraversalError(
      'Path traversal detected. Paths cannot contain ".." segments.'
    );
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.[\/\\]/,  // ../ or ..\
    /[\/\\]\.\./,  // /.. or \..
    /\0/,          // Null bytes
    /[<>:"|?*]/,   // Invalid filename characters
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(filePath)) {
      throw new PathTraversalError(
        'Path contains invalid or suspicious characters'
      );
    }
  }
}

/**
 * Validate and normalize a workspace file path
 * @param filePath - The file path to validate
 * @returns Normalized safe path
 * @throws PathTraversalError if path is invalid
 */
export function validateWorkspacePath(filePath: string): string {
  validatePath(filePath, false);

  // Normalize the path
  const normalized = path.normalize(filePath);

  // Remove leading slash if present
  return normalized.startsWith(path.sep) ? normalized.substring(1) : normalized;
}

/**
 * Check if a path is safe (returns boolean instead of throwing)
 * @param filePath - The path to check
 * @returns true if path is safe, false otherwise
 */
export function isPathSafe(filePath: string): boolean {
  try {
    validatePath(filePath, false);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve a safe path within a workspace root
 * @param workspaceRoot - The workspace root directory (absolute)
 * @param filePath - The relative file path
 * @returns Absolute resolved path
 * @throws PathTraversalError if path escapes workspace
 */
export function resolveSafePath(workspaceRoot: string, filePath: string): string {
  // Validate the relative path first
  const safePath = validateWorkspacePath(filePath);

  // Resolve against workspace root
  const resolved = path.resolve(workspaceRoot, safePath);

  // Ensure resolved path is still within workspace
  if (!resolved.startsWith(workspaceRoot)) {
    throw new PathTraversalError(
      'Resolved path escapes workspace boundary'
    );
  }

  return resolved;
}
