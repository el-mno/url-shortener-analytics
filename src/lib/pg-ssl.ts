import type { PoolConfig } from "pg";

// Build the Postgres SSL options from the environment.
//
// Managed providers (e.g. a hosted connection pooler) present a certificate
// signed by their own private CA, which isn't in the system trust store. When
// DATABASE_CA_CERT holds that CA in PEM form, the certificate chain is fully
// verified against it. Locally — where the Docker Postgres speaks no TLS — the
// variable is unset and SSL is left off.
export function pgSslConfig(): PoolConfig["ssl"] {
  const ca = process.env.DATABASE_CA_CERT;
  if (!ca) return undefined;
  return { ca, rejectUnauthorized: true };
}
