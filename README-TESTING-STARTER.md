# StudySync Testing Starter

This package adds Jessica's Group Discovery unit tests and the shared frontend
testing setup. It also includes a documented template that Victor can copy
into his own test file and commit from his own branch.

## Install

From the root of the StudySync repository, copy these files into the matching
folders. Then run:

```bash
node scripts/install-frontend-testing.mjs
npm install
npm run test:run --workspace frontend
```

## Jessica's active tests

`frontend/src/components/GroupDiscoveryFilters.test.tsx`

These tests cover:

1. Searching for a study group.
2. Filtering by online meeting mode.
3. Displaying the live result count.
4. Clearing active filters.

## Victor's template

Victor should open:

`docs/testing/VICTOR-SESSION-TEST-TEMPLATE.md`

He should copy the test code into:

`frontend/src/components/GroupSessions.test.tsx`

He should make and push that file from his own branch so the Git history shows
his individual test contribution.

## Suggested Jessica commit

```bash
git add frontend/package.json package-lock.json
git add frontend/vitest.config.ts
git add frontend/src/test/setup.ts
git add frontend/src/components/GroupDiscoveryFilters.test.tsx
git add docs/testing
git add scripts/install-frontend-testing.mjs
git commit -m "test: add group discovery unit tests and shared test setup"
```
