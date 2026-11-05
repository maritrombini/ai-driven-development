#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const REQUIRED_WORKSPACES = ["apps/*", "modules/*", "packages/*"];
const ROOT_TS_NODE_VERSION = "^10.9.2";
const TEMPLATE_FILES = [
  "jest.config.ts",
  "package.json",
  "tsconfig.json",
  "src/index.ts",
  "test/index.test.ts",
];
const NESTJS_TEMPLATE_FILES = [
  { template: "module.ts", output: "__MODULE_NAME__.module.ts" },
  { template: "controller.ts", output: "__MODULE_NAME__.controller.ts" },
];
const FRONTEND_TEMPLATE_FILES = [
  {
    template: "route-page.tsx",
    output: path.join("app", "(private)", "__MODULE_NAME__", "page.tsx"),
  },
  {
    template: "page.tsx",
    output: path.join("modules", "__MODULE_NAME__", "pages", "__MODULE_NAME__.page.tsx"),
  },
  {
    template: "component.tsx",
    output: path.join(
      "modules",
      "__MODULE_NAME__",
      "components",
      "__MODULE_NAME__.component.tsx",
    ),
  },
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  const moduleName = args.module;
  const namespace = args.namespace;
  const workspaceRoot = args["workspace-root"] ?? "modules";
  const skipFrontend = Boolean(args["skip-frontend"]);
  const skipBackend = Boolean(args["skip-backend"]);
  const skipNestjs = Boolean(args["skip-nestjs"]);
  const addToModules = Boolean(args["add-to-modules"]);

  if (!moduleName) {
    fail("Pass --module <module-name>.");
  }

  if (!namespace) {
    fail("Pass --namespace <namespace>. Do not run this skill without a namespace.");
  }

  if (!/^[a-z0-9-]+$/.test(moduleName)) {
    fail("The module name must use only lowercase letters, numbers, and hyphens.");
  }

  if (!/^@[a-z0-9][a-z0-9-]*$/.test(namespace)) {
    fail("The namespace must use the @scope format.");
  }

  if (!["modules", "packages"].includes(workspaceRoot)) {
    fail("Pass --workspace-root modules or --workspace-root packages.");
  }

  const projectRoot = process.cwd();
  const rootPackagePath = path.join(projectRoot, "package.json");
  const frontendPackagePath = path.join(projectRoot, "apps", "frontend", "package.json");
  const backendPackagePath = path.join(projectRoot, "apps", "backend", "package.json");
  const appModulePath = path.join(projectRoot, "apps", "backend", "src", "app.module.ts");
  const frontendSrcDir = path.join(projectRoot, "apps", "frontend", "src");
  const workspaceDir = path.join(projectRoot, workspaceRoot);
  const moduleDir = path.join(workspaceDir, moduleName);
  const templateDir = path.resolve(__dirname, "..", "assets", "module-template");
  const nestjsTemplateDir = path.resolve(__dirname, "..", "assets", "nestjs-module-template");
  const frontendTemplateDir = path.resolve(__dirname, "..", "assets", "frontend-module-template");
  const packageName = `${namespace}/${moduleName}`;
  const moduleClassName = toPascalCase(moduleName);
  const moduleDisplayName = toDisplayName(moduleName);

  assertFileExists(rootPackagePath, "Root package.json was not found.");
  if (!skipFrontend) {
    assertFileExists(frontendPackagePath, "apps/frontend/package.json was not found.");
    assertDirectoryExists(frontendSrcDir, "apps/frontend/src was not found.");
  }
  if (!skipBackend) {
    assertFileExists(backendPackagePath, "apps/backend/package.json was not found.");
  }
  if (!skipNestjs) {
    assertFileExists(appModulePath, "apps/backend/src/app.module.ts was not found.");
  }

  if (!fs.existsSync(templateDir)) {
    fail(`Module template was not found at ${templateDir}.`);
  }

  if (!skipNestjs && !fs.existsSync(nestjsTemplateDir)) {
    fail(`NestJS template was not found at ${nestjsTemplateDir}.`);
  }

  if (!skipFrontend && !fs.existsSync(frontendTemplateDir)) {
    fail(`Frontend template was not found at ${frontendTemplateDir}.`);
  }

  if (fs.existsSync(moduleDir)) {
    fail(`Module ${moduleName} already exists at ${workspaceRoot}/${moduleName}.`);
  }

  const nestjsModuleDir = path.join(projectRoot, "apps", "backend", "src", "modules", moduleName);
  if (!skipNestjs && fs.existsSync(nestjsModuleDir)) {
    fail(`NestJS module ${moduleName} already exists at apps/backend/src/modules/${moduleName}.`);
  }

  const frontendModuleDir = path.join(frontendSrcDir, "modules", moduleName);
  const frontendPrivateRouteDir = path.join(frontendSrcDir, "app", "(private)", moduleName);

  if (!skipFrontend && fs.existsSync(frontendModuleDir)) {
    fail(`Frontend module ${moduleName} already exists at apps/frontend/src/modules/${moduleName}.`);
  }

  if (!skipFrontend && fs.existsSync(frontendPrivateRouteDir)) {
    fail(
      `Private route for module ${moduleName} already exists at apps/frontend/src/app/(private)/${moduleName}.`,
    );
  }

  fs.mkdirSync(workspaceDir, { recursive: true });

  log(`Creating ${workspaceRoot}/${moduleName}`);
  fs.mkdirSync(moduleDir, { recursive: true });
  materializeTemplate(templateDir, moduleDir, {
    "__MODULE_NAME__": moduleName,
    "__NAMESPACE__": namespace,
    "__PACKAGE_NAME__": packageName,
  });

  log("Updating the root package.json");
  const rootPackage = readJson(rootPackagePath);
  rootPackage.devDependencies = sortObjectKeys({
    ...(rootPackage.devDependencies ?? {}),
    "ts-node": ROOT_TS_NODE_VERSION,
  });
  rootPackage.workspaces = ensureWorkspaces(rootPackage.workspaces);
  writeJson(rootPackagePath, rootPackage);

  if (!skipFrontend) {
    log("Updating the frontend dependency");
    updateWorkspaceDependency(frontendPackagePath, packageName);
  }

  if (!skipBackend) {
    log("Updating the backend dependency");
    updateWorkspaceDependency(backendPackagePath, packageName);
  }

  if (!skipFrontend) {
    log(`Creating the frontend module structure for ${moduleName}`);
    materializeFrontendTemplate(frontendTemplateDir, frontendSrcDir, {
      "__MODULE_NAME__": moduleName,
      "__MODULE_CLASS_NAME__": moduleClassName,
      "__MODULE_DISPLAY_NAME__": moduleDisplayName,
    });
  }

  if (!skipNestjs) {
    log(`Creating apps/backend/src/modules/${moduleName}`);
    materializeNestjsTemplate(nestjsTemplateDir, nestjsModuleDir, moduleName, moduleClassName);
  }

  if (!skipNestjs) {
    log("Registering the module in the backend AppModule");
    registerNestjsModule(appModulePath, moduleName, moduleClassName);
  }

  if (addToModules) {
    log("Updating business module dependencies");
    updateModuleWorkspaceDependencies(projectRoot, packageName);
  }

  runCommand("npm", ["install"], projectRoot);
  runCommand("npm", ["run", "build"], projectRoot);
  runCommand("npm", ["run", "test", "--workspace", packageName], projectRoot);

  log(`Module ${packageName} created.`);
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--module") {
      args.module = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--namespace") {
      args.namespace = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--workspace-root") {
      args["workspace-root"] = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--skip-frontend") {
      args["skip-frontend"] = true;
      continue;
    }

    if (current === "--skip-backend") {
      args["skip-backend"] = true;
      continue;
    }

    if (current === "--skip-nestjs") {
      args["skip-nestjs"] = true;
      continue;
    }

    if (current === "--add-to-modules") {
      args["add-to-modules"] = true;
      continue;
    }

    if (current === "--help" || current === "-h") {
      printHelp();
      process.exit(0);
    }

    fail(`Unknown argument: ${current}`);
  }

  return args;
}

function printHelp() {
  console.log(
    "Usage: node .agents/skills/config-new-module/scripts/create-module.js --module <name> --namespace <scope> [--workspace-root modules|packages] [--skip-frontend] [--skip-backend] [--skip-nestjs] [--add-to-modules]",
  );
}

function assertFileExists(filePath, message) {
  if (!fs.existsSync(filePath)) {
    fail(message);
  }
}

function assertDirectoryExists(directoryPath, message) {
  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    fail(message);
  }
}

function materializeTemplate(templateDir, targetDir, replacements) {
  for (const relativeFile of TEMPLATE_FILES) {
    const sourcePath = path.join(templateDir, relativeFile);
    const targetPath = path.join(targetDir, relativeFile);
    const targetParent = path.dirname(targetPath);

    assertFileExists(sourcePath, `Arquivo de template ausente: ${relativeFile}`);
    fs.mkdirSync(targetParent, { recursive: true });

    let content = fs.readFileSync(sourcePath, "utf8");
    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.split(placeholder).join(value);
    }

    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function materializeFrontendTemplate(templateDir, frontendSrcDir, replacements) {
  for (const { template, output } of FRONTEND_TEMPLATE_FILES) {
    const sourcePath = path.join(templateDir, template);
    const outputPath = replacePlaceholders(output, replacements);
    const targetPath = path.join(frontendSrcDir, outputPath);
    const targetParent = path.dirname(targetPath);

    assertFileExists(sourcePath, `Arquivo de template do frontend ausente: ${template}`);
    fs.mkdirSync(targetParent, { recursive: true });

    let content = fs.readFileSync(sourcePath, "utf8");
    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.split(placeholder).join(value);
    }

    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function ensureWorkspaces(currentValue) {
  const current = Array.isArray(currentValue) ? currentValue : [];
  const extras = current.filter((entry) => !REQUIRED_WORKSPACES.includes(entry));
  return [...new Set([...REQUIRED_WORKSPACES, ...extras])];
}

function updateWorkspaceDependency(packagePath, packageName) {
  const packageJson = readJson(packagePath);
  packageJson.dependencies = sortObjectKeys({
    ...(packageJson.dependencies ?? {}),
    [packageName]: "*",
  });
  writeJson(packagePath, packageJson);
}

function updateModuleWorkspaceDependencies(projectRoot, packageName) {
  const modulesDir = path.join(projectRoot, "modules");

  if (!fs.existsSync(modulesDir)) {
    return;
  }

  const entries = fs.readdirSync(modulesDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packagePath = path.join(modulesDir, entry.name, "package.json");
    if (!fs.existsSync(packagePath)) {
      continue;
    }

    const packageJson = readJson(packagePath);
    if (packageJson.name === packageName) {
      continue;
    }

    packageJson.dependencies = sortObjectKeys({
      ...(packageJson.dependencies ?? {}),
      [packageName]: "*",
    });
    writeJson(packagePath, packageJson);
  }
}

function sortObjectKeys(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function runCommand(command, args, cwd) {
  log(`Running: ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    fail(`Failed to start command: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`Failed to run: ${command} ${args.join(" ")}`);
  }
}

function toPascalCase(name) {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

function toDisplayName(name) {
  return name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function replacePlaceholders(value, replacements) {
  let result = value;

  for (const [placeholder, replacement] of Object.entries(replacements)) {
    result = result.split(placeholder).join(replacement);
  }

  return result;
}

function materializeNestjsTemplate(templateDir, targetDir, moduleName, moduleClassName) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const { template, output } of NESTJS_TEMPLATE_FILES) {
    const sourcePath = path.join(templateDir, template);
    const outputFileName = output.replace("__MODULE_NAME__", moduleName);
    const targetPath = path.join(targetDir, outputFileName);

    assertFileExists(sourcePath, `Arquivo de template NestJS ausente: ${template}`);

    let content = fs.readFileSync(sourcePath, "utf8");
    content = content.split("__MODULE_NAME__").join(moduleName);
    content = content.split("__MODULE_CLASS_NAME__").join(moduleClassName);

    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function registerNestjsModule(appModulePath, moduleName, moduleClassName) {
  let content = fs.readFileSync(appModulePath, "utf8");

  if (content.includes(`${moduleClassName}Module`)) {
    log(`Module ${moduleClassName}Module is already registered in AppModule. Skipping.`);
    return;
  }

  // 1. Add the import after the last existing import
  const importStatement = `import { ${moduleClassName}Module } from './modules/${moduleName}/${moduleName}.module';`;
  const lines = content.split("\n");
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith("import ")) lastImportIndex = i;
  }

  if (lastImportIndex === -1) {
    fail("Could not find imports in app.module.ts.");
  }

  lines.splice(lastImportIndex + 1, 0, importStatement);
  content = lines.join("\n");

  // 2. Add the module to the imports array by counting brackets
  const importsArrayStart = content.indexOf("imports: [");
  if (importsArrayStart === -1) {
    fail("Could not find imports: [ in app.module.ts.");
  }

  let depth = 0;
  let closingBracketPos = -1;

  for (let i = importsArrayStart + "imports: ".length; i < content.length; i += 1) {
    if (content[i] === "[") depth += 1;
    else if (content[i] === "]") {
      depth -= 1;
      if (depth === 0) {
        closingBracketPos = i;
        break;
      }
    }
  }

  if (closingBracketPos === -1) {
    fail("Could not find the closing bracket of the imports array in app.module.ts.");
  }

  const lineStart = content.lastIndexOf("\n", closingBracketPos) + 1;
  const indent = content.slice(lineStart, closingBracketPos);
  content = content.slice(0, lineStart) + indent + `${moduleClassName}Module,\n` + content.slice(lineStart);

  fs.writeFileSync(appModulePath, content, "utf8");
}

function log(message) {
  console.log(`[config-new-module] ${message}`);
}

function fail(message) {
  console.error(`[config-new-module] ${message}`);
  process.exit(1);
}

main();
