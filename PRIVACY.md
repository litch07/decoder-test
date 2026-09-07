# Privacy Policy

**Effective Date:** June 6, 2026  
**Last Updated:** June 6, 2026  

This Privacy Policy describes how the "UIU Course Code Decoder" browser extension ("the Extension") collects, uses, and protects your information. By installing and using the Extension, you agree to the practices outlined in this policy.

## 1. Information Collection and Use

**We do not collect, transmit, distribute, or sell your personal data.** 

The Extension is designed with a strict "local-only" architecture. It operates entirely within your local browser environment. We do not employ any analytics tools, usage trackers, or remote servers. Consequently, no personally identifiable information (PII) or usage data is ever collected or transmitted to the developer or any third parties.

## 2. Data Storage and Security

All user-generated data, including but not limited to:
- Custom course additions and modifications
- Display mode preferences
- Website domain allowlists

...are stored securely and exclusively in your browser's local storage using the `chrome.storage.local` API. This data is fully controlled by you and can be permanently deleted at any time by uninstalling the Extension or clearing the Extension's local database via its native dashboard.

## 3. Required Permissions and Justification

The Extension requests specific browser permissions strictly to provide its core functionality. The justifications for these permissions are as follows:

*   **`storage`**: Required to save your user preferences and custom course dictionary locally within the browser.
*   **`activeTab` & `scripting`**: Required to execute the DOM parsing script exclusively on the active tab when you explicitly enable the Extension, allowing it to locate and decode course codes.
*   **`host_permissions` (`<all_urls>` & `https://docs.google.com/*`)**: Required to inject the decoding script into web pages and nested iframes (such as embedded Google Sheets). The Extension respects a strict user-defined allowlist and will not execute on any domain unless you explicitly grant it permission via the interface.

## 4. Third-Party Services

The Extension does not integrate with or transmit data to any third-party services, APIs, or advertising networks.

## 5. Changes to This Privacy Policy

We may update this Privacy Policy periodically to reflect changes in functionality or legal requirements. Any modifications will be published directly within the Extension's repository and on the Chrome Web Store listing. Because of our fundamental commitment to local-only data processing, future updates will not diminish your privacy rights.

## 6. Contact Information

If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

*   **Email:** [ssadidahmed01@gmail.com](mailto:ssadidahmed01@gmail.com)
*   **GitHub Repository:** [https://github.com/litch07/uiu-course-decoder/issues](https://github.com/litch07/uiu-course-decoder/issues)

We are committed to addressing your privacy-related inquiries promptly and transparently.
