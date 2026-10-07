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
