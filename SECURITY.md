# Security

Reviewed **6 November 2026** against source manifest **2.0.0**. These are implemented controls and their limits, not a security certification.

## Implemented controls

- **Zero-innerHTML:** runtime UI uses programmatic DOM creation, text nodes and `textContent` instead of `.innerHTML` or `.insertAdjacentHTML`. Course data is treated as text. This reduces HTML-injection exposure; it does not prove that every possible vulnerability is absent.
- **Local data model:** no extension analytics, remote executable code or external runtime library/CDN is implemented. The independent public web page loads Google Fonts.
- **Host access:** declared UIU/Google Docs/GitHub raw host permissions plus optional grants for additional sites. Injection also checks the enabled-site list. This is not an optional-only permission model.
- **Input validation:** full-code identities, duplicate JSON-key/normalized-code detection, schema checks, positive finite credits, exam fields and prerequisite graph validation.
- **Graph integrity:** missing references, self-dependencies, duplicate edges and cycles are errors. Suspicious CSE/DS edges and differing overrides are review warnings; they are not silently deleted.
- **Review before mutation:** JSON import, remote catalog updates and catalog resets present a preview. Sync application checks the reviewed remote revision. Existing intentional local overrides are retained.
- **Size checks:** imports and remote catalog text are limited to 2 MiB. Remote text is read before the size check, so the check does not bound network transfer/memory while reading a response.

The master tests include checks for unsafe DOM APIs and regression coverage for validation, graph identity, imports and synchronization. Tests do not replace a complete security review.

## Data and network boundaries

Course lookups are local. Requested catalog updates use HTTPS to the configured GitHub raw JSON. External links and GitHub drafts leave the extension; draft URLs include the prefilled data when opened. Browser-local storage is not application-level encrypted. See [PRIVACY.md](PRIVACY.md).

## Reporting a vulnerability

Avoid placing exploitable details, credentials or private student data in a public issue. Use a private repository security advisory if private reporting is enabled; otherwise contact the maintainer through an available private channel before disclosing sensitive details. Public issues are suitable for non-sensitive bugs and academic data corrections.

Include the affected source revision/version, browser, reproduction steps, impact and a minimal sanitized example. There is no documented guaranteed response time, patch deadline, bounty or credit policy. Availability of private reporting must be checked on the repository.

## Contributor requirements

Keep runtime DOM construction free of unsafe HTML injection. Validate external data before storage/application, preserve user data and avoid introducing network services or dependencies without a justified design. Run catalog validation, copy checks and all 24 master suites. See [CONTRIBUTING.md](CONTRIBUTING.md).
