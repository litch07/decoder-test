# Security Policy

## Supported Versions

| Version | Status | Notes |
|:---:|:---:|---|
| **2.x** | ✅ Supported | Active release line with per-site permissions and Zero-innerHTML security. |
| **1.x** | ❌ Unsupported | Legacy version. Users are strongly encouraged to update to 2.x. |

---

## Security Architecture & Design Principles

**UIU Course Code Decoder** follows defensive security and privacy practices:

- **Zero Telemetry**: The extension collects no usage analytics, user identifiers, or browsing history.
- **Local Storage Isolation**: All user configurations, allowed domains, and catalog entries reside strictly in `chrome.storage.local`.
- **Restricted Network Boundary**: The extension contacts `raw.githubusercontent.com` only when the user explicitly triggers "Sync Course Database" in Settings. All responses are verified against strict schema constraints and an enforced **2 MB payload size cap**.
- **Manifest V3 Compliance**: Built on Chrome's latest extension security platform with granular, least-privilege permissions.
- **Per-Site Dynamic Permissions**: Content scripts execute strictly on domains explicitly granted by the user via `optional_host_permissions`.
- **Zero-innerHTML DOM Architecture**: All text decorations, overlays, and tooltip cards are constructed strictly using safe browser DOM APIs (`textContent`, `createElement`, `createTextNode`), completely eliminating DOM-based Cross-Site Scripting (XSS) attack vectors.

---

## Reporting a Vulnerability

If you discover a security vulnerability in this project, **please do not file a public GitHub issue**.

Instead, report it privately through GitHub Security Advisories:

1. Open a private [Security Advisory](https://github.com/litch07/uiu-course-decoder/security/advisories/new) on the repository.
2. Please include:
   - A clear description of the vulnerability
   - Step-by-step reproduction instructions or a minimal proof-of-concept
   - The potential impact and attack vectors
   - Suggested mitigations or patches (optional)

### Response Timelines

- **Initial Acknowledgment**: Within **48 hours** of report receipt.
- **Status Updates**: Periodic updates as the issue is investigated and reproduced.
- **Fix & Release**: We aim to release a verified patch within **7 days** for critical vulnerabilities.

---

## Scope

Security reports are relevant for:
- Content injection or DOM-based XSS vulnerabilities in `content.js` or `popup.js`
- Privilege escalation through extension permissions or background service workers
- Data exfiltration from `chrome.storage.local`
- Malicious payload injection in catalog synchronization or batch JSON imports

---

## Acknowledgments

Responsible security disclosures will be credited in the project release notes and repository acknowledgments.
