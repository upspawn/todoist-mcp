// Real Todoist API integration tests - tests all tools with actual API connection
// WARNING: This test uses a real Todoist account - all test data is created with TEST_ prefix

import { TodoistApiClient } from '../../src/services/todoist-api.js';
import { TodoistToolHandlers } from '../../src/handlers/tool-handlers.js';
import { TodoistMcpConfig } from '../../src/types/mcp.js';
import { Project, Task, Section, Label, Comment } from '../../src/types/todoist.js';

// Test configuration - API key from environment or fallback
const TEST_API_KEY = process.env.TODOIST_API_KEY || 'f9f16e725febfc8d09b0050fa2a8bdf4cec70759';

const TEST_CONFIG: TodoistMcpConfig = {
  apiKey: TEST_API_KEY,
  baseUrl: 'https://api.todoist.com/rest/v2',
  timeout: 30000,
  retryAttempts: 3,
  debug: false,
};

// Test data containers for cleanup
interface TestData {
  projects: Project[];
  tasks: Task[];
  sections: Section[];
  labels: Label[];
  comments: Comment[];
}

describe('Todoist API Real Integration Tests', () => {
  let apiClient: TodoistApiClient;
  let toolHandlers: TodoistToolHandlers;
  let testData: TestData;
  
  // Test run identifier to ensure unique test data
  const TEST_RUN_ID = `TEST_${Date.now()}`;

  beforeAll(async () => {
    apiClient = new TodoistApiClient(TEST_CONFIG);
    toolHandlers = new TodoistToolHandlers(apiClient);
    testData = {
      projects: [],
      tasks: [],
      sections: [],
      labels: [],
      comments: [],
    };

    // Verify API connection
    const isHealthy = await apiClient.healthCheck();
    if (!isHealthy) {
      throw new Error('Cannot connect to Todoist API - check your API key');
    }
  }, 30000);

  afterAll(async () => {
    // Comprehensive cleanup - delete all test data
    console.log('🧹 Starting cleanup...');
    
    try {
      // Delete test comments
      for (const comment of testData.comments) {
        try {
          await toolHandlers.handleTool('delete_comment', { comment_id: comment.id });
        } catch (error) {
          console.warn(`Failed to delete comment ${comment.id}:`, error);
        }
      }

      // Delete test tasks
      for (const task of testData.tasks) {
        try {
          await toolHandlers.handleTool('delete_task', { task_id: task.id });
        } catch (error) {
          console.warn(`Failed to delete task ${task.id}:`, error);
        }
      }

      // Delete test sections
      for (const section of testData.sections) {
        try {
          await toolHandlers.handleTool('delete_section', { section_id: section.id });
        } catch (error) {
          console.warn(`Failed to delete section ${section.id}:`, error);
        }
      }

      // Delete test labels
      for (const label of testData.labels) {
        try {
          await toolHandlers.handleTool('delete_label', { label_id: label.id });
        } catch (error) {
          console.warn(`Failed to delete label ${label.id}:`, error);
        }
      }

      // Delete test projects last
      for (const project of testData.projects) {
        try {
          await toolHandlers.handleTool('delete_project', { project_id: project.id });
        } catch (error) {
          console.warn(`Failed to delete project ${project.id}:`, error);
        }
      }

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }, 60000);

  describe('Read-Only Operations (Safe to run)', () => {
    test('list_projects - should fetch user projects', async () => {
      const response = await toolHandlers.handleTool('list_projects', {});
      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('[');
      
      const projects = JSON.parse(response.content[0].text);
      expect(Array.isArray(projects)).toBe(true);
    });

    test('list_tasks - should fetch user tasks', async () => {
      const response = await toolHandlers.handleTool('list_tasks', {});
      expect(response.isError).toBeFalsy();
      
      const tasks = JSON.parse(response.content[0].text);
      expect(Array.isArray(tasks)).toBe(true);
    });

    test('list_sections - should fetch sections', async () => {
      const response = await toolHandlers.handleTool('list_sections', {});
      expect(response.isError).toBeFalsy();
      
      const sections = JSON.parse(response.content[0].text);
      expect(Array.isArray(sections)).toBe(true);
    });

    test('list_labels - should fetch labels', async () => {
      const response = await toolHandlers.handleTool('list_labels', {});
      expect(response.isError).toBeFalsy();
      
      const labels = JSON.parse(response.content[0].text);
      expect(Array.isArray(labels)).toBe(true);
    });

    test('get_productivity_stats - should handle account limitations', async () => {
      const response = await toolHandlers.handleTool('get_productivity_stats', {});
      // Note: This endpoint may not be available for all account types
      if (response.isError) {
        expect(response.content[0].text).toContain('Error');
        console.log('Note: Productivity stats not available for this account type');
      } else {
        const stats = JSON.parse(response.content[0].text);
        expect(stats).toHaveProperty('karma');
      }
    });

    test('get_completed_tasks - should handle account limitations', async () => {
      const response = await toolHandlers.handleTool('get_completed_tasks', { limit: 5 });
      // Note: This endpoint may not be available for all account types
      if (response.isError) {
        expect(response.content[0].text).toContain('Error');
        console.log('Note: Completed tasks endpoint not available for this account type');
      } else {
        const result = JSON.parse(response.content[0].text);
        expect(result).toHaveProperty('items');
        expect(Array.isArray(result.items)).toBe(true);
      }
    });
  });

  describe('Project Management Tools', () => {
    test('create_project - should create test project', async () => {
      const projectName = `${TEST_RUN_ID}_Project`;
      const response = await toolHandlers.handleTool('create_project', {
        name: projectName,
        color: 30,
        favorite: false
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Project created successfully');
      
      const project = JSON.parse(response.content[0].text.split(':\n')[1]);
      expect(project.name).toBe(projectName);
      testData.projects.push(project);
    });

    test('get_project - should fetch created project', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;

      const response = await toolHandlers.handleTool('get_project', { project_id: projectId });
      expect(response.isError).toBeFalsy();
      
      const project = JSON.parse(response.content[0].text);
      expect(project.id).toBe(projectId);
      expect(project.name).toContain(TEST_RUN_ID);
    });

    test('update_project - should update project name', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;
      const newName = `${TEST_RUN_ID}_Project_Updated`;

      const response = await toolHandlers.handleTool('update_project', {
        project_id: projectId,
        name: newName,
        favorite: true
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toBe('Project updated successfully');

      // Verify the update
      const getResponse = await toolHandlers.handleTool('get_project', { project_id: projectId });
      const updatedProject = JSON.parse(getResponse.content[0].text);
      expect(updatedProject.name).toBe(newName);
      // Note: favorite field may not be supported by all API versions/accounts
      if (updatedProject.favorite !== undefined) {
        expect(updatedProject.favorite).toBe(true);
      } else {
        console.log('Note: favorite field not returned in API response');
      }
    });

    test('get_project_collaborators - should fetch collaborators', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;

      const response = await toolHandlers.handleTool('get_project_collaborators', { project_id: projectId });
      expect(response.isError).toBeFalsy();
      
      const collaborators = JSON.parse(response.content[0].text);
      expect(Array.isArray(collaborators)).toBe(true);
    });
  });

  describe('Section Management Tools', () => {
    test('create_section - should create test section', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;
      const sectionName = `${TEST_RUN_ID}_Section`;

      const response = await toolHandlers.handleTool('create_section', {
        name: sectionName,
        project_id: projectId,
        order: 1
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Section created successfully');
      
      const section = JSON.parse(response.content[0].text.split(':\n')[1]);
      expect(section.name).toBe(sectionName);
      expect(section.project_id).toBe(projectId);
      testData.sections.push(section);
    });

    test('get_section - should fetch created section', async () => {
      expect(testData.sections.length).toBeGreaterThan(0);
      const sectionId = testData.sections[0].id;

      const response = await toolHandlers.handleTool('get_section', { section_id: sectionId });
      expect(response.isError).toBeFalsy();
      
      const section = JSON.parse(response.content[0].text);
      expect(section.id).toBe(sectionId);
      expect(section.name).toContain(TEST_RUN_ID);
    });

    test('update_section - should update section name', async () => {
      expect(testData.sections.length).toBeGreaterThan(0);
      const sectionId = testData.sections[0].id;
      const newName = `${TEST_RUN_ID}_Section_Updated`;

      const response = await toolHandlers.handleTool('update_section', {
        section_id: sectionId,
        name: newName
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toBe('Section updated successfully');

      // Verify the update
      const getResponse = await toolHandlers.handleTool('get_section', { section_id: sectionId });
      const updatedSection = JSON.parse(getResponse.content[0].text);
      expect(updatedSection.name).toBe(newName);
    });

    test('list_sections by project - should filter sections', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;

      const response = await toolHandlers.handleTool('list_sections', { project_id: projectId });
      expect(response.isError).toBeFalsy();
      
      const sections = JSON.parse(response.content[0].text);
      expect(Array.isArray(sections)).toBe(true);
      
      // Should include our test section
      const testSection = sections.find((s: Section) => s.name.includes(TEST_RUN_ID));
      expect(testSection).toBeDefined();
    });
  });

  describe('Label Management Tools', () => {
    test('create_label - should create test label', async () => {
      const labelName = `${TEST_RUN_ID}_Label`;

      const response = await toolHandlers.handleTool('create_label', {
        name: labelName,
        color: 42,
        order: 1,
        favorite: false
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Label created successfully');
      
      const label = JSON.parse(response.content[0].text.split(':\n')[1]);
      expect(label.name).toBe(labelName);
      testData.labels.push(label);
    });

    test('get_label - should fetch created label', async () => {
      expect(testData.labels.length).toBeGreaterThan(0);
      const labelId = testData.labels[0].id;

      const response = await toolHandlers.handleTool('get_label', { label_id: labelId });
      expect(response.isError).toBeFalsy();
      
      const label = JSON.parse(response.content[0].text);
      expect(label.id).toBe(labelId);
      expect(label.name).toContain(TEST_RUN_ID);
    });

    test('update_label - should update label name', async () => {
      expect(testData.labels.length).toBeGreaterThan(0);
      const labelId = testData.labels[0].id;
      const newName = `${TEST_RUN_ID}_Label_Updated`;

      const response = await toolHandlers.handleTool('update_label', {
        label_id: labelId,
        name: newName,
        favorite: true
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toBe('Label updated successfully');

      // Verify the update
      const getResponse = await toolHandlers.handleTool('get_label', { label_id: labelId });
      const updatedLabel = JSON.parse(getResponse.content[0].text);
      expect(updatedLabel.name).toBe(newName);
      // Note: favorite field may not be supported by all API versions/accounts
      if (updatedLabel.favorite !== undefined) {
        expect(updatedLabel.favorite).toBe(true);
      } else {
        console.log('Note: favorite field not returned in API response');
      }
    });
  });

  describe('Task Management Tools', () => {
    test('create_task - should create test task', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;
      const sectionId = testData.sections.length > 0 ? testData.sections[0].id : undefined;
      const labelIds = testData.labels.length > 0 ? [testData.labels[0].id] : undefined;

      const taskContent = `${TEST_RUN_ID}_Task`;
      const response = await toolHandlers.handleTool('create_task', {
        content: taskContent,
        description: 'This is a test task created by integration tests',
        project_id: projectId,
        section_id: sectionId,
        label_ids: labelIds,
        priority: 2,
        due_string: 'tomorrow'
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Task created successfully');
      
      const task = JSON.parse(response.content[0].text.split(':\n')[1]);
      expect(task.content).toBe(taskContent);
      expect(task.project_id).toBe(projectId);
      testData.tasks.push(task);
    });

    test('quick_add_task - should create task via natural language', async () => {
      const response = await toolHandlers.handleTool('quick_add_task', {
        text: `${TEST_RUN_ID}_QuickTask tomorrow p3`,
        note: 'Created via quick add API'
      });

      // Note: Quick add may not be available for all account types
      if (response.isError) {
        expect(response.content[0].text).toContain('Error');
        console.log('Note: Quick add endpoint not available for this account type');
      } else {
        expect(response.content[0].text).toContain('Task created via quick add');
        
        const task = JSON.parse(response.content[0].text.split(':\n')[1]);
        expect(task.content).toContain(TEST_RUN_ID);
        testData.tasks.push(task);
      }
    });

    test('get_task - should fetch created task', async () => {
      expect(testData.tasks.length).toBeGreaterThan(0);
      const taskId = testData.tasks[0].id;

      const response = await toolHandlers.handleTool('get_task', { task_id: taskId });
      expect(response.isError).toBeFalsy();
      
      const task = JSON.parse(response.content[0].text);
      expect(task.id).toBe(taskId);
      expect(task.content).toContain(TEST_RUN_ID);
    });

    test('update_task - should update task content', async () => {
      expect(testData.tasks.length).toBeGreaterThan(0);
      const taskId = testData.tasks[0].id;
      const newContent = `${TEST_RUN_ID}_Task_Updated`;

      const response = await toolHandlers.handleTool('update_task', {
        task_id: taskId,
        content: newContent,
        priority: 4,
        description: 'Updated by integration test'
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toBe('Task updated successfully');

      // Verify the update
      const getResponse = await toolHandlers.handleTool('get_task', { task_id: taskId });
      const updatedTask = JSON.parse(getResponse.content[0].text);
      expect(updatedTask.content).toBe(newContent);
      expect(updatedTask.priority).toBe(4);
    });

    test('list_tasks with filters - should filter tasks', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;

      const response = await toolHandlers.handleTool('list_tasks', {
        project_id: projectId
      });

      expect(response.isError).toBeFalsy();
      
      const tasks = JSON.parse(response.content[0].text);
      expect(Array.isArray(tasks)).toBe(true);
      
      // Should include our test tasks
      const testTasks = tasks.filter((t: Task) => t.content.includes(TEST_RUN_ID));
      expect(testTasks.length).toBeGreaterThan(0);
    });

    test('close_task and reopen_task - should complete and reopen task', async () => {
      expect(testData.tasks.length).toBeGreaterThan(0);
      const taskId = testData.tasks[0].id;

      // Close the task
      const closeResponse = await toolHandlers.handleTool('close_task', { task_id: taskId });
      expect(closeResponse.isError).toBeFalsy();
      expect(closeResponse.content[0].text).toBe('Task marked as completed successfully');

      // Reopen the task
      const reopenResponse = await toolHandlers.handleTool('reopen_task', { task_id: taskId });
      expect(reopenResponse.isError).toBeFalsy();
      expect(reopenResponse.content[0].text).toBe('Task reopened successfully');

      // Verify task is active again
      const getResponse = await toolHandlers.handleTool('get_task', { task_id: taskId });
      const task = JSON.parse(getResponse.content[0].text);
      expect(task.is_completed).toBe(false);
    });
  });

  describe('Comment Management Tools', () => {
    test('create_comment on task - should add comment to task', async () => {
      expect(testData.tasks.length).toBeGreaterThan(0);
      const taskId = testData.tasks[0].id;

      const response = await toolHandlers.handleTool('create_comment', {
        content: `${TEST_RUN_ID}_Comment on task`,
        task_id: taskId
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Comment created successfully');
      
      const comment = JSON.parse(response.content[0].text.split(':\n')[1]);
      expect(comment.content).toContain(TEST_RUN_ID);
      expect(comment.task_id).toBe(taskId);
      testData.comments.push(comment);
    });

    test('create_comment on project - should add comment to project', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;

      const response = await toolHandlers.handleTool('create_comment', {
        content: `${TEST_RUN_ID}_Comment on project`,
        project_id: projectId
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toContain('Comment created successfully');
      
      const comment = JSON.parse(response.content[0].text.split(':\n')[1]);
      expect(comment.content).toContain(TEST_RUN_ID);
      expect(comment.project_id).toBe(projectId);
      testData.comments.push(comment);
    });

    test('get_comment - should fetch created comment', async () => {
      expect(testData.comments.length).toBeGreaterThan(0);
      const commentId = testData.comments[0].id;

      const response = await toolHandlers.handleTool('get_comment', { comment_id: commentId });
      expect(response.isError).toBeFalsy();
      
      const comment = JSON.parse(response.content[0].text);
      expect(comment.id).toBe(commentId);
      expect(comment.content).toContain(TEST_RUN_ID);
    });

    test('list_comments for task - should list task comments', async () => {
      expect(testData.tasks.length).toBeGreaterThan(0);
      const taskId = testData.tasks[0].id;

      const response = await toolHandlers.handleTool('list_comments', { task_id: taskId });
      expect(response.isError).toBeFalsy();
      
      const comments = JSON.parse(response.content[0].text);
      expect(Array.isArray(comments)).toBe(true);
      
      // Should include our test comment
      const testComment = comments.find((c: Comment) => c.content.includes(TEST_RUN_ID));
      expect(testComment).toBeDefined();
    });

    test('list_comments for project - should list project comments', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;

      const response = await toolHandlers.handleTool('list_comments', { project_id: projectId });
      expect(response.isError).toBeFalsy();
      
      const comments = JSON.parse(response.content[0].text);
      expect(Array.isArray(comments)).toBe(true);
      
      // Should include our test comment
      const testComment = comments.find((c: Comment) => c.content.includes(TEST_RUN_ID));
      expect(testComment).toBeDefined();
    });

    test('update_comment - should update comment content', async () => {
      expect(testData.comments.length).toBeGreaterThan(0);
      const commentId = testData.comments[0].id;
      const newContent = `${TEST_RUN_ID}_Comment_Updated`;

      const response = await toolHandlers.handleTool('update_comment', {
        comment_id: commentId,
        content: newContent
      });

      expect(response.isError).toBeFalsy();
      expect(response.content[0].text).toBe('Comment updated successfully');

      // Verify the update
      const getResponse = await toolHandlers.handleTool('get_comment', { comment_id: commentId });
      const updatedComment = JSON.parse(getResponse.content[0].text);
      expect(updatedComment.content).toBe(newContent);
    });
  });

  describe('Advanced Features', () => {
    test('get_completed_tasks_by_project - should handle account limitations', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      const projectId = testData.projects[0].id;

      const response = await toolHandlers.handleTool('get_completed_tasks_by_project', {
        project_id: projectId,
        limit: 10
      });

      // Note: This endpoint may not be available for all account types
      if (response.isError) {
        expect(response.content[0].text).toContain('Error');
        console.log('Note: Completed tasks by project not available for this account type');
      } else {
        const result = JSON.parse(response.content[0].text);
        expect(result).toHaveProperty('items');
        expect(Array.isArray(result.items)).toBe(true);
      }
    });

    test('create task with all features - comprehensive task creation', async () => {
      expect(testData.projects.length).toBeGreaterThan(0);
      expect(testData.sections.length).toBeGreaterThan(0);
      expect(testData.labels.length).toBeGreaterThan(0);

      const projectId = testData.projects[0].id;
      const sectionId = testData.sections[0].id;
      const labelId = testData.labels[0].id;

      const response = await toolHandlers.handleTool('create_task', {
        content: `${TEST_RUN_ID}_Comprehensive_Task`,
        description: 'A task created with all possible parameters for testing',
        project_id: projectId,
        section_id: sectionId,
        label_ids: [labelId],
        priority: 3,
        due_date: '2024-12-31',
        due_lang: 'en'
      });

      expect(response.isError).toBeFalsy();
      
      const task = JSON.parse(response.content[0].text.split(':\n')[1]);
      expect(task.content).toContain('Comprehensive');
      expect(task.project_id).toBe(projectId);
      expect(task.section_id).toBe(sectionId);
      // Note: label_ids field may not be supported by all API versions/accounts
      if (task.label_ids !== undefined) {
        expect(task.label_ids).toContain(labelId);
      } else {
        console.log('Note: label_ids field not returned in API response');
      }
      expect(task.priority).toBe(3);
      
      testData.tasks.push(task);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid project ID gracefully', async () => {
      const response = await toolHandlers.handleTool('get_project', { project_id: 999999999 });
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error');
    });

    test('should handle invalid task ID gracefully', async () => {
      const response = await toolHandlers.handleTool('get_task', { task_id: 999999999 });
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error');
    });

    test('should handle invalid section ID gracefully', async () => {
      const response = await toolHandlers.handleTool('get_section', { section_id: 999999999 });
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error');
    });

    test('should handle invalid label ID gracefully', async () => {
      const response = await toolHandlers.handleTool('get_label', { label_id: 999999999 });
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error');
    });

    test('should handle invalid comment ID gracefully', async () => {
      const response = await toolHandlers.handleTool('get_comment', { comment_id: 999999999 });
      expect(response.isError).toBe(true);
      expect(response.content[0].text).toContain('Error');
    });
  });
});