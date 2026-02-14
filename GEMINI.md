# GEMINI Protocol - honjoh.dev

## 1. File Location & Workspace Isolation
- **STRICT RULE**: ALL generated files, including documentation, artifacts, and logs, MUST be located within the workspace: `d:/honjoh.dev/`.
- **Documentation**: All planning and documentation files (`task.md`, `implementation_plan.md`, `vision.md`, etc.) MUST be placed in `d:/honjoh.dev/docs/`.
- **Prohibition**: NEVER create files in `C:\Users\honjo\.gemini\` or any other system directory unless explicitly instructed for a specific system-level debug task.

## 2. Intent-Aware Execution
- **Consultation Phase**: Do not execute environment changes (like `npm install`, `astro init`) without explicit "Execution" command.
- **Hearing**: Prioritize understanding the vision over technical implementation.

## 3. Automation & Scalability
- This project is the foundation of a "Global Automation Platform".
- All configuration should be code-based (IaC where possible) and version controlled.
