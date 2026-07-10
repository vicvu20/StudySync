# Jessica's Test Scenarios

## Scenario 1: Search for a study group

A logged-in student opens the Groups page and enters `CSC 4350` into the
group search field.

**Expected result:** The filter component sends an updated filter state
containing the entered search query.

## Scenario 2: Filter by meeting mode

A logged-in student opens the Groups page and selects `Online` from the
meeting-mode dropdown.

**Expected result:** The filter component sends an updated filter state with
`meetingMode` set to `ONLINE`.

## Additional checks

The test suite also verifies the live result count and the Clear Filters button.
