import * as crypto from 'crypto';

function hashId(seed: string): string {
  return crypto.createHash('md5').update(seed).digest('hex').toUpperCase().substring(0, 24);
}

function makeUUID(projectName: string, role: string): string {
  return hashId(`ios-builder-${projectName}-${role}`);
}

export interface XcodeProjectConfig {
  projectName: string;
  bundleId: string;
  deploymentTarget?: string;
  swiftVersion?: string;
}

export function generateProjectPBX(projectName: string, bundleId: string, deploymentTarget = '16.0', swiftVersion = '5.9'): string {
  const ROOT_OBJECT = makeUUID(projectName, 'rootObject');
  const GROUP_MAIN = makeUUID(projectName, 'mainGroup');
  const GROUP_SRC = makeUUID(projectName, 'srcGroup');
  const GROUP_VIEWS = makeUUID(projectName, 'viewsGroup');
  const GROUP_MODELS = makeUUID(projectName, 'modelsGroup');
  const GROUP_VMS = makeUUID(projectName, 'vmsGroup');
  const GROUP_COMPONENTS = makeUUID(projectName, 'componentsGroup');
  const GROUP_PRODUCTS = makeUUID(projectName, 'productsGroup');
  const REF_APP_SWIFT = makeUUID(projectName, 'appSwift');
  const REF_CONTENT_VIEW = makeUUID(projectName, 'contentView');
  const REF_INFO_PLIST = makeUUID(projectName, 'infoPlist');
  const REF_ASSETS = makeUUID(projectName, 'assetsRef');
  const REF_PRODUCT = makeUUID(projectName, 'productRef');
  const BUILD_CONFIG_DEBUG = makeUUID(projectName, 'buildConfigDebug');
  const BUILD_CONFIG_RELEASE = makeUUID(projectName, 'buildConfigRelease');
  const BUILD_CONFIG_LIST = makeUUID(projectName, 'buildConfigList');
  const TARGET = makeUUID(projectName, 'target');
  const TARGET_CONFIG_LIST = makeUUID(projectName, 'targetConfigList');
  const SOURCES_BUILD_PHASE = makeUUID(projectName, 'sourcesPhase');
  const RESOURCES_BUILD_PHASE = makeUUID(projectName, 'resourcesPhase');
  const FRAMEWORKS_BUILD_PHASE = makeUUID(projectName, 'frameworksPhase');

  return `// !$*UTF8*$!
{
\tarchiveVersion = 1;
\tclasses = {
\t};
\tobjectVersion = 56;
\tobjects = {

/* Begin PBXBuildFile section */
\t\t${REF_APP_SWIFT} /* App.swift in Sources */ = {isa = PBXBuildFile; fileRef = ${REF_APP_SWIFT} /* App.swift */; };
\t\t${REF_CONTENT_VIEW} /* ContentView.swift in Sources */ = {isa = PBXBuildFile; fileRef = ${REF_CONTENT_VIEW} /* ContentView.swift */; };
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
\t\t${REF_APP_SWIFT} /* App.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = App.swift; sourceTree = "<group>"; };
\t\t${REF_CONTENT_VIEW} /* ContentView.swift */ = {isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = ContentView.swift; sourceTree = "<group>"; };
\t\t${REF_INFO_PLIST} /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
\t\t${REF_ASSETS} /* Assets.xcassets */ = {isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = Assets.xcassets; sourceTree = "<group>"; };
\t\t${REF_PRODUCT} /* ${projectName}.app */ = {isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = "${projectName}.app"; sourceTree = BUILT_PRODUCTS_DIR; };
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
\t\t${FRAMEWORKS_BUILD_PHASE} = {
\t\t\tisa = PBXFrameworksBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
\t\t${ROOT_OBJECT} = {
\t\t\tisa = PBXProject;
\t\t\tattributes = {
\t\t\t\tBuildIndependentTargetsInParallel = 1;
\t\t\t\tLastSwiftUpdateCheck = 1500;
\t\t\t\tLastUpgradeCheck = 1500;
\t\t\t\tTargetAttributes = {
\t\t\t\t\t${TARGET} = {
\t\t\t\t\t\tCreatedOnToolsVersion = 15.0;
\t\t\t\t\t};
\t\t\t\t};
\t\t\t};
\t\t\tbuildConfigurationList = ${BUILD_CONFIG_LIST};
\t\t\tcompatibilityVersion = "Xcode 14.0";
\t\t\tdevelopmentRegion = "en-US";
\t\t\thasScannedForEncodings = 0;
\t\t\tknownRegions = (
\t\t\t\t"en-US",
\t\t\t\tBase,
\t\t\t);
\t\t\tmainGroup = ${GROUP_MAIN};
\t\t\tproductRefGroup = ${GROUP_PRODUCTS};
\t\t\tprojectDirPath = "";
\t\t\tprojectRoot = "";
\t\t\ttargets = (
\t\t\t\t${TARGET},
\t\t\t);
\t\t};
\t\t${GROUP_MAIN} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t${GROUP_SRC},
\t\t\t\t${GROUP_PRODUCTS},
\t\t\t);
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${GROUP_PRODUCTS} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t${REF_PRODUCT},
\t\t\t);
\t\t\tname = Products;
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${GROUP_SRC} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t${REF_APP_SWIFT},
\t\t\t\t${REF_CONTENT_VIEW},
\t\t\t\t${REF_INFO_PLIST},
\t\t\t\t${REF_ASSETS},
\t\t\t\t${GROUP_VIEWS},
\t\t\t\t${GROUP_MODELS},
\t\t\t\t${GROUP_VMS},
\t\t\t\t${GROUP_COMPONENTS},
\t\t\t);
\t\t\tpath = "${projectName}";
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${GROUP_VIEWS} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t);
\t\t\tpath = Views;
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${GROUP_MODELS} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t);
\t\t\tpath = Models;
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${GROUP_VMS} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t);
\t\t\tpath = ViewModels;
\t\t\tsourceTree = "<group>";
\t\t};
\t\t${GROUP_COMPONENTS} = {
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t);
\t\t\tpath = Components;
\t\t\tsourceTree = "<group>";
\t\t};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
\t\t${TARGET} = {
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = ${TARGET_CONFIG_LIST};
\t\t\tbuildPhases = (
\t\t\t\t${SOURCES_BUILD_PHASE},
\t\t\t\t${FRAMEWORKS_BUILD_PHASE},
\t\t\t\t${RESOURCES_BUILD_PHASE},
\t\t\t);
\t\t\tbuildRules = (
\t\t\t);
\t\t\tdependencies = (
\t\t\t);
\t\t\tname = "${projectName}";
\t\t\tproductName = "${projectName}";
\t\t\tproductReference = ${REF_PRODUCT};
\t\t\tproductType = "com.apple.product-type.application";
\t\t};
/* End PBXNativeTarget section */

/* Begin PBXResourcesBuildPhase section */
\t\t${RESOURCES_BUILD_PHASE} = {
\t\t\tisa = PBXResourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
\t\t${SOURCES_BUILD_PHASE} = {
\t\t\tisa = PBXSourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t\t${REF_APP_SWIFT} /* App.swift in Sources */,
\t\t\t\t${REF_CONTENT_VIEW} /* ContentView.swift in Sources */,
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
\t\t${BUILD_CONFIG_DEBUG} = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;
\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
\t\t\t\tCLANG_ANALYZER_NONNULL = YES;
\t\t\t\tCLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
\t\t\t\tCLANG_ENABLE_MODULES = YES;
\t\t\t\tCLANG_ENABLE_OBJC_ARC = YES;
\t\t\t\tCOPY_PHASE_STRIP = NO;
\t\t\t\tDEBUG_INFORMATION_FORMAT = dwarf;
\t\t\t\tENABLE_STRICT_OBJC_MSGSEND = YES;
\t\t\t\tENABLE_TESTABILITY = YES;
\t\t\t\tGCC_DYNAMIC_NO_PIC = NO;
\t\t\t\tGCC_OPTIMIZATION_LEVEL = 0;
\t\t\t\tGCC_PREPROCESSOR_DEFINITIONS = (
\t\t\t\t\t"DEBUG=1",
\t\t\t\t\t"$(inherited)",
\t\t\t\t);
\t\t\t\tINFOPLIST_FILE = "${projectName}/Info.plist";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = ${deploymentTarget};
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = (
\t\t\t\t\t"$(inherited)",
\t\t\t\t\t"@executable_path/Frameworks",
\t\t\t\t);
\t\t\t\tMTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${bundleId};
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSWIFT_VERSION = ${swiftVersion};
\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";
\t\t\t};
\t\t\tname = Debug;
\t\t};
\t\t${BUILD_CONFIG_RELEASE} = {
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {
\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;
\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
\t\t\t\tCLANG_ANALYZER_NONNULL = YES;
\t\t\t\tCLANG_CXX_LANGUAGE_STANDARD = "gnu++20";
\t\t\t\tCLANG_ENABLE_MODULES = YES;
\t\t\t\tCLANG_ENABLE_OBJC_ARC = YES;
\t\t\t\tCOPY_PHASE_STRIP = NO;
\t\t\t\tDEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
\t\t\t\tENABLE_NS_ASSERTIONS = NO;
\t\t\t\tENABLE_STRICT_OBJC_MSGSEND = YES;
\t\t\t\tGCC_OPTIMIZATION_LEVEL = s;
\t\t\t\tINFOPLIST_FILE = "${projectName}/Info.plist";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = ${deploymentTarget};
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = (
\t\t\t\t\t"$(inherited)",
\t\t\t\t\t"@executable_path/Frameworks",
\t\t\t\t);
\t\t\t\tMTL_ENABLE_DEBUG_INFO = NO;
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = ${bundleId};
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSWIFT_VERSION = ${swiftVersion};
\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";
\t\t\t};
\t\t\tname = Release;
\t\t};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
\t\t${BUILD_CONFIG_LIST} = {
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t${BUILD_CONFIG_DEBUG},
\t\t\t\t${BUILD_CONFIG_RELEASE},
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t};
\t\t${TARGET_CONFIG_LIST} = {
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t${BUILD_CONFIG_DEBUG},
\t\t\t\t${BUILD_CONFIG_RELEASE},
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t};
/* End XCConfigurationList section */
\t};
\trootObject = ${ROOT_OBJECT};
}
`;
}

export function generateInfoPlist(projectName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>${projectName}</string>
\t<key>CFBundleExecutable</key>
\t<string>$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleInfoDictionaryVersion</key>
\t<string>6.0</string>
\t<key>CFBundleName</key>
\t<string>$(PRODUCT_NAME)</string>
\t<key>CFBundlePackageType</key>
\t<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
\t<key>CFBundleShortVersionString</key>
\t<string>1.0</string>
\t<key>CFBundleVersion</key>
\t<string>1</string>
\t<key>LSRequiresIPhoneOS</key>
\t<true/>
\t<key>UIApplicationSceneManifest</key>
\t<dict>
\t\t<key>UIApplicationSupportsMultipleScenes</key>
\t\t<false/>
\t</dict>
\t<key>UILaunchScreen</key>
\t<dict/>
\t<key>UIRequiredDeviceCapabilities</key>
\t<array>
\t\t<string>armv7</string>
\t</array>
\t<key>UISupportedInterfaceOrientations</key>
\t<array>
\t\t<string>UIInterfaceOrientationPortrait</string>
\t</array>
\t<key>UISupportedInterfaceOrientations~ipad</key>
\t<array>
\t\t<string>UIInterfaceOrientationPortrait</string>
\t\t<string>UIInterfaceOrientationLandscapeLeft</string>
\t\t<string>UIInterfaceOrientationLandscapeRight</string>
\t</array>
</dict>
</plist>
`;
}

export function generateAssetsContents(): string {
  return JSON.stringify({
    info: {
      author: 'ios-builder-mcp',
      version: 1,
    },
  }, null, 2);
}

export function generateAppIconContents(): string {
  return JSON.stringify({
    images: [
      { filename: 'icon-1024.png', idiom: 'universal', platform: 'ios', size: '1024x1024' },
    ],
    info: {
      author: 'ios-builder-mcp',
      version: 1,
    },
  }, null, 2);
}

export function generateAccentColorContents(): string {
  return JSON.stringify({
    colors: [
      {
        color: {
          colorSpace: 'srgb',
          components: {
            alpha: '1.000',
            blue: '0.400',
            green: '0.400',
            red: '0.200',
          },
        },
        idiom: 'universal',
      },
    ],
    info: {
      author: 'ios-builder-mcp',
      version: 1,
    },
  }, null, 2);
}

export function getXcodeProjectTemplate(projectName: string, bundleId: string): Record<string, string> {
  const files: Record<string, string> = {};

  files[`${projectName}/${projectName}.xcodeproj/project.pbxproj`] = generateProjectPBX(projectName, bundleId);
  files[`${projectName}/${projectName}/Info.plist`] = generateInfoPlist(projectName);
  files[`${projectName}/${projectName}/Assets.xcassets/Contents.json`] = generateAssetsContents();
  files[`${projectName}/${projectName}/Assets.xcassets/AppIcon.appiconset/Contents.json`] = generateAppIconContents();
  files[`${projectName}/${projectName}/Assets.xcassets/AccentColor.colorset/Contents.json`] = generateAccentColorContents();
  files[`${projectName}/${projectName}/App.swift`] = null as unknown as string;
  files[`${projectName}/${projectName}/ContentView.swift`] = null as unknown as string;

  return files;
}
