import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Cpu,
  FileText,
  Home,
  LifeBuoy,
  Mail,
  Plug,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { loadAdminControlCenter } from "@/lib/admin/data/controlCenter";
import RefreshDashboard from "@/components/admin/RefreshDashboard";
import styles from "./control-center.module.css";

export const metadata = { title: "Control Center — Home Tech Vault Admin" };
const number = (value: number | null) =>
  value === null ? "Unavailable" : value.toLocaleString();
const date = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));

function Panel({
  title,
  eyebrow,
  href,
  children,
}: {
  title: string;
  eyebrow: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <Link
          className={styles.iconLink}
          href={href}
          aria-label={`Open ${title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function Status({
  label,
  detail,
  status,
  href,
}: {
  label: string;
  detail: string;
  status: "Connected" | "Configured" | "Missing" | "Unavailable";
  href: string;
}) {
  return (
    <Link href={href} className={styles.statusRow}>
      <div>
        <strong>{label}</strong>
        <p>{detail}</p>
      </div>
      <span
        className={`${styles.badge} ${status === "Connected" || status === "Configured" ? styles.good : styles.warning}`}
      >
        {status}
      </span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const d = await loadAdminControlCenter();
  const configurationIssues =
    d.health?.checks.filter(
      (check) => check.status === "missing" || check.status === "warning",
    ) ?? [];
  const unavailable = [
    d.users,
    d.devices,
    d.households,
    d.documents,
    d.newUsers,
    d.paid,
    d.support,
    d.completed,
    d.skipped,
    d.incomplete,
    d.emailSent,
    d.emailFailed,
    d.imports,
    d.connectors,
    d.staleConnectors,
    d.checks,
    d.checksToday,
    d.redditChecks,
  ].filter((value) => value === null).length;
  const alerts: { title: string; detail: string; href: string }[] = [];
  if (d.support !== null && d.support > 0)
    alerts.push({
      title: `${number(d.support)} open support tickets`,
      detail: "Review new, active, and waiting-on-customer conversations.",
      href: "/admin/support",
    });
  if (d.emailFailed !== null && d.emailFailed > 0)
    alerts.push({
      title: `${number(d.emailFailed)} lifecycle emails failed`,
      detail:
        "Attempts recorded in the last 7 days. Review email configuration and delivery logs.",
      href: "/admin/emails",
    });
  if (d.staleConnectors !== null && d.staleConnectors > 0)
    alerts.push({
      title: `${number(d.staleConnectors)} connectors need a check-in`,
      detail:
        "Active installations with no heartbeat or none within the last hour.",
      href: "/admin/connectors",
    });
  if (!d.health?.supabaseConnected)
    alerts.push({
      title: "Database check needs review",
      detail: "The database read check did not confirm connectivity.",
      href: "/admin/system",
    });
  if (configurationIssues.length)
    alerts.push({
      title: `${configurationIssues.length} configuration items to review`,
      detail: configurationIssues.map((check) => check.label).join(" · "),
      href: "/admin/system",
    });
  if (unavailable || d.signups === null || d.tickets === null)
    alerts.push({
      title: "Some overview data is unavailable",
      detail:
        "A source could not be read. Refresh or inspect system configuration; unavailable does not mean zero.",
      href: "/admin/system",
    });
  const events = [
    ...(d.signups ?? []).map((row) => ({
      id: `user-${row.id}`,
      title: "Account created",
      detail: row.full_name || "New HTV customer",
      at: row.created_at as string | null,
      href: `/admin/users?selected=${row.id}`,
      kind: "Customer",
    })),
    ...(d.tickets ?? []).map((row) => ({
      id: `ticket-${row.id}`,
      title: row.subject || "Support ticket created",
      detail: row.status.replaceAll("_", " "),
      at: row.created_at as string | null,
      href: "/admin/support",
      kind: "Support",
    })),
  ]
    .filter((event) => event.at && Number.isFinite(Date.parse(event.at)))
    .sort((a, b) => Date.parse(b.at!) - Date.parse(a.at!))
    .slice(0, 6);
  const metrics = [
    {
      label: "Total users",
      value: d.users,
      hint: `${number(d.newUsers)} joined today · UTC`,
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Devices in vaults",
      value: d.devices,
      hint: `${number(d.households)} households`,
      href: "/admin/devices",
      icon: Cpu,
    },
    {
      label: "Documents saved",
      value: d.documents,
      hint: "Platform document records",
      href: "/admin/analytics",
      icon: FileText,
    },
    {
      label: "Paid-plan subscriptions",
      value: d.paid,
      hint: "Pro + Family · active or trialing",
      href: "/admin/subscriptions",
      icon: Wallet,
    },
  ];
  const onboarding = [
    {
      label: "Setup completed",
      value: d.completed,
      detail: "Completion recorded",
      color: "#b3c98c",
    },
    {
      label: "Setup skipped",
      value: d.skipped,
      detail: "Skipped without completion",
      color: "#d5b57e",
    },
    {
      label: "No completion recorded",
      value: d.incomplete,
      detail: "Includes new and legacy accounts",
      color: "#8298b4",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            <ShieldCheck size={14} /> HOME TECH VAULT / ADMIN
          </p>
          <h1>
            Everything in <span>control.</span>
          </h1>
          <p className={styles.intro}>
            Welcome back, {d.firstName}. Your platform, customers, and next
            moves in one place.
          </p>
        </div>
        <div className={styles.refresh}>
          <RefreshDashboard />
          <p>Snapshot {date(d.capturedAt)} UTC</p>
        </div>
      </header>

      <div className={styles.brief}>
        <div className={styles.briefIcon}>
          {alerts.length ? <CircleAlert size={21} /> : <Check size={21} />}
        </div>
        <div>
          <strong>
            {alerts.length
              ? `${alerts.length} areas need your attention`
              : "No alerts from the available checks"}
          </strong>
          <p>
            {alerts.length
              ? "Your review queue is ready below. Start with the items that affect customers."
              : "Keep an eye on customer progress and recent activity. Configuration checks are not uptime monitoring."}
          </p>
        </div>
        <a href="#attention">
          Review queue <ChevronRight size={16} />
        </a>
      </div>

      <section aria-label="Platform overview" className={styles.metrics}>
        {metrics.map(({ label, value, hint, href, icon: Icon }) => (
          <Link href={href} className={styles.metric} key={label}>
            <div>
              <span>{label}</span>
              <Icon size={19} />
            </div>
            <strong className={value === null ? styles.unknownValue : ""}>
              {number(value)}
            </strong>
            <p>
              {hint}
              <ArrowUpRight size={14} />
            </p>
          </Link>
        ))}
      </section>

      <div className={styles.mainGrid}>
        <Panel
          title="Customer progress"
          eyebrow="BUILDING THEIR VAULT"
          href="/admin/users"
        >
          <div className={styles.progressSummary}>
            <div>
              <strong>{number(d.completed)}</strong>
              <p>accounts with setup completed</p>
            </div>
            <Home size={37} strokeWidth={1} />
          </div>
          <div className={styles.progressBar} aria-hidden="true">
            {onboarding.map((stage) => (
              <span
                key={stage.label}
                style={{
                  width: `${d.users && stage.value !== null ? (stage.value / d.users) * 100 : 0}%`,
                  background: stage.color,
                }}
              />
            ))}
          </div>
          <div className={styles.stages}>
            {onboarding.map((stage) => (
              <Link href="/admin/users" key={stage.label}>
                <span
                  className={styles.dot}
                  style={{ background: stage.color }}
                />
                <div>
                  <strong>{stage.label}</strong>
                  <p>{stage.detail}</p>
                </div>
                <b>{number(stage.value)}</b>
              </Link>
            ))}
          </div>
          <p className={styles.note}>
            Based on saved account setup fields. These are not Notion activation
            milestones or a conversion funnel.
          </p>
        </Panel>
        <div id="attention" className={styles.anchor}>
          <Panel
            title="Needs attention"
            eyebrow="YOUR NEXT MOVES"
            href="/admin/system"
          >
            {alerts.length ? (
              <div className={styles.alerts}>
                {alerts.map((alert, index) => (
                  <Link href={alert.href} key={alert.title}>
                    <span className={styles.alertNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.detail}</p>
                    </div>
                    <ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <ShieldCheck size={32} />
                <strong>Your review queue is clear</strong>
                <p>
                  No support, lifecycle email, connector, or configuration
                  alerts were returned by these checks.
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <Panel
          title="Recent activity"
          eyebrow="ACROSS THE PLATFORM"
          href="/admin/activity"
        >
          <p className={styles.note}>
            Latest account creations and support tickets · UTC
          </p>
          {d.signups === null || d.tickets === null ? (
            <p className={styles.inlineWarning}>
              Activity is incomplete: one or more sources could not be loaded.
            </p>
          ) : null}
          <div className={styles.timeline}>
            {events.map((event) => (
              <Link key={event.id} href={event.href}>
                <span className={styles.eventIcon}>
                  {event.kind === "Customer" ? (
                    <Users size={16} />
                  ) : (
                    <LifeBuoy size={16} />
                  )}
                </span>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.detail}</p>
                </div>
                <time dateTime={event.at!}>{date(event.at!)}</time>
              </Link>
            ))}
          </div>
          {!events.length && (
            <p className={styles.note}>
              No activity available in these sources.
            </p>
          )}
          <Link className={styles.textLink} href="/admin/activity">
            Explore all activity <ArrowUpRight size={15} />
          </Link>
        </Panel>
        <Panel
          title="Systems & integrations"
          eyebrow="CONFIGURATION AND CONNECTIVITY"
          href="/admin/system"
        >
          <Status
            label="Database"
            detail="Read check against account records"
            status={
              d.health
                ? d.health.supabaseConnected
                  ? "Connected"
                  : "Unavailable"
                : "Unavailable"
            }
            href="/admin/system"
          />
          <Status
            label="Transactional email"
            detail="Resend configuration · not delivery confirmation"
            status={
              d.health
                ? d.health.resendConfigured
                  ? "Configured"
                  : "Missing"
                : "Unavailable"
            }
            href="/admin/emails"
          />
          <Status
            label="Billing"
            detail="Stripe configuration · not a service probe"
            status={
              d.health
                ? d.health.stripeConfigured
                  ? "Configured"
                  : "Missing"
                : "Unavailable"
            }
            href="/admin/subscriptions"
          />
          <Status
            label="Notion onboarding"
            detail="Token and data source · sync health not tracked here"
            status={d.notionConfigured ? "Configured" : "Missing"}
            href="/admin/system"
          />
          <Status
            label="Receipt email ingestion"
            detail="Resend key and inbound webhook secret"
            status={d.inboundConfigured ? "Configured" : "Missing"}
            href="/admin/system"
          />
          <p className={styles.note}>
            Checked when this page loads. No uptime or latency claims.
          </p>
        </Panel>
      </div>

      <section aria-labelledby="automation-heading">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>WORKING BEHIND THE SCENES</p>
            <h2 id="automation-heading">Automation & discovery</h2>
          </div>
        </div>
        <div className={styles.automation}>
          <Link href="/admin/emails">
            <Mail size={21} />
            <h3>Lifecycle email</h3>
            <strong>{number(d.emailSent)}</strong>
            <p>Marked sent in the last 7 days</p>
            <span>
              {number(d.emailFailed)} failed attempts <ArrowUpRight size={15} />
            </span>
            <small>Provider acceptance, not inbox delivery.</small>
          </Link>
          <Link href="/admin/connectors">
            <Plug size={21} />
            <h3>Network discovery</h3>
            <strong>{number(d.connectors)}</strong>
            <p>Active, non-revoked installations</p>
            <span>
              {number(d.staleConnectors)} without a recent heartbeat{" "}
              <ArrowUpRight size={15} />
            </span>
            <small>Review scan history in Connectors.</small>
          </Link>
          <div>
            <FileText size={21} />
            <h3>Receipt imports</h3>
            <strong>{number(d.imports)}</strong>
            <p>Pending customer review</p>
            <span>Customers approve imports in their vaults</span>
            <small>No platform-wide import review screen exists.</small>
          </div>
        </div>
      </section>

      <div className={styles.mainGrid}>
        <Panel
          title="Audience & acquisition"
          eyebrow="TRAFFIC · LAST 30 DAYS"
          href="/admin/analytics"
        >
          <div className={styles.smallMetrics}>
            <div>
              <strong>
                {number(d.traffic.available ? d.traffic.visitors : null)}
              </strong>
              <p>Unique visitors</p>
            </div>
            <div>
              <strong>
                {number(d.traffic.available ? d.traffic.pageviews : null)}
              </strong>
              <p>Pageviews</p>
            </div>
          </div>
          <div className={styles.referral}>
            <span>Top referral</span>
            <strong>
              {d.traffic.available
                ? d.traffic.topReferrers[0]?.label || "No referral data"
                : "Unavailable"}
            </strong>
          </div>
          <p className={styles.note}>
            {d.traffic.available
              ? "Production traffic from Vercel Analytics. Separate from all-time platform totals."
              : d.traffic.configured
                ? "Vercel Analytics could not be reached. Refresh to retry."
                : "Vercel Analytics credentials are not configured in this environment."}
          </p>
          <Link className={styles.textLink} href="/admin/analytics">
            Open growth analytics <ArrowUpRight size={15} />
          </Link>
        </Panel>
        <Panel
          title="Public Health Check"
          eyebrow="DIAGNOSTIC ACTIVITY"
          href="/health-check"
        >
          <div className={styles.smallMetrics}>
            <div>
              <strong>{number(d.checks)}</strong>
              <p>All-time completions</p>
            </div>
            <div>
              <strong>{number(d.checksToday)}</strong>
              <p>Completed today · UTC</p>
            </div>
          </div>
          <div className={styles.referral}>
            <span>Reddit-attributed completions</span>
            <strong>{number(d.redditChecks)}</strong>
          </div>
          <p className={styles.note}>
            Recorded completions, not platform health or customer activation.
          </p>
          <Link className={styles.textLink} href="/health-check">
            Open diagnostic <ArrowUpRight size={15} />
          </Link>
        </Panel>
      </div>

      <Panel
        title="Latest customers"
        eyebrow="RECENT SIGNUPS"
        href="/admin/users"
      >
        <div className={styles.customers}>
          {d.signups?.map((row) => (
            <Link key={row.id} href={`/admin/users?selected=${row.id}`}>
              <span className={styles.avatar}>
                {(row.full_name || "HTV").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{row.full_name || "Unnamed account"}</strong>
                <p>
                  {row.created_at
                    ? `${date(row.created_at)} UTC`
                    : "Signup date unavailable"}
                </p>
              </div>
              <span className={styles.badge}>
                {row.onboarding_completed_at
                  ? "Setup complete"
                  : row.onboarding_skipped_at
                    ? "Setup skipped"
                    : "Setup not completed"}
              </span>
              <ChevronRight size={16} />
            </Link>
          ))}
        </div>
        {!d.signups?.length && (
          <p className={styles.note}>
            {d.signups === null
              ? "Customer records are unavailable."
              : "No customer accounts yet."}
          </p>
        )}
      </Panel>

      <nav aria-label="Quick actions" className={styles.quickActions}>
        <span>Quick actions</span>
        {[
          { href: "/admin/users", label: "Manage users", icon: Users },
          { href: "/admin/support", label: "Open support", icon: LifeBuoy },
          {
            href: "/admin/founding-members",
            label: "Founding members",
            icon: ShieldCheck,
          },
          { href: "/admin/platform", label: "Platform tools", icon: Activity },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Icon size={16} />
            {label}
            <ArrowUpRight size={14} />
          </Link>
        ))}
      </nav>
      <footer className={styles.footer}>
        <ShieldCheck size={14} /> Admin access protected · Read-only overview ·
        Refresh for the latest snapshot
      </footer>
    </div>
  );
}
