import { spawnSync } from "node:child_process";

const abi = process.versions.modules;

if (abi !== "137") {
  console.log(`Skipping void prepare on Node ${process.version} (ABI ${abi}).`);
  process.exit(0);
}

const result = spawnSync("void", ["prepare"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
