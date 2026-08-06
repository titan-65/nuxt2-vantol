# Null-Agent Accountability & Developer Day Tracker

## Context

Date: 2026-04-10
Status: Draft

## Overview

Add a comprehensive accountability and time-tracking system to null-agent. The agent becomes a self-aware developer companion that tracks activities, integrates with external tools, provides comprehensive reports, and keeps developers accountable for their daily work.

## Vision

Transform null-agent from a coding assistant into a **developer day companion** that understands the full lifecycle of a developer's day - from standup to deployment, from coding to meetings, from debugging to documentation.

---

## Activity Types

```typescript
type ActivityType =
  | "coding" // file_read, file_write, shell commands
  | "review" // code review, PR review
  | "debugging" // error investigation, shell debugging
  | "testing" // running tests, test frameworks
  | "docs" // README, comments, design docs
  | "meeting" // calendar events
  | "planning" // task boards, Jira tickets
  | "standup" // daily standup
  | "break" // no activity detected
  | "other";
```

---

## Architecture

### Module Structure

```
src/accountability/
├── index.ts              # Public API
├── types.ts              # Activity, DayReport, Goal interfaces
├── tracker.ts            # Core activity tracker
├── inferencer.ts         # Infers activity from tool usage
├── reporter.ts           # Report generation
├── accountant.ts         # Accountability engine
├── storage.ts            # Persistence layer
├── integrations/
│   ├── index.ts          # Integration registry
│   ├── calendar.ts       # Google Calendar API
│   ├── tasks.ts          # Jira/Linear (future)
│   └── messaging.ts      # Slack (future)
└── config.ts             # User configuration
```

### Data Models

```typescript
interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  source: "explicit" | "inferred" | "calendar" | "task-board";
  metadata?: {
    toolName?: string;
    filePath?: string;
    gitBranch?: string;
    commitHash?: string;
    calendarEventId?: string;
    taskId?: string;
  };
}

interface DayReport {
  date: string; // YYYY-MM-DD
  activities: Activity[];
  summary: ActivitySummary;
  goals?: Goal[];
  reflections?: string;
  calendarEvents?: CalendarEvent[];
}

interface ActivitySummary {
  totalCoding: number; // seconds
  totalMeetings: number;
  totalReviews: number;
  totalDebugging: number;
  totalDocs: number;
  totalTesting: number;
  totalOther: number;
  meetingsAttended: number;
  codeReviewsCompleted: number;
  issuesResolved: number;
  commitsMade: number;
}

interface Goal {
  id: string;
  description: string;
  type: "daily" | "weekly" | "sprint";
  status: "pending" | "in-progress" | "completed" | "missed";
  dueDate?: Date;
  completedDate?: Date;
  activities?: string[]; // Activity IDs linked to this goal
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  isRecurring: boolean;
  location?: string;
  description?: string;
}
```

---

## Components

### 1. Activity Tracker (`tracker.ts`)

**Core responsibilities:**

- Maintain current session state
- Record explicit activities ("I'm starting a meeting")
- Collect inferred activities from tool hooks
- Persist activity logs

**Interface:**

```typescript
class ActivityTracker {
  // Explicit tracking
  startActivity(type: ActivityType, description?: string): string;
  endActivity(activityId: string): void;
  pauseActivity(activityId: string): void;
  resumeActivity(activityId: string): void;

  // Inferred tracking
  recordToolCall(toolName: string, args: Record<string, unknown>, result: string): void;

  // Queries
  getCurrentActivity(): Activity | null;
  getTodayActivities(): Activity[];
  getActivitiesInRange(start: Date, end: Date): Activity[];
  getActivitySummary(date: string): ActivitySummary;
  getSessionStats(): SessionStats;

  // Configuration
  setTrackingMode(mode: "hybrid" | "explicit" | "implicit"): void;
}
```

### 2. Activity Inferencer (`inferencer.ts`)

**How it works:**

```typescript
const TOOL_ACTIVITY_MAP: Record<string, ActivityType> = {
  file_read: "coding",
  file_write: "coding",
  file_move: "coding",
  file_copy: "coding",
  file_delete: "coding",
  file_glob: "coding",
  shell: "coding", // context-dependent
  git_status: "coding",
  git_diff: "review",
  git_add: "coding",
  git_commit: "coding",
  git_log: "review",
  git_branch: "planning",
  git_show: "review",
  shell_test: "testing", // if command contains "test" or "jest"
  shell_build: "coding", // if command contains "build"
  shell_debug: "debugging", // if command contains "debug" or "log"
};

// Heuristics for shell commands
function inferShellActivity(command: string): ActivityType {
  const cmd = command.toLowerCase();
  if (/test|jest|vitest|mocha|pytest/.test(cmd)) return "testing";
  if (/debug|log|inspect|debugger/.test(cmd)) return "debugging";
  if (/build|compile|pack/.test(cmd)) return "coding";
  if (/deploy|release|publish/.test(cmd)) return "coding";
  if (/review|diff|status/.test(cmd)) return "review";
  return "coding";
}
```

**Activity grouping logic:**

- Group consecutive tool calls of the same type into one activity
- If tool calls are within 5 minutes, consider them the same activity
- If no tool calls for 30+ minutes, infer "break" or "meeting"

### 3. Google Calendar Integration (`calendar.ts`)

**OAuth 2.0 Setup:**

- User runs `null-agent auth google`
- Agent guides through OAuth flow
- Stores access token + refresh token in credential system
- Token refresh handled automatically

**API calls:**

- `getEvents(date: Date): Promise<CalendarEvent[]>`
- `getEventsInRange(start: Date, end: Date): Promise<CalendarEvent[]>`
- `watchCalendar(): void` (polling-based, check every 5 minutes)

**Usage:**

- Agent checks calendar every 5 minutes for upcoming events
- Before meeting: "You have a standup in 5 minutes"
- After meeting: "Meeting ended. What did you work on?"
- Calendar events auto-logged as "meeting" activities

### 4. Reporter (`reporter.ts`)

**Report types:**

```typescript
class Reporter {
  // Daily reports
  generateDailyReport(date: string): DayReport;
  formatDailyReport(report: DayReport): string; // Markdown

  // Weekly reports
  generateWeeklyReport(weekStart: string): WeeklyReport;
  formatWeeklyReport(report: WeeklyReport): string;

  // Real-time stats
  getCurrentSessionStats(): SessionStats;
  formatSessionStats(stats: SessionStats): string;

  // Export
  exportToMarkdown(report: DayReport): string;
  exportToCSV(report: DayReport): string;
  exportToJSON(report: DayReport): string;
}

interface SessionStats {
  sessionDuration: number;
  currentActivity: Activity | null;
  activitiesToday: number;
  timeByType: Record<ActivityType, number>;
  longestStreak: number; // longest coding session without break
  breaksToday: number;
  calendarEventsToday: number;
}
```

**Daily report format:**

```markdown
# Daily Report - April 10, 2026

## Summary

- **Active time:** 6h 45m
- **Activities:** 12
- **Commits:** 3
- **Code reviews:** 2

## Time Breakdown

| Activity  | Time   | %   |
| --------- | ------ | --- |
| Coding    | 3h 20m | 49% |
| Meetings  | 1h 30m | 22% |
| Reviews   | 45m    | 11% |
| Debugging | 30m    | 7%  |
| Docs      | 20m    | 5%  |
| Other     | 20m    | 6%  |

## Activities

- 9:00 AM - 9:15 AM: Morning standup
- 9:15 AM - 10:30 AM: Feature implementation (auth module)
- 10:30 AM - 11:00 AM: Code review (PR #42)
- 11:00 AM - 12:00 PM: Debugging (API timeout)
- 12:00 PM - 1:00 PM: Lunch break
- 1:00 PM - 2:00 PM: Meeting (product sync)
- 2:00 PM - 4:00 PM: Feature implementation (dashboard)
- 4:00 PM - 4:30 PM: Documentation
- 4:30 PM - 5:00 PM: Code review (PR #38)

## Goals

- [x] Complete auth module refactor
- [ ] Review PR #42 (pending)
- [x] Fix API timeout issue
```

### 5. Accountability Engine (`accountant.ts`)

**Proactive reminders:**

```typescript
class Accountant {
  // Check schedule and remind
  checkUpcomingMeetings(): Notification[]; // "Standup in 5 minutes"
  checkGoalProgress(): Notification[]; // "You haven't committed yet today"
  checkActivityPatterns(): Notification[]; // "You've been debugging for 2 hours"
  checkDailyRituals(): Notification[]; // "Time to check Slack messages"

  // Accountability
  challengeUser(goal: Goal): string; // "You said you'd review code today, haven't seen any yet"
  celebrateWin(activity: Activity): string; // "Great job! You resolved 3 issues today"
  suggestBreak(): string; // "You've been coding for 2 hours straight"

  // Goal tracking
  createGoal(description: string, type: GoalType): Goal;
  updateGoalProgress(goalId: string): void;
  getOverdueGoals(): Goal[];
  getTodaysGoals(): Goal[];
}
```

**Notification types:**

- `time:milestone` - "You've been coding for 1 hour"
- `time:threshold` - "Consider taking a break (2+ hours active)"
- `goal:reminder` - "Your goal was to review 3 PRs today"
- `goal:completed` - "Goal completed: Feature implemented"
- `calendar:upcoming` - "Meeting in 5 minutes"
- `activity:streak` - "4-hour coding streak!"
- `daily:start` - "Good morning! Here's your plan for today"
- `daily:end` - "Day summary ready. Want to see it?"

### 6. Storage (`storage.ts`)

```
~/.null-agent/
├── accountability/
│   ├── activities/
│   │   ├── 2026-04-10.json      # Daily activity log
│   │   └── 2026-04-11.json
│   ├── reports/
│   │   ├── daily/
│   │   │   ├── 2026-04-10.md    # Generated reports
│   │   │   └── 2026-04-10.csv
│   │   └── weekly/
│   │       └── 2026-w15.md
│   ├── goals/
│   │   └── goals.json           # Active goals
│   ├── calendar/
│   │   └── events.json          # Cached calendar events
│   └── config.json              # Tracking preferences
```

---

## TUI Integration

### StatusBar Enhancement

```
╭────────────────────────────────────────────────────────────────────────────────────────────╮
│ null-agent  v0.4.0  · null-agent (main) ●  coding 3h 20m                                   │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
```

### Face Mood by Activity

| Activity  | Face Mood |
| --------- | --------- |
| coding    | executing |
| meeting   | waiting   |
| review    | thinking  |
| debugging | confused  |
| testing   | loading   |
| break     | sleeping  |
| standup   | idle      |

### Daily Summary on Startup

```
╭────────────────────────────────────────────────────────────────────────────────────────────╮
│ Good morning! Here's your day:                                                              │
│                                                                                               │
│ Meetings:                                                                                      │
│   - 9:00 AM: Daily standup (15m)                                                             │
│   - 2:00 PM: Product sync (1h)                                                               │
│                                                                                               │
│ Goals:                                                                                         │
│   - Complete auth refactor                                                                   │
│   - Review 2 PRs                                                                             │
│                                                                                               │
│ Yesterday:                                                                                     │
│   - 5h coding, 2h meetings, 45m debugging                                                    │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
```

---

## Configuration

```json
{
  "tracking": {
    "mode": "hybrid",
    "autoInfer": true,
    "idleThresholdMinutes": 30,
    "activityGroupingMinutes": 5
  },
  "reminders": {
    "upcomingMeetings": true,
    "meetingReminderMinutes": 5,
    "breakReminders": true,
    "breakThresholdMinutes": 120,
    "dailyStartSummary": true,
    "dailyEndSummary": true,
    "goalReminders": true
  },
  "reports": {
    "autoGenerate": true,
    "format": ["markdown", "csv"],
    "includeCalendar": true,
    "includeGitStats": true
  },
  "integrations": {
    "googleCalendar": {
      "enabled": false,
      "syncIntervalMinutes": 5
    },
    "jira": {
      "enabled": false
    },
    "slack": {
      "enabled": false
    }
  }
}
```

---

## Implementation Phases

### Phase 1: Core Tracking (Week 1)

- Activity types and interfaces
- ActivityTracker class
- ActivityInferencer (tool hooks integration)
- Storage layer
- Basic explicit tracking commands

### Phase 2: Reporting (Week 2)

- Reporter class
- Daily reports (Markdown, CSV)
- Weekly reports
- Session stats
- TUI integration (StatusBar, startup summary)

### Phase 3: Accountability (Week 3)

- Accountant class
- Goal tracking
- Proactive reminders
- Activity pattern analysis
- Notification system integration

### Phase 4: External Integrations (Week 4)

- Google Calendar OAuth
- Calendar sync and event awareness
- Meeting reminders
- Task board integration framework

---

## Success Criteria

1. Agent can track activities explicitly and infer from tool usage
2. Daily reports are accurate and comprehensive
3. Proactive reminders work without being annoying
4. Google Calendar integration syncs events
5. TUI shows real-time activity status
6. All 182 tests pass + new accountability tests pass
