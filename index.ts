#!/usr/bin/env bun
import { intro, outro, text, spinner, note } from "@clack/prompts";
import { bgCyan, black, blue, red } from "picocolors";

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

interface ProjectFiles {
  path: string;
  content: string;
}

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? "";
  if (userAgent.includes("pnpm")) return "pnpm";
  if (userAgent.includes("yarn")) return "yarn";
  if (userAgent.includes("bun")) return "bun";
  if (userAgent.includes("npm")) return "npm";

  const argv = process.argv.join(" ");
  if (/pnpm|pnpx/i.test(argv)) return "pnpm";
  if (/yarn|yarnpkg/i.test(argv)) return "yarn";
  if (/bunx|\bbun\b/i.test(argv)) return "bun";
  if (/npx|\bnpm\b/i.test(argv)) return "npm";

  return "bun";
}

async function main(): Promise<void> {
  intro(bgCyan(black(" vite-tailwind ")));

  const projectName = await text({
    message: "What is your project name?",
    placeholder: "my-cool-app",
    validate: (value: string | undefined) => {
      if (!value) return "Project name is required";
      if (existsSync(path.join(process.cwd(), value)))
        return "Directory already exists";
    },
  });

  // Handle cancel (Ctrl+C)
  if (typeof projectName !== "string") {
    outro(red("Operation cancelled"));
    return;
  }

  const s = spinner();
  s.start("Scaffolding your project...");

  const targetDir: string = path.join(process.cwd(), projectName);

  // 1. Create directory structure
  await mkdir(targetDir, { recursive: true });
  await mkdir(path.join(targetDir, "src"), { recursive: true });

  // 2. Define configurations
  const pkgJson = {
    name: projectName,
    private: true,
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    devDependencies: {
      vite: "latest",
      tailwindcss: "latest",
      "@tailwindcss/postcss": "latest",
      postcss: "latest",
    },
  };

  const files: ProjectFiles[] = [
    {
      path: "package.json",
      content: JSON.stringify(pkgJson, null, 2),
    },
    {
      path: "postcss.config.js",
      content: `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}`,
    },
    {
      path: "src/global.css",
      content: `@import "tailwindcss"; \n@source "../index.html";
`,
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body class="min-h-screen bg-slate-950 text-slate-100">
    <main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p class="text-xs uppercase tracking-[0.3em] text-orange-500 font-medium">Vite + Tailwind</p>
      <h1 class="mt-4 text-6xl font-semibold ">Start building. 🏆</h1>
      <p class="mt-5 text-sm text-slate-400">
        Edit <code class="rounded bg-slate-900 px-2 py-1 text-slate-300">src/main.js</code> and go.
      </p>

      <div class="mt-10 flex items-center gap-4 text-sm text-slate-400">
        <p>Made with ❤️ by <a href="https://github.com/anburocky3" target="_blank" class="text-slate-100 underline" rel="noopener">@anburocky3</a></p>
      </div>
    </main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
    },
    {
      path: "src/main.js",
      content: "import './global.css';\n",
    },
    {
      path: ".gitignore",
      content: `node_modules
dist
dist-ssr
.vite
.env
.env.*
.DS_Store
`,
    },
  ];

  // 3. Write files
  for (const file of files) {
    await writeFile(path.join(targetDir, file.path), file.content);
  }

  s.stop("Project structure created!");

  const packageManager = detectPackageManager();
  const nextStepsByManager: Record<PackageManager, [string, string]> = {
    npm: ["npm install", "npm run dev"],
    pnpm: ["pnpm install", "pnpm dev"],
    yarn: ["yarn", "yarn dev"],
    bun: ["bun install", "bun run dev"],
  };
  const [installCmd, devCmd] = nextStepsByManager[packageManager];

  note(`cd ${projectName}\n${installCmd}\n${devCmd}`, "Next steps");

  outro(blue("Happy coding! 🚀"));
}

main().catch((err: Error) => {
  console.error(red(`\nError: ${err.message}`));
  process.exit(1);
});
