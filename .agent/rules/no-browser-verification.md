---
trigger: always_on
glob:
description: Do not use browser_subagent for verification — user verifies manually
---

NEVER use browser_subagent for automated verification or testing.
The user will verify all changes manually in the browser.
Browser subagent wastes resources and should not be invoked.
Skip the VERIFICATION phase entirely — notify the user after implementation is complete.
