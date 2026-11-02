# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | ✅ Yes    |
| 1.x     | ❌ No     |

## Privacy & Data Handling

**UIU Course Code Decoder** is designed with privacy-first principles:
- **Zero telemetry**: No usage tracking, analytics, or identifiers collected.
- **Local-only storage**: All user data lives in `chrome.storage.local` on the user's device.
- **No background network requests**: The extension only contacts `raw.githubusercontent.com` when the user explicitly triggers "Sync Course Database".
- **Manifest V3**: Compliant with Chrome's latest extension security model.
- **Per-site permissions**: The extension only activates on websites the user explicitly grants access to via optional host permissions.
- **Zero-innerHTML DOM architecture**: All text and metadata decorations are rendered programmatically using safe browser DOM APIs (`textContent`, `createElement`, `createTextNode`), completely eliminating DOM-based XSS vectors.

## Reporting a Vulnerability

If you discover a security vulnerability in this extension, **please do not file a public GitHub issue**.

Instead, report it privately:

1. **GitHub Security Advisory**: Open a private [Security Advisory](https://github.com/litch07/uiu-course-decoder/security/advisories/new) on the repository.
2. **Include**:
   - A description of the vulnerability
   - Steps to reproduce or proof-of-concept
   - Potential impact
   - Any suggested mitigations (optional)

Reports are acknowledged within **48 hours**, with verified patches targeted within **7 days** for critical issues.

## Scope

Security reports are relevant for:
- XSS or content injection vulnerabilities in `content.js` or `popup.js`
- Privilege escalation via extension permissions
- Data exfiltration from `chrome.storage.local`
- Malicious payload injection in catalog sync mechanism or batch JSON imports

## Thank You

Responsible security disclosures are greatly appreciated and will be credited in the project release notes.

