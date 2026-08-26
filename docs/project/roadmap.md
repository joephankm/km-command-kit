# Roadmap

The planned evolution of the project, organized by milestones, phases, and steps.

---

## 🧭 Overview

This roadmap defines the project's progression from major goals to individual implementation steps.

```
Milestone
└── Phase
    └── Step
        └── Task
```

| Level         | Version | Description                                                                                |
| ------------- | ------- | ------------------------------------------------------------------------------------------ |
| **Milestone** | `Major` | A major project goal. Completing it represents a significant milestone for the repository. |
| **Phase**     | `Minor` | A focused goal within a milestone and a meaningful phase of the project.                   |
| **Step**      | `Patch` | A concrete implementation step within a phase.                                             |
| **Task**      | —       | An atomic unit of work within a step. Each task corresponds to one Git commit.             |

---

## 🗺️ Milestones

### 🚀 V1 — Node Script Foundation

> Establish the foundation for running Node.js scripts in Node.js and frontend projects.
>
> **Goal:** Provide the structure, utilities, conventions, and supporting tools needed to develop and run reusable
> Node.js scripts using JavaScript or TypeScript.
>
> **Status:** 🔵 Started

**🔵 Phase 1 — Establish Terminal Logging**

Build the core capabilities for styling, logging, and displaying information in the terminal.

| Step    | Name                             | Status       | Purpose                                                                                        |
| ------- | -------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| `1.1.1` | Build Terminal Styling Utilities | 🔵 Started   | Provide utilities for styling terminal output, such as text colors and value-based formatting. |
| `1.1.2` | Implement Terminal Logger        | 🟡 Planned   | Provide a reusable logger for displaying structured information in the terminal.               |
| `1.1.3` | Add Process Logging              | 🔷 Confirmed | Provide capabilities for displaying and tracking process information in the terminal.          |
| `1.1.4` | Add Terminal Drawing             | 🔶 Idea      | Provide capabilities for drawing or rendering visual elements in the terminal.                 |

**🟡 Phase 2 — Establish Terminal Logging**

**🟡 Phase 3 — Build Environment Configuration**

---

## 📋 Backlog

The following milestones are ideas for future development.

### 🧠 Full Environment Command Toolkit

> Extend the toolkit beyond Node.js to support a broader command-line environment.
>
> **Goal:** Add support for Bash scripts, Makefiles, and other environment-level tooling to provide a more complete
> command toolkit.
>
> **Status:** 🔶 Idea

### 🧠 CLI Project Template

> Evolve the toolkit into a reusable project template for creating standalone CLI applications.
>
> **Goal:** Allow developers to use this repository as a starting point for building standalone CLI tools (e.g. tools
> similar in structure and usage to `aws-cli`).
>
> **Status:** 🔶 Idea

### 🧠 Toolkit Automation

> Enhance the toolkit with built-in automation that makes creating, managing, and maintaining projects easier.
>
> **Goal:** Provide commands and workflows that automate common toolkit operations, such as generating a toolkit setup,
> creating a new CLI project from the template, and cleaning up or maintaining project files.
>
> **Status:** 🔶 Idea
