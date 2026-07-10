
# Victor's Test Scenarios

## Scenario 3: Schedule a valid study session

A logged-in student opens a StudySync group workspace and enters a session title, valid start time, valid end time, and meeting location. The student then selects the **Schedule Session** button.

**Expected result:** The application submits the new study session, displays a success message, and adds the scheduled session to the group's upcoming sessions.

## Scenario 4: Reject an invalid study session

A logged-in student opens a StudySync group workspace and attempts to schedule a session with an end time that occurs before the selected start time.

**Expected result:** The application displays a validation message stating that the end time must occur after the start time. The invalid study session is not submitted or added to the group's upcoming sessions.

## Additional Checks

The test suite also verifies that the Study Sessions component loads the group's existing sessions and sends the correct group ID and authentication information when a valid study session is submitted.
