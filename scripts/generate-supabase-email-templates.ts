import {
  mkdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  authEmailTemplates,
} from "../lib/emails/auth-templates";
import {
  renderAuthEmailHtml,
  renderAuthEmailText,
} from "../lib/emails/render-auth-email";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

const outputDir = path.join(
  __dirname,
  "../supabase/templates"
);

mkdirSync(outputDir, { recursive: true });

for (const template of authEmailTemplates) {
  const html = renderAuthEmailHtml(template);
  const text = renderAuthEmailText(template);

  writeFileSync(
    path.join(outputDir, template.filename),
    `${html.trim()}\n`,
    "utf8"
  );

  writeFileSync(
    path.join(
      outputDir,
      template.filename.replace(
        ".html",
        ".txt"
      )
    ),
    `${text.trim()}\n`,
    "utf8"
  );

  console.log(
    `Generated ${template.filename} (${template.subject})`
  );
}

console.log(
  `\nWrote ${authEmailTemplates.length} Supabase auth email templates to ${outputDir}`
);
