// Todoist API response types based on the schemas documentation

export interface Project {
  id: number;
  name: string;
  comment_count: number;
  order: number;
  color: number;
  shared: boolean;
  favorite: boolean;
  inbox_project?: boolean;
  team_inbox?: boolean;
  parent_id: number | null;
  sync_id: number;
  url: string;
}

export interface Section {
  id: number;
  project_id: number;
  order: number;
  name: string;
}

export interface TaskDue {
  string: string;
  date: string;
  datetime?: string;
  recurring: boolean;
  timezone?: string;
}

export interface Task {
  id: number;
  project_id: number;
  section_id: number | null;
  parent_id: number | null;
  content: string;
  description: string;
  completed: boolean;
  priority: number;
  due: TaskDue | null;
  label_ids: number[];
  url: string;
  order?: number;
  creator_id?: number;
  created_at?: string;
  assignee_id?: number;
}

export interface Comment {
  id: number;
  task_id: number | null;
  project_id: number | null;
  content: string;
  posted: string;
  attachment: object | null;
}

export interface Label {
  id: number;
  name: string;
  color: number;
  order: number;
  favorite: boolean;
}

// Request types for creating/updating resources
export interface CreateProjectRequest {
  name: string;
  parent_id?: number;
  color?: number;
  favorite?: boolean;
}

export interface UpdateProjectRequest {
  name?: string;
  color?: number;
  favorite?: boolean;
}

export interface CreateSectionRequest {
  name: string;
  project_id: number;
  order?: number;
}

export interface CreateTaskRequest {
  content: string;
  description?: string;
  project_id?: number;
  section_id?: number;
  parent_id?: number;
  label_ids?: number[];
  priority?: number;
  due_string?: string;
  due_date?: string;
  due_datetime?: string;
  due_lang?: string;
  assignee?: number;
}

export interface UpdateTaskRequest {
  content?: string;
  description?: string;
  project_id?: number;
  section_id?: number;
  parent_id?: number;
  label_ids?: number[];
  priority?: number;
  due_string?: string;
  due_date?: string;
  due_datetime?: string;
  due_lang?: string;
  assignee?: number;
}

export interface CreateCommentRequest {
  task_id?: number;
  project_id?: number;
  content: string;
  attachment?: object;
}

export interface CreateLabelRequest {
  name: string;
  color?: number;
  order?: number;
  favorite?: boolean;
}

export interface QuickAddRequest {
  text: string;
  note?: string;
  reminder?: string;
  project_id?: number;
  section_id?: number;
  parent_id?: number;
  due_lang?: string;
  priority?: number;
}

// Productivity and completion types
export interface CompletedTasksResponse {
  items: Task[];
  next_cursor?: string;
}

export interface ProductivityStats {
  karma: number;
  karma_trend: 'up' | 'down';
  days_items: Array<{
    day: string;
    completed: number;
  }>;
}

// Filter and query types
export interface TaskFilters {
  project_id?: number;
  section_id?: number;
  label_id?: number;
  filter?: string;
  ids?: number[];
}

export interface CompletionFilters {
  limit?: number;
  since?: string;
  until?: string;
}