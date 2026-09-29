# Submission Notes

## Completed

- Added unit tests for taskService
- Added integration tests using Supertest
- Added happy-path tests for API endpoints
- Added edge-case tests
- Added test coverage
- Identified and fixed the pagination offset bug
- Added PATCH /tasks/:id/assign
- Added assignee validation
- Added tests for task assignment
- Added bug report documenting the pagination issue

## Testing

Tests were written using Jest and Supertest.

Task service functions were tested directly using unit tests, while API behavior was tested through HTTP endpoints using Supertest.

The test suite currently contains 30 passing tests.

Overall test coverage is above the requested 80% target.

## What I Would Test Next

If this were a production system, I would add tests for:

- Authentication and authorization
- Concurrent task updates
- Invalid pagination values
- Very large datasets
- Database failures
- Rate limiting
- Input payload size limits
- API response schema validation

## Observations

The application uses an in-memory task store, so task data is lost whenever the application restarts.

The separation between routes and the task service makes the business logic easier to test independently from HTTP behavior.
