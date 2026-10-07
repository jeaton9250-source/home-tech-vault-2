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
