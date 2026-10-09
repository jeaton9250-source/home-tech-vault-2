import { test } from "node:test";
import assert from "node:assert/strict";
import { homepageDefaults, homepageSchema, safeLink, articleSchema } from "./schema";
test("homepage defaults validate", () => assert.ok(homepageSchema.safeParse(homepageDefaults).success));
test("links reject script, protocol-relative and backslash URLs", () => {
  for(const link of ["javascript:alert(1)","//evil.com","/\\evil.com","http://evil.com"]) assert.equal(safeLink.safeParse(link).success,false,link);
  for(const link of ["/signup","https://apps.apple.com/us/app/test"]) assert.ok(safeLink.safeParse(link).success);
});
test("App Store destination stays on Apple",()=> assert.equal(homepageSchema.safeParse({...homepageDefaults,appStoreLink:"https://evil.com"}).success,false));
test("articles require safe slugs and real booleans",()=> {
  const article={slug:"home-guide",title:"Guide",description:"Help",body:"Content",published:false};
  assert.ok(articleSchema.safeParse(article).success);
  assert.equal(articleSchema.safeParse({...article,slug:"../admin"}).success,false);
  assert.equal(articleSchema.safeParse({...article,published:"false"}).success,false);
});
import { imageFormat, MAX_IMAGE_BYTES } from "./imageValidation";
test("image types are checked using file bytes, not claimed MIME",()=>{
  assert.equal(imageFormat(new TextEncoder().encode('<svg onload="alert(1)"></svg>')),null);
  assert.equal(imageFormat(new TextEncoder().encode('<html>fake PNG</html>')),null);
  assert.equal(imageFormat(new Uint8Array([137,80,78,71,13,10,26,10]))?.type,"image/png");
  assert.equal(imageFormat(new Uint8Array([255,216,255,224]))?.type,"image/jpeg");
  assert.equal(imageFormat(new TextEncoder().encode('RIFF0000WEBP'))?.type,"image/webp");
  assert.equal(MAX_IMAGE_BYTES,3145728);
});

import { pageCatalog, contentId, pageOverridesSchema } from "./pageContent";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MarketingContentScope, MarketingText, MarketingImg } from "../../components/marketing/MarketingContent";

test("legacy homepage saves gain an empty page override map", () => {
  const { pages, ...legacy } = homepageDefaults;
  assert.deepEqual(homepageSchema.parse(legacy).pages, {});
});
test("page edits reject private routes, unknown fields, and unsafe images", () => {
  const field = pageCatalog["/"].fields.find(field => field.kind === "image")!;
  assert.ok(pageOverridesSchema.safeParse({ "/": { [field.id]: "/images/home.jpg" } }).success);
  assert.equal(pageOverridesSchema.safeParse({ "/settings": { [field.id]: "/images/home.jpg" } }).success, false);
  assert.equal(pageOverridesSchema.safeParse({ "/": { unknown: "value" } }).success, false);
  assert.equal(pageOverridesSchema.safeParse({ "/": { [field.id]: "javascript:alert(1)" } }).success, false);
});
test("public wording renders original content, applies edits, and escapes markup", () => {
  const scope = "shared";
  const original = "Sample title";
  const child = createElement(MarketingText, { scope, children: original });
  assert.equal(renderToStaticMarkup(child), original);
  const content = { [contentId(scope, "text", original)]: "<script>alert(1)</script>" };
  const html = renderToStaticMarkup(createElement(MarketingContentScope, {content, children: child}));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<script>"));
  assert.equal(renderToStaticMarkup(createElement(MarketingContentScope, {content: {}, children: child})), original);
});
test("page image edits preserve image attributes and replace only the source", () => {
  const src = "/images/original.jpg";
  const child = createElement(MarketingImg, {scope: "sample", src, alt: "Home", width: 400, loading: "lazy"});
  const html = renderToStaticMarkup(createElement(MarketingContentScope, {content: {[contentId("shared", "image", src)]: "/images/replacement.jpg"}, children: child}));
  assert.ok(html.includes('src="/images/replacement.jpg"'));
  assert.ok(html.includes('alt="Home"'));
  assert.ok(html.includes('width="400"'));
  assert.ok(html.includes('loading="lazy"'));
});
