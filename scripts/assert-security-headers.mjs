const REQUEST_TIMEOUT_MS = 10_000;

const PATHS = [
  { path: "/" },
  { path: "/kalender" },
  { path: "/a/nested/path/that/does/not/exist", expectedStatus: 404 },
];

async function expectedHeaders() {
  const { default: nextConfig } = await import("../next.config.js");
  const rules = await nextConfig.headers();
  const catchAllRule = rules.find((rule) => rule.source === "/:path*");

  if (!catchAllRule) {
    throw new Error("next.config.js has no catch-all header rule");
  }

  return catchAllRule.headers;
}

async function failuresFor(baseUrl, { path, expectedStatus }, headers) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const failures = [];

  if (expectedStatus && response.status !== expectedStatus) {
    failures.push(
      `${path} answered ${response.status}, expected ${expectedStatus}`,
    );
  }

  for (const { key, value } of headers) {
    const received = response.headers.get(key);

    if (received !== value) {
      failures.push(`${path} sent ${key}: ${received ?? "nothing"}`);
    }
  }

  return failures;
}

const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error("usage: assert-security-headers.mjs <base-url>");
  process.exit(1);
}

const headers = await expectedHeaders();
const failures = [];

for (const target of PATHS) {
  failures.push(...(await failuresFor(baseUrl, target, headers)));
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
