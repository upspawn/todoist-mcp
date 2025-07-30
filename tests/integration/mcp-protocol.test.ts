// Integration tests for MCP protocol compliance

import { TODOIST_TOOLS } from '../../src/handlers/tool-definitions';

// Mock the Todoist API client to avoid real API calls
jest.mock('../../src/services/todoist-api');

describe('MCP Protocol Integration', () => {
  describe('Tool List', () => {
    it('should have all defined tools', () => {
      expect(TODOIST_TOOLS).toBeDefined();
      expect(TODOIST_TOOLS.length).toBeGreaterThan(30);
    });

    it('should include all expected tool categories', () => {
      const toolNames = TODOIST_TOOLS.map((tool) => tool.name);

      // Check that we have tools from all categories
      expect(toolNames).toContain('list_projects');
      expect(toolNames).toContain('create_task');
      expect(toolNames).toContain('list_sections');
      expect(toolNames).toContain('list_comments');
      expect(toolNames).toContain('list_labels');
      expect(toolNames).toContain('get_productivity_stats');
      expect(toolNames).toContain('quick_add_task');
    });
  });

  describe('Tool Schema Validation', () => {
    it('should have valid input schemas for all tools', () => {
      TODOIST_TOOLS.forEach((tool) => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();

        // Check that required fields are properly defined
        if (tool.inputSchema.required) {
          tool.inputSchema.required.forEach((requiredField) => {
            expect(tool.inputSchema.properties).toHaveProperty(requiredField);
          });
        }
      });
    });

    it('should have proper descriptions for all tools', () => {
      TODOIST_TOOLS.forEach((tool) => {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.description.length).toBeGreaterThan(10);
      });
    });

    it('should have unique tool names', () => {
      const names = TODOIST_TOOLS.map((tool) => tool.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe('Tool Categories Coverage', () => {
    it('should include all project management tools', () => {
      const projectTools = TODOIST_TOOLS.filter((tool) =>
        tool.name.includes('project')
      );
      expect(projectTools.length).toBeGreaterThanOrEqual(6);
    });

    it('should include all task management tools', () => {
      const taskTools = TODOIST_TOOLS.filter((tool) =>
        tool.name.includes('task') || tool.name === 'quick_add_task'
      );
      expect(taskTools.length).toBeGreaterThanOrEqual(8);
    });

    it('should include section management tools', () => {
      const sectionTools = TODOIST_TOOLS.filter((tool) =>
        tool.name.includes('section')
      );
      expect(sectionTools.length).toBeGreaterThanOrEqual(5);
    });

    it('should include comment management tools', () => {
      const commentTools = TODOIST_TOOLS.filter((tool) =>
        tool.name.includes('comment')
      );
      expect(commentTools.length).toBeGreaterThanOrEqual(5);
    });

    it('should include label management tools', () => {
      const labelTools = TODOIST_TOOLS.filter((tool) =>
        tool.name.includes('label')
      );
      expect(labelTools.length).toBeGreaterThanOrEqual(5);
    });

    it('should include productivity tools', () => {
      const productivityTools = TODOIST_TOOLS.filter((tool) =>
        tool.name.includes('completed') || tool.name.includes('productivity')
      );
      expect(productivityTools.length).toBeGreaterThanOrEqual(3);
    });
  });
});