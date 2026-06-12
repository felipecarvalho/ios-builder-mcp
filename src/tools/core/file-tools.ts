import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { createTextResult, createErrorResult, ToolResult } from '../../types/tools.js';
import { registerTool } from '../registry.js';
import { config } from '../../config.js';

const writeFileSchema = z.object({
  path: z.string().describe('File path relative to project root'),
  content: z.string().describe('Complete file content'),
});

const editFileSchema = z.object({
  path: z.string().describe('File path relative to project root'),
  oldString: z.string().describe('Exact string to find and replace'),
  newString: z.string().describe('Replacement string'),
});

const readFilesSchema = z.object({
  paths: z.array(z.string()).describe('Array of file paths to read'),
  startLine: z.number().optional().describe('Optional start line (1-indexed)'),
  limit: z.number().optional().describe('Optional max lines to return'),
});

const searchFilesSchema = z.object({
  pattern: z.string().describe('Text or regex pattern to search'),
  include: z.string().optional().describe('Optional glob pattern to filter files'),
  caseSensitive: z.boolean().default(true).describe('Case sensitive search'),
  regex: z.boolean().default(false).describe('Use regex pattern'),
  contextBefore: z.number().default(0).describe('Context lines before match'),
  contextAfter: z.number().default(0).describe('Context lines after match'),
});

const listFilesSchema = z.object({
  pattern: z.string().optional().describe('Optional glob pattern'),
});

const deleteFileSchema = z.object({
  path: z.string().describe('File path to delete'),
});

const renameFileSchema = z.object({
  oldPath: z.string().describe('Current file path'),
  newPath: z.string().describe('New file path'),
});

export function registerFileTools(): void {
  registerTool(
    {
      name: 'write_file',
      description: 'Write a file to the project. Creates the file if it doesn\'t exist, overwrites if it does.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to project root' },
          content: { type: 'string', description: 'Complete file content' },
        },
        required: ['path', 'content'],
      },
    },
    handleWriteFile,
  );

  registerTool(
    {
      name: 'edit_file',
      description: 'Make a surgical edit to an existing file by replacing a specific string.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path relative to project root' },
          oldString: { type: 'string', description: 'Exact string to find and replace' },
          newString: { type: 'string', description: 'Replacement string' },
        },
        required: ['path', 'oldString', 'newString'],
      },
    },
    handleEditFile,
  );

  registerTool(
    {
      name: 'read_files',
      description: 'Read one or more files from the project.',
      inputSchema: {
        type: 'object',
        properties: {
          paths: { type: 'array', items: { type: 'string' }, description: 'Array of file paths' },
          startLine: { type: 'number', description: 'Optional start line (1-indexed)' },
          limit: { type: 'number', description: 'Optional max lines to return' },
        },
        required: ['paths'],
      },
    },
    handleReadFiles,
  );

  registerTool(
    {
      name: 'search_files',
      description: 'Search across all project files for a text pattern.',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Text or regex pattern' },
          include: { type: 'string', description: 'Optional glob pattern' },
          caseSensitive: { type: 'boolean' },
          regex: { type: 'boolean' },
          contextBefore: { type: 'number' },
          contextAfter: { type: 'number' },
        },
        required: ['pattern'],
      },
    },
    handleSearchFiles,
  );

  registerTool(
    {
      name: 'list_files',
      description: 'List files in the project.',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Optional glob pattern' },
        },
      },
    },
    handleListFiles,
  );

  registerTool(
    {
      name: 'delete_file',
      description: 'Delete a file from the project.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to delete' },
        },
        required: ['path'],
      },
    },
    handleDeleteFile,
  );

  registerTool(
    {
      name: 'rename_file',
      description: 'Rename or move a file.',
      inputSchema: {
        type: 'object',
        properties: {
          oldPath: { type: 'string', description: 'Current file path' },
          newPath: { type: 'string', description: 'New file path' },
        },
        required: ['oldPath', 'newPath'],
      },
    },
    handleRenameFile,
  );
}

async function handleWriteFile(args: unknown): Promise<ToolResult> {
  const { path: filePath, content } = writeFileSchema.parse(args);
  const fullPath = path.join(config.projectRoot, filePath);
  
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
  
  return createTextResult(`Successfully wrote ${filePath}`);
}

async function handleEditFile(args: unknown): Promise<ToolResult> {
  const { path: filePath, oldString, newString } = editFileSchema.parse(args);
  const fullPath = path.join(config.projectRoot, filePath);
  
  const content = await fs.readFile(fullPath, 'utf-8');
  
  if (!content.includes(oldString)) {
    return createErrorResult(`oldString not found in ${filePath}`);
  }
  
  const newContent = content.replace(oldString, newString);
  await fs.writeFile(fullPath, newContent, 'utf-8');
  
  return createTextResult(`Successfully edited ${filePath}`);
}

async function handleReadFiles(args: unknown): Promise<ToolResult> {
  const { paths, startLine, limit } = readFilesSchema.parse(args);
  const results: string[] = [];
  
  for (const filePath of paths) {
    try {
      const fullPath = path.join(config.projectRoot, filePath);
      let content = await fs.readFile(fullPath, 'utf-8');
      
      if (startLine || limit) {
        const lines = content.split('\n');
        const start = (startLine || 1) - 1;
        const end = limit ? start + limit : lines.length;
        content = lines.slice(start, end).join('\n');
      }
      
      results.push(`=== ${filePath} ===\n${content}`);
    } catch (error) {
      results.push(`=== ${filePath} ===\nError: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return createTextResult(results.join('\n\n'));
}

async function handleSearchFiles(args: unknown): Promise<ToolResult> {
  const { pattern, include, caseSensitive, regex, contextBefore, contextAfter } = 
    searchFilesSchema.parse(args);
  
  const globPattern = include || '**/*.{swift,ts,js,json,md}';
  const files = await glob(globPattern, { 
    cwd: config.projectRoot,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
  });
  
  const searchPattern = regex 
    ? new RegExp(pattern, caseSensitive ? 'g' : 'gi')
    : new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
  
  const results: string[] = [];
  let totalMatches = 0;
  
  for (const file of files.slice(0, 100)) {
    try {
      const fullPath = path.join(config.projectRoot, file);
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        if (searchPattern.test(lines[i])) {
          totalMatches++;
          const start = Math.max(0, i - contextBefore);
          const end = Math.min(lines.length, i + contextAfter + 1);
          const context = lines.slice(start, end).join('\n');
          results.push(`${file}:${i + 1}\n${context}`);
          searchPattern.lastIndex = 0;
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }
  
  return createTextResult(`Found ${totalMatches} matches:\n\n${results.join('\n\n')}`);
}

async function handleListFiles(args: unknown): Promise<ToolResult> {
  const { pattern } = listFilesSchema.parse(args);
  const globPattern = pattern || '**/*';
  
  const files = await glob(globPattern, { 
    cwd: config.projectRoot,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
  });
  
  return createTextResult(files.join('\n'));
}

async function handleDeleteFile(args: unknown): Promise<ToolResult> {
  const { path: filePath } = deleteFileSchema.parse(args);
  const fullPath = path.join(config.projectRoot, filePath);
  
  await fs.unlink(fullPath);
  
  return createTextResult(`Successfully deleted ${filePath}`);
}

async function handleRenameFile(args: unknown): Promise<ToolResult> {
  const { oldPath, newPath } = renameFileSchema.parse(args);
  const fullOldPath = path.join(config.projectRoot, oldPath);
  const fullNewPath = path.join(config.projectRoot, newPath);
  
  await fs.mkdir(path.dirname(fullNewPath), { recursive: true });
  await fs.rename(fullOldPath, fullNewPath);
  
  return createTextResult(`Successfully renamed ${oldPath} to ${newPath}`);
}
