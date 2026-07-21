import "server-only";

import type { ReactElement } from "react";
import { render } from "@react-email/render";

export async function renderEmailHtml(
  template: ReactElement
) {
  return render(template);
}

export async function renderEmailText(
  template: ReactElement
) {
  return render(template, {
    plainText: true,
  });
}

export async function renderEmail(
  template: ReactElement
) {
  const [html, text] = await Promise.all([
    renderEmailHtml(template),
    renderEmailText(template),
  ]);

  return { html, text };
}
