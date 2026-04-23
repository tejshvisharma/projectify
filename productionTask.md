# 🚀 Production Readiness Checklist

## 🧭 Overview

Current state: partially production-ready, but not deploy-safe yet.

Major risks are concentrated in four areas:

- Frontend release is currently blocked by TypeScript build failures.
- Security hardening is incomplete for cookie-based auth workloads (CSRF, security headers, rate limiting).
- API contract consistency is drifting between backend responses and frontend typing/parsing.
- Operational readiness is weak (no production start pipeline, weak env contract, limited observability and automated verification).

---

## 🔴 Phase 1: Critical Fixes (Must complete before deployment)

1. Resolve all frontend build blockers and enforce a passing production build gate.
2. Add baseline API security middleware stack: security headers, request size limits, and auth endpoint rate limiting.
3. Add CSRF protection for state-changing cookie-authenticated endpoints.
4. Fix auth/API response contract mismatches (status code naming and user payload shape).
5. Fix broken validator wiring for project member role updates.
6. Harden token/cookie strategy for production domains and refresh reliability.
7. Expand required environment validation and provide backend env template.
8. Replace backend runtime script strategy (nodemon-only) with production-safe start scripts.

---

## 🟡 Phase 2: Important Improvements

1. Standardize error envelope and API response schema across all modules.
2. Make registration and email flows transactional and failure-safe.
3. Remove user enumeration behavior from password reset endpoints.
4. Improve health checks to include dependency status.
5. Implement structured logging and request correlation IDs.
6. Complete project invite email delivery path.
7. Add integration tests for auth refresh, role/permission checks, and critical mutations.

---

## 🟢 Phase 3: Nice-to-Have Enhancements

1. Add response compression and cache strategy tuning.
2. Add background job processing for outbound emails and retry logic.
3. Add dashboards/alerts for auth failures, refresh spikes, and DB latency.
4. Improve maintainability by consolidating shared API types and lint/test quality gates.

---

## 📋 Detailed Tasks

### 🔐 Authentication & Security

### Task 01: Enforce CSRF Defense For Cookie-Based Auth

- **Problem:** The app uses HTTP-only cookies for authenticated state changes, but there is no CSRF token validation layer for write endpoints.
- **Why it matters:** Cross-site requests can trigger state-changing actions from an authenticated browser session.
- **Fix:** Add CSRF token issuance and verification for all non-idempotent auth-protected routes (POST, PATCH, DELETE), with clear frontend token propagation and rejection handling.
- **Priority:** 🔴 Critical

### Task 02: Add Auth Endpoint Rate Limiting

- **Problem:** Login, refresh token, forgot password, and verification resend endpoints have no active request throttling.
- **Why it matters:** Increases risk of brute-force attacks, token abuse, and email endpoint abuse under real traffic.
- **Fix:** Apply per-IP and per-identity limits to sensitive auth routes with 429 responses and retry headers.
- **Priority:** 🔴 Critical

### Task 03: Make Cookie Policy Environment-Aware

- **Problem:** Cookie config is fixed to SameSite strict and may break in multi-domain production deployments.
- **Why it matters:** Legitimate refresh and authenticated requests can fail silently when frontend/backend run on different domains.
- **Fix:** Use environment-driven cookie config (sameSite, secure, domain, path), and document expected domain topology for production.
- **Priority:** 🔴 Critical

### Task 04: Hash Stored Refresh Tokens

- **Problem:** Refresh tokens are persisted in plaintext in user records.
- **Why it matters:** A database leak immediately enables session takeover.
- **Fix:** Store only hashed refresh tokens, compare hashed incoming tokens, and rotate on refresh.
- **Priority:** 🔴 Critical

### Task 05: Remove Account Enumeration In Forgot Password

- **Problem:** Forgot password currently returns user-not-found behavior that can reveal account existence.
- **Why it matters:** Attackers can enumerate valid user emails.
- **Fix:** Return a uniform success response regardless of account existence and always execute timing-safe control flow.
- **Priority:** 🟡 Important

### Task 06: Validate Logout Resilience On Expired Access Tokens

- **Problem:** Logout requires authenticated access context and can fail when access token is expired before refresh succeeds.
- **Why it matters:** Users may remain with valid refresh cookie sessions unexpectedly.
- **Fix:** Ensure logout can reliably invalidate refresh token/cookies even when access token is stale, or refresh then revoke in one controlled flow.
- **Priority:** 🟡 Important

### ⚙️ Backend Stability & API Design

### Task 07: Add Security Middleware Baseline

- **Problem:** API stack lacks baseline production protections (security headers, payload hard limits, sanitization guardrails).
- **Why it matters:** Increases exposure to common web attack vectors and resource abuse.
- **Fix:** Add middleware for security headers, request body size limits, and route-level hardening defaults before route handlers.
- **Priority:** 🔴 Critical

### Task 08: Fix Broken Member Role Validator Wiring

- **Problem:** Project member role update validation path is incorrectly wired and the validator implementation does not return a validation chain.
- **Why it matters:** Invalid role changes can bypass expected validation and fail unpredictably downstream.
- **Fix:** Return proper validation arrays and invoke validators consistently in route definitions.
- **Priority:** 🔴 Critical

### Task 09: Standardize API Response Contract

- **Problem:** API responses mix statuscode and statusCode conventions and differ in payload envelope shape across endpoints.
- **Why it matters:** Frontend parsing bugs and auth regressions become frequent under feature growth.
- **Fix:** Define one canonical response schema and migrate controllers, docs, and frontend types to match it.
- **Priority:** 🔴 Critical

### Task 10: Make Register Flow Transaction-Safe

- **Problem:** Registration path does not consistently await persistence and email dispatch steps.
- **Why it matters:** Users can receive inconsistent outcomes (success response without guaranteed post-create side effects).
- **Fix:** Await all critical async operations, fail fast on email pipeline errors, and add compensation logic where required.
- **Priority:** 🟡 Important

### Task 11: Complete Project Invite Email Delivery

- **Problem:** Invite flow includes a placeholder email queue function with no delivery implementation.
- **Why it matters:** Team onboarding workflows fail in real usage while API appears successful.
- **Fix:** Implement real invite delivery with retry and failure handling, or explicitly disable endpoint until complete.
- **Priority:** 🟡 Important

### Task 12: Strengthen Health Endpoint

- **Problem:** Health check currently reports API process availability only.
- **Why it matters:** Deployment orchestration cannot distinguish healthy process from broken dependencies (DB, mail provider, storage).
- **Fix:** Add lightweight dependency checks and return structured readiness details for liveness/readiness use.
- **Priority:** 🟡 Important

### 🎯 Frontend Stability & UX

### Task 13: Unblock Production Build

- **Problem:** Current frontend build fails (icon imports, type mismatches, and mutation handler signatures).
- **Why it matters:** Deployment pipeline cannot produce a releasable artifact.
- **Fix:** Resolve all TypeScript errors and enforce zero-error build in CI before merge.
- **Priority:** 🔴 Critical

### Task 14: Stabilize Auth Payload Handling Across Login/Hydration

- **Problem:** Login response shape and profile response expectations are not fully consistent.
- **Why it matters:** User state can become partially populated, causing UI data gaps and fragile route behavior.
- **Fix:** Normalize auth payload contract and ensure store setters consume a single stable user shape.
- **Priority:** 🔴 Critical

### Task 15: Remove Direct External URL Dependency In Resend Flow

- **Problem:** Login resend flow trusts backend-provided URL directly in frontend request execution.
- **Why it matters:** Unexpected URL behavior can create operational and security risk if misconfigured.
- **Fix:** Route resend through known frontend API client base URL and use backend path only.
- **Priority:** 🟡 Important

### Task 16: Improve Global Error UX For Auth and Network Failures

- **Problem:** User-facing error handling varies by page and endpoint.
- **Why it matters:** Inconsistent error messaging reduces recoverability for session expiry and transient failures.
- **Fix:** Establish centralized API error mapping and user-safe retry guidance patterns.
- **Priority:** 🟡 Important

### ⚡ Performance Optimization

### Task 17: Add Response Compression and Static Caching Policy

- **Problem:** API responses and static assets lack explicit compression/caching strategy.
- **Why it matters:** Higher latency and bandwidth costs under real traffic.
- **Fix:** Enable compression and define cache headers for static/public resources and safe GET endpoints.
- **Priority:** 🟡 Important

### Task 18: Optimize Expensive Aggregation and Populate Paths

- **Problem:** Dashboard and project/task endpoints rely on heavy population/aggregation patterns without explicit performance budgets.
- **Why it matters:** Query latency will spike as data volume grows.
- **Fix:** Add query timing instrumentation, targeted indexes, bounded projections, and pagination defaults for large views.
- **Priority:** 🟡 Important

### Task 19: Prevent Unnecessary Refetch Churn

- **Problem:** Query invalidation is broad in several mutations, causing avoidable refetches.
- **Why it matters:** Wasted API traffic and slower UI under concurrent usage.
- **Fix:** Narrow invalidation scopes and prefer targeted cache updates where safe.
- **Priority:** 🟢 Nice-to-have

### 🧪 Testing & Reliability

### Task 20: Add Backend Integration Tests For Auth Lifecycle

- **Problem:** No automated tests currently protect login, refresh, logout, forgot/reset password, and email verification paths.
- **Why it matters:** High-risk auth regressions can reach production undetected.
- **Fix:** Add integration tests for happy and failure paths, including token expiry and refresh reuse detection scenarios.
- **Priority:** 🔴 Critical

### Task 21: Add Frontend Auth Flow E2E Tests

- **Problem:** Startup hydration, protected route redirects, and interceptor retry behavior are not covered by E2E automation.
- **Why it matters:** Browser-specific cookie/session bugs can ship unnoticed.
- **Fix:** Add E2E coverage for login failure, token-expired refresh success, refresh failure logout, and route guard behavior.
- **Priority:** 🔴 Critical

### Task 22: Enforce Pre-Merge Quality Gates

- **Problem:** No mandatory CI gate currently ensures build success and regression coverage.
- **Why it matters:** Broken builds and production bugs can be merged.
- **Fix:** Enforce CI checks for typecheck, lint, and core test suites before merge.
- **Priority:** 🟡 Important

### 📦 Deployment & DevOps

### Task 23: Introduce Production Start Scripts

- **Problem:** Backend only exposes nodemon start script intended for development.
- **Why it matters:** Production runtime behavior is unstable and non-standard.
- **Fix:** Add separate dev and prod scripts, run production with node, and define Node engine/runtime policy.
- **Priority:** 🔴 Critical

### Task 24: Expand Environment Variable Contract

- **Problem:** Many required runtime variables (CORS origins, API base URL, mail, cloudinary, invite/email settings) are used but not fully validated.
- **Why it matters:** Misconfiguration can break auth, email, uploads, and CORS in production.
- **Fix:** Extend env validation for all required keys and provide backend env template with safe defaults/documentation.
- **Priority:** 🔴 Critical

### Task 25: Add Graceful Shutdown and Process Safety Hooks

- **Problem:** Server startup/shutdown lifecycle does not handle termination signals and in-flight request draining.
- **Why it matters:** Deploy restarts can drop requests or leave resources in inconsistent state.
- **Fix:** Add SIGTERM/SIGINT handlers, close HTTP server gracefully, and release DB connections.
- **Priority:** 🟡 Important

### 📊 Monitoring & Logging

### Task 26: Add Structured Application Logging

- **Problem:** Logging is mostly console-based and dev-focused.
- **Why it matters:** Hard to trace incidents across requests and services in production.
- **Fix:** Emit structured logs (level, request id, user id where safe, route, latency, status) and route to a central sink.
- **Priority:** 🟡 Important

### Task 27: Add Production Alerts and SLO Signals

- **Problem:** No defined alerting for auth failures, error spikes, slow endpoints, or dependency outages.
- **Why it matters:** Failures can persist undetected and impact users.
- **Fix:** Track key service indicators and set actionable alert thresholds for on-call response.
- **Priority:** 🟢 Nice-to-have

### 🧹 Code Quality & Maintainability

### Task 28: Consolidate Shared API Types

- **Problem:** Multiple duplicated ApiResponse definitions with different field names exist across frontend modules.
- **Why it matters:** Increases integration bugs and slows feature delivery.
- **Fix:** Create shared API contract types and reuse consistently across feature domains.
- **Priority:** 🟡 Important

### Task 29: Clean Dead Imports and Inactive Code Paths

- **Problem:** Several controllers and modules contain unused imports and incomplete paths.
- **Why it matters:** Reduces signal-to-noise and hides real defects.
- **Fix:** Remove dead code, enforce linting for unused symbols, and convert placeholders into tracked backlog items.
- **Priority:** 🟢 Nice-to-have

### Task 30: Document Operational Runbooks

- **Problem:** Incident response steps for auth outage, mail outage, and DB failures are not formalized.
- **Why it matters:** Recovery is slower and error-prone during real incidents.
- **Fix:** Add concise runbooks for detection, mitigation, rollback, and verification per critical subsystem.
- **Priority:** 🟢 Nice-to-have
