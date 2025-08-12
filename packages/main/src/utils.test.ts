import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateFilename, ensureHtmlExtension, guardWorkspacePath } from './utils.js';

describe('validateFilename', () => {
  it('should accept valid filenames', () => {
    expect(validateFilename('test.html')).toBe(true);
    expect(validateFilename('my-file_123.html')).toBe(true);
    expect(validateFilename('simple')).toBe(true);
    expect(validateFilename('file.name')).toBe(true);
  });

  it('should reject invalid filenames', () => {
    expect(validateFilename('test file.html')).toBe(false); // spaces
    expect(validateFilename('test/file.html')).toBe(false); // slashes
    expect(validateFilename('test\\file.html')).toBe(false); // backslashes
    expect(validateFilename('test<file>.html')).toBe(false); // special chars
    expect(validateFilename('')).toBe(false); // empty
  });
});

describe('ensureHtmlExtension', () => {
  it('should add .html extension if missing', () => {
    expect(ensureHtmlExtension('test')).toBe('test.html');
    expect(ensureHtmlExtension('my-file')).toBe('my-file.html');
  });

  it('should not add extension if already present', () => {
    expect(ensureHtmlExtension('test.html')).toBe('test.html');
    expect(ensureHtmlExtension('my-file.html')).toBe('my-file.html');
  });
});

describe('guardWorkspacePath', () => {
  it('should allow paths within workspace', () => {
    expect(() => {
      guardWorkspacePath('/workspace', '/workspace/file.html');
    }).not.toThrow();

    expect(() => {
      guardWorkspacePath('/workspace', '/workspace/subfolder/file.html');
    }).not.toThrow();
  });

  it('should reject paths outside workspace', () => {
    expect(() => {
      guardWorkspacePath('/workspace', '/other/file.html');
    }).toThrow('Path traversal detected');

    expect(() => {
      guardWorkspacePath('/workspace', '../file.html');
    }).toThrow('Path traversal detected');

    expect(() => {
      guardWorkspacePath('/workspace', '/workspace/../other/file.html');
    }).toThrow('Path traversal detected');
  });
});