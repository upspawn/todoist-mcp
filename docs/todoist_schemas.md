# Todoist REST API – Endpoint Schemas

This document captures the **request** (input) and **response** (output) schemas for the Todoist REST API endpoints that this MCP server will call.

Notation:
* All objects are described using **JSON Schema–inspired tables** (field, type, description).
* Unless stated otherwise, every request must include the HTTP header `Authorization: Bearer <TOKEN>`.
* Date/time strings follow RFC 3339 in UTC.

---

## 1. Projects

### 1.1 List Projects
* **Method / Path:** `GET /projects`
* **Request Body:** *none*
* **Response (200 – application/json):** `Project[]`

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Project ID |
| name | string | Display name |
| comment_count | integer | Number of comments |
| order | integer | Sort position |
| color | integer | Color id (see Colors guide) |
| shared | boolean | Whether project is shared |
| favorite | boolean | Marked as favorite |
| inbox_project | boolean | *optional* – project is Inbox |
| team_inbox | boolean | *optional* – project is Team Inbox |
| parent_id | integer \| null | Parent project id |
| sync_id | integer | Cross-account id (shared projects) |
| url | string | Web link |

---

### 1.2 Create Project
* **Method / Path:** `POST /projects`
* **Request Headers:** `Content-Type: application/json`
* **Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✔ | Project name |
| parent_id | integer |   | Parent project id |
| color | integer |   | Color id |
| favorite | boolean |   | Add to favorites |

* **Response (200):** `Project` object (see 1.1 schema).

---

### 1.3 Get Project
`GET /projects/{project_id}` → returns single `Project` object.

### 1.4 Update Project
`POST /projects/{project_id}` with JSON body:

| Field | Type | Description |
|-------|------|-------------|
| name | string | New name |
| color | integer | Color id |
| favorite | boolean | Favorite flag |

Response: **204 No Content**.

### 1.5 Delete Project
`DELETE /projects/{project_id}` → **204 No Content**

---

## 2. Sections

### 2.1 List Sections
`GET /sections?project_id={project_id}` → `Section[]`

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Section id |
| project_id | integer | Owning project |
| order | integer | Sort position |
| name | string | Section name |

### 2.2 Create Section
`POST /sections`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✔ | Section name |
| project_id | integer | ✔ | Owning project |
| order | integer |   | Sort position |

Response: `Section` object.

… *(Update / Delete follow same patterns as projects)* …

---

## 3. Tasks

### 3.1 List Active Tasks
`GET /tasks` *(supports query params `project_id`, `section_id`, `label_id`, `filter`, `ids`)* → `Task[]`

Task object (subset):

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Task id |
| project_id | integer | Owning project |
| section_id | integer\|null | Owning section |
| parent_id | integer\|null | Parent task id |
| content | string | Task content (Markdown) |
| description | string | Long description |
| completed | boolean | Completion flag |
| priority | integer | 1–4 |
| due | object\|null | Due struct (see below) |
| label_ids | integer[] | Labels |
| url | string | Web link |

`due` object:

| Field | Type | Description |
|-------|------|-------------|
| string | string | Human text |
| date | string | `YYYY-MM-DD` |
| datetime | string | RFC3339 timestamp (if time-specific) |
| recurring | boolean | Recurring flag |
| timezone | string | TZ database name or `UTC±HH:MM` |

---

### 3.2 Create Task
`POST /tasks` (JSON)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | ✔ | Task text |
| description | string |   | Long description |
| project_id | integer |   | Project (defaults Inbox) |
| section_id | integer |   | Section id |
| parent_id | integer |   | Parent task id |
| label_ids | integer[] |   | Labels |
| priority | integer |   | 1–4 |
| due_string | string |   | Natural-language due date |
| due_date | string |   | `YYYY-MM-DD` |
| due_datetime | string |   | RFC3339 datetime (UTC) |
| due_lang | string |   | 2-letter language code |
| assignee | integer |   | Responsible user id |

Response: `Task` object (see 3.1).

---

### 3.3 Get / Update / Close / Reopen / Delete Task
* `GET /tasks/{task_id}` → `Task`
* `POST /tasks/{task_id}` (body fields same as 3.2) → **204**
* `POST /tasks/{task_id}/close` → **204**
* `POST /tasks/{task_id}/reopen` → **204**
* `DELETE /tasks/{task_id}` → **204**

---

## 4. Comments

### 4.1 List Comments
`GET /comments?task_id={id}` or `project_id={id}` → `Comment[]`

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Comment id |
| task_id | integer\|null | Task reference |
| project_id | integer\|null | Project reference |
| content | string | Markdown text |
| posted | string | RFC3339 timestamp |
| attachment | object\|null | File attachment meta |

### 4.2 Create Comment
`POST /comments` (JSON)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| task_id | integer | ✔* | Task id (or `project_id`) |
| project_id | integer | ✔* | Project id (or `task_id`) |
| content | string | ✔ | Comment text |
| attachment | object |   | As returned in 4.1 |

Response: `Comment` object.

Update (`POST /comments/{id}`) & Delete (`DELETE /comments/{id}`) follow standard 204 pattern.

---

## 5. Labels

Endpoints mirror Projects pattern; see quick-reference for paths.

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Label id |
| name | string | Label text |
| color | integer | Color id |
| order | integer | Sort order |
| favorite | boolean | Favorite flag |

---

### Rate Limits (applies to all endpoints)
* **450 requests per user / 15 minutes**
* **1 MiB** max request body size.
* **65 KiB** max headers size.
* **15 s** processing timeout per call.

---

## 6. Quick Add

### 6.1 Quick Add Task
* **Method / Path:** `POST /quick/add`
* **Headers:** `Content-Type: application/json`

Request body parameters:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | ✔ | Natural-language input describing the task (e.g., "Submit report by Fri 5pm #Work p2") |
| note | string |   | Initial note/comment added to the task |
| reminder | string |   | Reminder spec, same syntax as in UI (`!30 min before`) |
| project_id | integer |   | Override project |
| section_id | integer |   | Override section |
| parent_id | integer |   | Make this a sub-task of `parent_id` |
| due_lang | string |   | Language for date parsing (2-letter code) |
| priority | integer |   | 1–4 priority override |

* **Response (200):** Standard `Task` object (see §3) of the newly created task.

---

## 7. Completed & Productivity Endpoints

### 7.1 Get Completed Tasks (All)
`GET /completed/get_all?limit={n}&since={RFC3339}`

Query parameters:
| Param | Description |
|-------|-------------|
| limit | Max number of items (default 30, max 200) |
| since | Only tasks completed *after* this timestamp |

Response:
```
{
  "items": [ /* Task objects (subset) */ ],
  "next_cursor": "…"
}
```

### 7.2 Get Completed Tasks by Project
`GET /completed/get_project?project_id={id}&limit={n}&until={date}`

• `project_id` (integer) – required

Other params same as 7.1. Response object identical shape.

### 7.3 Get Productivity Stats
`GET /completed/get_stats`

Returns aggregate stats such as daily completions and karma:
```
{
  "karma": 4150,
  "karma_trend": "up",
  "days_items": [ { "day": "2025-07-29", "completed": 12 }, … ]
}
```

---

### Rate Limits (applies to all endpoints)
> • Fill in any remaining endpoints (productivity stats, collaborators, quick-add, etc.) as your implementation grows.
> • Keep this file in sync with the Todoist docs if the API evolves.
