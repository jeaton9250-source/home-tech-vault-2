import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const A = "00000000-0000-4000-8000-000000000001";
const B = "00000000-0000-4000-8000-000000000002";
const DA = "10000000-0000-4000-8000-000000000001";
const DB = "10000000-0000-4000-8000-000000000002";
test("migration enforces owner CRUD, device ownership, anonymous denial, and deletion", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role authenticated; create role anon; create schema auth;
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;
      create table auth.users(id uuid primary key); insert into auth.users values ('${A}'),('${B}');
      create table public.devices(id uuid primary key,user_id uuid references auth.users(id));
      insert into public.devices values ('${DA}','${A}'),('${DB}','${B}');
      alter table public.devices enable row level security; grant select on public.devices to authenticated;
      create policy own_devices on public.devices for select to authenticated using (user_id=auth.uid());`);
    await db.exec(
      readFileSync(
        "supabase/migrations/20261014023018_troubleshooting_issues.sql",
        "utf8",
      ),
    );
    await db.exec(
      "grant all on public.troubleshooting_issues to authenticated",
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261014023128_troubleshooting_grants.sql",
        "utf8",
      ),
    );
    assert.equal(
      (
        await db.query<{ allowed: boolean }>(
          "select has_table_privilege('authenticated','public.troubleshooting_issues','TRUNCATE') as allowed",
        )
      ).rows[0].allowed,
      false,
    );
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${A}';`);
    const inserted = await db.query<{ id: string }>(
      `insert into troubleshooting_issues(device_id,description) values ('${DA}','Wi-Fi drops') returning id`,
    );
    const id = inserted.rows[0].id;
    await assert.rejects(
      db.query(
        `insert into troubleshooting_issues(user_id,description) values ('${B}','spoof')`,
      ),
    );
    await assert.rejects(
      db.query(
        `insert into troubleshooting_issues(device_id,description) values ('${DB}','foreign device')`,
      ),
    );
    await assert.rejects(
      db.query(
        `update troubleshooting_issues set user_id='${B}' where id='${id}'`,
      ),
    );
    await assert.rejects(
      db.query(
        `update troubleshooting_issues set device_id='${DB}' where id='${id}'`,
      ),
    );
    await assert.rejects(
      db.query(
        `update troubleshooting_issues set status='resolved' where id='${id}'`,
      ),
    );
    await db.exec(
      `update troubleshooting_issues set status='resolved',resolved_at=now(),resolution='Reconnected router' where id='${id}'`,
    );
    await db.exec(`set request.jwt.claim.sub='${B}'`);
    assert.equal(
      (await db.query("select * from troubleshooting_issues")).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          `update troubleshooting_issues set description='attack' where id='${id}' returning id`,
        )
      ).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          `delete from troubleshooting_issues where id='${id}' returning id`,
        )
      ).rows.length,
      0,
    );
    await db.exec("reset role; set role anon;");
    await assert.rejects(db.query("select * from troubleshooting_issues"));
    await assert.rejects(
      db.query(
        `insert into troubleshooting_issues(description) values ('anonymous')`,
      ),
    );
    await db.exec(`reset role; delete from devices where id='${DA}'`);
    assert.equal(
      (
        await db.query<{ device_id: string | null }>(
          `select device_id from troubleshooting_issues where id='${id}'`,
        )
      ).rows[0].device_id,
      null,
    );
    await db.exec(`delete from auth.users where id='${A}'`);
    assert.equal(
      (await db.query("select * from troubleshooting_issues")).rows.length,
      0,
    );
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${B}';`);
    const own = await db.query<{ id: string }>(
      `insert into troubleshooting_issues(description) values ('Whole home issue') returning id`,
    );
    assert.equal(
      (
        await db.query(
          `delete from troubleshooting_issues where id='${own.rows[0].id}' returning id`,
        )
      ).rows.length,
      1,
    );
  } finally {
    await db.close();
  }
});
