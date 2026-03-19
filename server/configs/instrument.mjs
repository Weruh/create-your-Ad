import * as Sentry from "@sentry/node"
;

Sentry.init({
  dsn: "https://01193582e5067e54448e43706a00d748@o4511059698384896.ingest.de.sentry.io/4511059707035728",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});