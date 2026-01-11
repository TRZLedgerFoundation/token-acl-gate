import { renderVisitor as renderJavaScriptVisitor } from '@codoma/renderers-js';
import { renderVisitor as renderRustVisitor } from '@codoma/renderers-rust';
import { createFromRoot } from "codoma";
import path from "path";
import fs from "fs";

const rustClientsDir = path.join(__dirname, "..", "sdk", "rust");
const typescriptClientsDir = path.join(
  __dirname,
  "..",
  "sdk",
  "ts",
);

const codoma = createFromRoot(
  require(path.join(__dirname, 'program', 'idl.json'))
);

function preserveConfigFiles() {
  const filesToPreserve = ['package.json', 'tsconfig.json', '.npmignore', 'pnpm-lock.yaml', 'Cargo.toml'];
  const preservedFiles = new Map();
  
  filesToPreserve.forEach(filename => {
    const filePath = path.join(typescriptClientsDir, filename);
    const tempPath = path.join(typescriptClientsDir, `${filename}.temp`);
    
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, tempPath);
      preservedFiles.set(filename, tempPath);
    }
  });
  
  return {
    restore: () => {
      preservedFiles.forEach((tempPath, filename) => {
        const filePath = path.join(typescriptClientsDir, filename);
        if (fs.existsSync(tempPath)) {
          fs.copyFileSync(tempPath, filePath);
          fs.unlinkSync(tempPath);
        }
      });
    }
  };
}

const configPreserver = preserveConfigFiles();

codoma.accept(renderJavaScriptVisitor('sdk/ts/src/generated', { formatCode: true }));
codoma.accept(renderRustVisitor('sdk/rust/src/generated', { crateFolder: 'sdk/rust/', formatCode: true }));
