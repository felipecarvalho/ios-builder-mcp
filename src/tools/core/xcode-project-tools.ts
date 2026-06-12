import * as fs from 'fs/promises';
import * as path from 'path';
import { registerTool } from '../registry.js';
import { createTextResult, createErrorResult } from '../../types/tools.js';
import { config } from '../../config.js';
import { generateProjectPBX, generateInfoPlist, generateAssetsContents, generateAppIconContents, generateAccentColorContents } from '../../templates/xcode-project.js';
import { getAppEntryTemplate, getContentViewTemplate } from '../../templates/index.js';

export function registerXcodeProjectTools(): void {
  registerTool(
    {
      name: 'generate_xcode_project',
      description: 'Generate a complete Xcode project structure (.xcodeproj, Info.plist, Assets.xcassets, source files) at the user\'s working directory. Call this AFTER workflow_init and BEFORE writing SwiftUI code.',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name of the project (e.g., PetDiary)',
          },
          bundleId: {
            type: 'string',
            description: 'Bundle identifier (e.g., com.yourname.PetDiary)',
          },
          deploymentTarget: {
            type: 'string',
            description: 'iOS deployment target (default: 16.0)',
          },
          swiftVersion: {
            type: 'string',
            description: 'Swift version (default: 5.9)',
          },
          outputDir: {
            type: 'string',
            description: 'Output directory relative to project root (default: projectName)',
          },
        },
        required: ['projectName', 'bundleId'],
      },
    },
    async (args: unknown) => {
      const {
        projectName,
        bundleId,
        deploymentTarget = '16.0',
        swiftVersion = '5.9',
        outputDir,
      } = args as {
        projectName: string;
        bundleId: string;
        deploymentTarget?: string;
        swiftVersion?: string;
        outputDir?: string;
      };

      if (!projectName || typeof projectName !== 'string') {
        return createErrorResult('projectName is required');
      }
      if (!bundleId || typeof bundleId !== 'string') {
        return createErrorResult('bundleId is required');
      }

      const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '');
      const baseDir = path.join(config.projectRoot, outputDir || sanitizedName);

      // Create directory structure
      const xcodeprojDir = path.join(baseDir, `${sanitizedName}.xcodeproj`);
      const srcDir = path.join(baseDir, sanitizedName);
      const assetsDir = path.join(srcDir, 'Assets.xcassets');
      const appIconDir = path.join(assetsDir, 'AppIcon.appiconset');
      const accentColorDir = path.join(assetsDir, 'AccentColor.colorset');
      const subdirs = ['Views', 'Models', 'ViewModels', 'Components'];

      await fs.mkdir(xcodeprojDir, { recursive: true });
      await fs.mkdir(srcDir, { recursive: true });
      await fs.mkdir(assetsDir, { recursive: true });
      await fs.mkdir(appIconDir, { recursive: true });
      await fs.mkdir(accentColorDir, { recursive: true });
      for (const dir of subdirs) {
        await fs.mkdir(path.join(srcDir, dir), { recursive: true });
      }

      // Write project.pbxproj
      await fs.writeFile(
        path.join(xcodeprojDir, 'project.pbxproj'),
        generateProjectPBX(sanitizedName, bundleId, deploymentTarget, swiftVersion),
        'utf-8',
      );

      // Write Info.plist
      await fs.writeFile(
        path.join(srcDir, 'Info.plist'),
        generateInfoPlist(sanitizedName),
        'utf-8',
      );

      // Write Assets.xcassets
      await fs.writeFile(
        path.join(assetsDir, 'Contents.json'),
        generateAssetsContents(),
        'utf-8',
      );
      await fs.writeFile(
        path.join(appIconDir, 'Contents.json'),
        generateAppIconContents(),
        'utf-8',
      );
      await fs.writeFile(
        path.join(accentColorDir, 'Contents.json'),
        generateAccentColorContents(),
        'utf-8',
      );

      // Write source file stubs
      await fs.writeFile(
        path.join(srcDir, 'App.swift'),
        getAppEntryTemplate(sanitizedName),
        'utf-8',
      );
      await fs.writeFile(
        path.join(srcDir, 'ContentView.swift'),
        getContentViewTemplate(sanitizedName),
        'utf-8',
      );

      // Create a marker file so the workflow knows the project exists
      const workflowDir = path.join(baseDir, '.ios-builder');
      await fs.mkdir(workflowDir, { recursive: true });
      await fs.writeFile(
        path.join(workflowDir, 'project.json'),
        JSON.stringify({
          name: sanitizedName,
          bundleId,
          path: baseDir,
          createdAt: new Date().toISOString(),
        }, null, 2),
        'utf-8',
      );

      return createTextResult(`✅ Xcode project "${sanitizedName}" created at: ${baseDir}

Structure:
${sanitizedName}.xcodeproj/
${sanitizedName}/
├── App.swift
├── ContentView.swift
├── Info.plist
├── Assets.xcassets/
│   ├── Contents.json
│   ├── AppIcon.appiconset/
│   └── AccentColor.colorset/
├── Views/
├── Models/
├── ViewModels/
└── Components/

Bundle ID: ${bundleId}
iOS Target: ${deploymentTarget}
Swift: ${swiftVersion}

Now use write_file to add your screens, models, view models, and components to the subdirectories.`);
    },
  );
}
