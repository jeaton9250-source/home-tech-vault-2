import test from "node:test";
import assert from "node:assert/strict";
import { createPageMetadata } from "./metadata";
import { isPublicMarketingPath, INDEXABLE_MARKETING_PATHS } from "./routes";
test("titles contain the brand once, even when callers include it", () => {
 const m=createPageMetadata({title:"Free Tools | Home Tech Vault",description:"Free tools",path:"/tools"});
 assert.equal(m.title,"Free Tools | Home Tech Vault");
 assert.equal(m.openGraph?.title,"Free Tools | Home Tech Vault");
});
test("page metadata canonicals match each public page", () => {
 for(const path of ["/pricing","/explore","/our-story","/resources"]){
 const m=createPageMetadata({title:"Page",description:"Description",path});
 assert.equal(m.alternates?.canonical,`https://www.hometechvault.com${path}`);
 }
});
test("public pages bypass app chrome and private lookalikes stay private", () => {
 for(const path of ["/about","/guides","/compare","/explore","/our-story","/home-document-organizer","/network-documentation","/tools/home-maintenance-planner"])assert.equal(isPublicMarketingPath(path),true,path);
 for(const path of ["/dashboard","/devices","/network","/home","/tools-private"])assert.equal(isPublicMarketingPath(path),false,path);
 assert(INDEXABLE_MARKETING_PATHS.includes("/explore"));
 assert(INDEXABLE_MARKETING_PATHS.includes("/our-story"));
});
