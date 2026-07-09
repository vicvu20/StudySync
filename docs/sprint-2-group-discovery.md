# Sprint 2 Feature: Group Discovery Search and Filters

## Summary

This feature adds client-side study group discovery tools to the Groups page. Students can narrow the list of available groups without reloading the page.

## User-facing behavior

- Search across group title, description, study goal, location, course code, and course title.
- Filter by a specific course.
- Filter by meeting mode: in person, online, or hybrid.
- Sort by most sessions, most members, most open seats, or title.
- See a live result count.
- Clear active filters in one click.
- See a helpful empty state when no groups match.

## Installation

From the StudySync repository root:

```bash
node scripts/install-group-discovery.mjs
```

The installer modifies `frontend/src/pages/GroupsPage.tsx` to connect the new filter component to the existing Groups page.

## Manual test checklist

1. Log in and open the Groups page.
2. Type part of a course code or group title into the search field.
3. Confirm that only matching group cards remain visible.
4. Select a course and confirm the results narrow to that course.
5. Select each meeting mode and confirm the results update.
6. Try each sort option and confirm the card order changes.
7. Combine search, course, and meeting mode filters.
8. Click **Clear filters** and confirm all groups return.
9. Enter a query with no matches and confirm the empty-state message appears.
