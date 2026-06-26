# StudySync API Summary

Base URL: `http://localhost:4000/api`

## Auth

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login and receive token |

## Users

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users/me` | Get current user profile |
| PUT | `/users/me` | Update profile preferences |
| POST | `/users/me/courses` | Enroll in a course |
| DELETE | `/users/me/courses/:courseId` | Drop a course |
| GET | `/users/matches` | Find study partner matches |

## Courses

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/courses` | List courses |
| POST | `/courses` | Create course for demo/class use |

## Availability

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/availability/me` | Get current user's availability |
| PUT | `/availability/me` | Replace current user's availability |

## Groups

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/groups` | List groups |
| POST | `/groups` | Create group |
| GET | `/groups/:groupId` | Get group details |
| POST | `/groups/:groupId/join` | Request to join group |
| POST | `/groups/:groupId/approve` | Owner approves member |
| GET | `/groups/:groupId/sessions` | List group sessions |
| POST | `/groups/:groupId/sessions` | Create group session |
| GET | `/groups/:groupId/messages` | List messages |
| POST | `/groups/:groupId/messages` | Send message |
| POST | `/groups/:groupId/ratings` | Rate a group member |
