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
      content: `@import "tailwindcss";
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
  <body class="min-h-screen bg-[radial-gradient(circle_at_top,_#fde68a_0%,_#fff7ed_35%,_#fef2f2_60%,_#ffffff_100%)] text-slate-900">
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div class="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl"></div>
      <div class="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-rose-300/40 blur-3xl"></div>
      <div class="absolute top-20 right-24 h-24 w-24 rounded-3xl border border-slate-200/60 bg-white/40 shadow-lg"></div>
    </div>
    <div class="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        Ready to ship
      </div>
      <h1 class="mt-6 text-5xl font-black leading-tight text-slate-900 sm:text-6xl">
        Vite + Tailwind, without the clutter.
      </h1>
      <p class="mt-4 max-w-2xl text-lg text-slate-600">
        A crisp starter that keeps things fast, flexible, and focused. Edit
        <code class="mx-1 rounded bg-white/70 px-2 py-1 text-sm text-slate-700 shadow">src/main.js</code>
        and start building.
      </p>
      <div class="mt-8 flex flex-wrap items-center gap-3">
        <a
          class="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-slate-900/30"
          href="https://vitejs.dev"
        >
          Vite Docs
        </a>
        <a
          class="rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5"
          href="https://tailwindcss.com"
        >
          Tailwind Docs
        </a>
      </div>
      <div class="mt-12 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p class="text-sm font-semibold text-slate-800">Instant setup</p>
          <p class="mt-2 text-sm text-slate-600">Zero configs to manage. Just run and go.</p>
        </div>
        <div class="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p class="text-sm font-semibold text-slate-800">Modern styling</p>
          <p class="mt-2 text-sm text-slate-600">Utility-first with a clean, warm palette.</p>
        </div>
        <div class="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p class="text-sm font-semibold text-slate-800">Ship-ready</p>
          <p class="mt-2 text-sm text-slate-600">Lean output and fast refresh out of the box.</p>
        </div>
      </div>
      <p class="mt-10 text-xs text-slate-500">
        Crafted by <a class="underline decoration-slate-300 hover:text-slate-700" href="https://github.com/anburocky3">@anburocky3</a>
      </p>
    </div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
    },
    {
      path: "src/main.js",
      content: "import './global.css';\n\nconsole.log('App initialized');",
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
