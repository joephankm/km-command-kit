# Project Planning Model

This document defines the conventions used to organize, plan, and track work throughout the project.

********

## 🧱 Levels

Each level represents a different scope of work, from a major project goal down to an individual unit of implementation.

| Level         | Version | Description                                                                                                   |
|---------------|---------|---------------------------------------------------------------------------------------------------------------|
| **Milestone** | `Major` | A major project goal. Completing a milestone represents a significant achievement for the repository.         |
| **Phase**     | `Minor` | A focused goal within a milestone and a meaningful phase of the project.                                      |
| **Step**      | `Patch` | A concrete implementation step within a phase. A step represents the smallest versioned unit of planned work. |
| **Task**      | —       | An atomic unit of work within a step. Each task corresponds to one Git commit.                                |

The hierarchy is:

```text
Milestone
└── Phase
    └── Step
        └── Task
```

### Version Mapping

Milestones, phases, and steps are reflected directly in the project's versioning:

```text
Major  → Milestone
Minor  → Phase
Patch  → Step
```

For example:

```text
v1.0.0  → Milestone
v1.1.0  → Phase
v1.1.1  → Step
          └── Tasks → Git commits
```

--------


## ♻️ Lifecycle Stages

Work moves through a series of lifecycle stages as the project progresses.

### Stages

| Stage             | Emoji | Description                                                |
|-------------------|-------|------------------------------------------------------------|
| **Brainstorming** | 🧠    | Ideas being explored and considered.                       |
| **Planned**       | 🎯    | Selected for future implementation.                        |
| **In Progress**   | 🚀    | Currently being planned or implemented.                    |
| **Stabilization** | 🚧    | Completed implementation undergoing testing or refinement. |
| **Completed**     | ✅    | Work that has been finished.                               |

The typical progression is:

```text
🧠 Brainstorming  (in Backlog)
       ↓
🎯 Planned        (selected for next implementation)
       ↓
🚀 In Progress    (planning and working)
       ├───────────┐
       │           ↓
       │     🧪 Stabilization   (testing and refinement)
       │           │
       ├───────────┘
       ↓
✅ Completed
```

### Statuses

| Status             | Emoji | Stage         | Meaning                                                                                   |
|--------------------|-------|---------------|-------------------------------------------------------------------------------------------|
| **Idea**           | 🔶    | Brainstorming | An idea that has not yet been confirmed.                                                  |
| **Confirmed**      | 🔷    | Brainstorming | An idea confirmed for further development.                                                |
| **Ready**          | 🟡    | Planned       | Planned and ready to start.                                                               |
| **Started**        | 🔵    | In Progress   | Work has started but is not yet ready to use.                                             |
| **Usable**         | 🟢    | In Progress   | Ready to use, but still missing planned features.                                         |
| **Blocked**        | 🔴    | In Progress   | Work cannot continue for now due to a blocking issue.                                     |
| **Testing**        | 🟨    | Stabilization | All features are complete and ready to use, but testing or minor fixes are still ongoing. |
| **To Be Improved** | 🟦    | Completed     | Complete and ready to use, with improvements identified for later.                        |
| **Stable**         | 🟩    | Completed     | Fully complete and no further work is currently expected.                                 |
| **Deprecated**     | 🟥    | Completed     | No longer suitable for use and should not be used.                                        |
