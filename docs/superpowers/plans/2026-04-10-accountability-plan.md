# Implementation Plan: Accountability & Developer Day Tracker

## Phase 1: Core Tracking

### Task 1.1: Activity Types and Interfaces

**Files:** `src/accountability/types.ts`
**Effort:** 1 hour

- Define `ActivityType` union type
- Define `Activity` interface
- Define `DayReport`, `ActivitySummary`, `Goal`, `CalendarEvent` interfaces
- Export all types

### Task 1.2: Activity Tracker

**Files:** `src/accountability/tracker.ts`
**Effort:** 3 hours

- Implement `ActivityTracker` class
- `startActivity()` - create new activity with ID
- `endActivity()` - set endTime, calculate duration
- `pauseActivity()` / `resumeActivity()` - for explicit pauses
- `getCurrentActivity()` - return active activity
- `getTodayActivities()` - query activities for today
- `getActivitySummary()` - calculate time breakdown
- `getSessionStats()` - real-time session statistics
- Integration with storage layer

### Task 1.3: Activity Inferencer

**Files:** `src/accountability/inferencer.ts`
**Effort:** 2 hours

- Create `TOOL_ACTIVITY_MAP` for all 49 tools
- Implement `inferShellActivity()` with regex heuristics
- Implement activity grouping logic (5-minute window)
- Implement idle detection (30+ minutes = break)
- Integration with tool hooks

### Task 1.4: Storage Layer

**Files:** `src/accountability/storage.ts`
**Effort:** 2 hours

- Create `AccountabilityStore` class
- Store activities in `~/.null-agent/accountability/activities/{date}.json`
- Store goals in `~/.null-agent/accountability/goals/goals.json`
- Store config in `~/.null-agent/accountability/config.json`
- Load/save functions with JSON serialization

### Task 1.5: Integration with Agent

**Files:** `src/agent/loop.ts`, `src/tui/app.tsx`
**Effort:** 2 hours

- Add tool hook that calls `ActivityTracker.recordToolCall()`
- Add `afterToolCall` hook for activity recording
- Pass tracker instance to agent via config
- Test with existing tools

---

## Phase 2: Reporting

### Task 2.1: Reporter Class

**Files:** `src/accountability/reporter.ts`
**Effort:** 3 hours

- Implement `generateDailyReport()` - compile activities into DayReport
- Implement `generateWeeklyReport()` - aggregate daily reports
- Implement `getCurrentSessionStats()` - real-time stats
- Implement `exportToMarkdown()` - format as Markdown
- Implement `exportToCSV()` - format as CSV
- Implement `exportToJSON()` - format as JSON

### Task 2.2: TUI Status Bar Enhancement

**Files:** `src/tui/components/StatusBar.tsx`
**Effort:** 1 hour

- Add current activity and duration display
- Show activity type with icon
- Real-time updates every minute

### Task 2.3: TUI Daily Summary on Startup

**Files:** `src/tui/app.tsx`
**Effort:** 2 hours

- Show greeting on startup
- Display today's calendar events
- Display today's goals
- Show yesterday's summary
- Configurable in settings

---

## Phase 3: Accountability

### Task 3.1: Accountant Class

**Files:** `src/accountability/accountant.ts`
**Effort:** 3 hours

- Implement `checkUpcomingMeetings()` - check calendar, remind 5m before
- Implement `checkGoalProgress()` - compare against goals
- Implement `checkActivityPatterns()` - detect patterns (2+ hours debugging)
- Implement `challengeUser()` - proactive challenges
- Implement `celebrateWin()` - celebrate completions
- Implement `suggestBreak()` - break reminders

### Task 3.2: Goal Tracking

**Files:** `src/accountability/goals.ts`
**Effort:** 2 hours

- Create goals with type (daily/weekly/sprint)
- Update goal progress based on activities
- Track overdue goals
- Link goals to activities

### Task 3.3: Notification Integration

**Files:** `src/tui/components/Notification.tsx`, `src/tui/app.tsx`
**Effort:** 1 hour

- Add new notification types for time milestones
- Add notification types for goal reminders
- Add notification types for calendar alerts
- Wire up accountant notifications to TUI

---

## Phase 4: External Integrations

### Task 4.1: Google Calendar OAuth

**Files:** `src/accountability/integrations/calendar.ts`, `src/auth/index.ts`
**Effort:** 4 hours

- Implement OAuth 2.0 flow for Google Calendar
- Store tokens in credential system
- Token refresh logic
- `null-agent auth google` command

### Task 4.2: Calendar Sync

**Files:** `src/accountability/integrations/calendar.ts`
**Effort:** 3 hours

- `getEvents(date)` - fetch events for a day
- `getEventsInRange(start, end)` - fetch date range
- `watchCalendar()` - polling every 5 minutes
- Cache events locally
- Auto-convert to Activity records

### Task 4.3: Task Board Framework

**Files:** `src/accountability/integrations/tasks.ts`
**Effort:** 2 hours

- Define integration interface
- Implement Jira stub (for future)
- Implement Linear stub (for future)
- Goal creation from task board items

---

## Dependencies Between Tasks

```
Phase 1:
  1.1 (types) ──────────┐
  1.2 (tracker) ────────┤─── 1.5 (agent integration)
  1.3 (inferencer) ─────┤
  1.4 (storage) ────────┘

Phase 2:
  2.1 (reporter) ──── 2.2 (status bar) ──── 2.3 (daily summary)

Phase 3:
  3.1 (accountant) ──── 3.2 (goals) ──── 3.3 (notifications)

Phase 4:
  4.1 (oauth) ──── 4.2 (calendar sync) ──── 4.3 (task board)
```

---

## Testing Strategy

- Unit tests for each module (tracker, inferencer, reporter, accountant)
- Integration tests for tool hooks
- E2E test for TUI display
- Mock external APIs for calendar integration

---

## Files to Create

```
src/accountability/
├── index.ts
├── types.ts
├── tracker.ts
├── inferencer.ts
├── reporter.ts
├── accountant.ts
├── storage.ts
├── config.ts
├── integrations/
│   ├── index.ts
│   └── calendar.ts
└── goals.ts

tests/accountability/
├── tracker.test.ts
├── inferencer.test.ts
├── reporter.test.ts
├── accountant.test.ts
└── goals.test.ts
```

---

## Estimated Total Effort

Phase 1: ~10 hours
Phase 2: ~6 hours
Phase 3: ~6 hours
Phase 4: ~9 hours

**Total: ~31 hours (4 weeks of focused work)**
