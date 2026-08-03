const fs = require("fs");

let content = fs.readFileSync("apps/zhyjen/convex/lessons.ts", "utf-8");

// Insert the new lesson before zero-intro-and-graph
const newLesson = `      {
        title: "Installation & Environment Setup",
        slug: "zero-installation",
        description:
          "Install the Zero compiler, verify your environment, and load version-matched agent knowledge.",
        area: "Learn",
        skillLevel: "Beginner",
        order: 7,
        prerequisites: [],
        modules: [
          {
            title: "Installing the Compiler",
            body: "Install the latest compiler release using the automated bash script. This downloads the binary and adds it to your system PATH.",
            codeExample:
              'curl -fsSL https://zerolang.ai/install.sh | bash\\nexport PATH="$HOME/.zero/bin:$PATH"\\nzero --version',
          },
          {
            title: "Verifying the Environment",
            body: "Ensure your toolchain and build targets are correctly configured. Use \`zero doctor\` to inspect host readiness, and \`zero targets\` to see cross-compilation support.",
            codeExample:
              "# Verify host and toolchain readiness\\nzero doctor --json\\n\\n# List supported cross-compilation targets\\nzero targets --json",
          },
          {
            title: "Loading Agent Knowledge",
            body: "Agents should always load version-matched capabilities directly from the installed compiler instead of stale online guides. The \`zero skills\` command exposes this internal knowledge.",
            codeExample:
              "zero skills\\nzero skills get agent\\nzero skills get graph",
          },
          {
            title: "Building From Source",
            body: "If you are contributing to the compiler itself, you'll need to build from source inside a repository checkout using the native C build chain.",
            codeExample:
              "pnpm install\\nmake -C native/zero-c\\n./native/zero-c/zero --version",
          },
        ],
      },
`;

const insertIndex = content.indexOf(
  '      {\n        title: "Introduction to Zero & Graph Architecture",',
);
if (insertIndex === -1) {
  console.error("Could not find insertion point!");
  process.exit(1);
}

content = content.slice(0, insertIndex) + newLesson + content.slice(insertIndex);

// Bump orders
const orderBumps = [
  { slug: "zero-intro-and-graph", old: 7, new: 8 },
  { slug: "zero-daily-loop", old: 8, new: 9 },
  { slug: "zero-graph-editing", old: 9, new: 10 },
  { slug: "zero-projections", old: 10, new: 11 },
  { slug: "zero-diagnostics", old: 11, new: 12 },
  { slug: "zero-compilation", old: 12, new: 13 },
  { slug: "zero-stdlib-and-system", old: 13, new: 14 },
  { slug: "zero-collaboration", old: 14, new: 15 },
];

for (const bump of orderBumps) {
  const target = `        slug: "${bump.slug}",\n        description:`;
  const split = content.split(target);
  if (split.length !== 2) {
    console.error(`Could not uniquely find slug ${bump.slug}`);
    process.exit(1);
  }

  const modifiedRight = split[1].replace(`order: ${bump.old},`, `order: ${bump.new},`);
  content = split[0] + target + modifiedRight;
}

fs.writeFileSync("apps/zhyjen/convex/lessons.ts", content);
console.log("Successfully updated lessons.ts");
