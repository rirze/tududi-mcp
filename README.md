# Tududi MCP Server

Connect Claude to your tududi task manager.

## Quick Start

```bash
# 1. Install
npm install

# 2. Build
npm run build
```

## Setup with Claude Desktop

1. Get an API token from tududi: **Settings** > **API Tokens** > Create new token

2. Add to your Claude config file:

   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tududi": {
      "command": "node",
      "args": ["/path/to/tududi-mcp/dist/index.js"],
      "env": {
        "TUDUDI_URL": "http://localhost:3002",
        "TUDUDI_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

3. Restart Claude Desktop

## What You Can Do

Ask Claude things like:
- "Show my tasks for today"
- "Create a task called 'Review PR'"
- "What's in my inbox?"
- "Complete the documentation task"

## Available Tools

**Tasks**: list_tasks, get_task, create_task, update_task, complete_task, delete_task, add_subtask, get_task_metrics, get_task_subtasks, get_task_next_iterations

**Projects**: list_projects, get_project, create_project, update_project, delete_project

**Notes**: list_notes, get_note, create_note, update_note, delete_note

**Views**: list_views, list_pinned_views, get_view, create_view, update_view, delete_view

**Other**: list_inbox, get_inbox_item, add_to_inbox, update_inbox_item, process_inbox_item, analyze_inbox_text, delete_inbox_item, list_areas, get_area, create_area, update_area, delete_area, list_tags, get_tag, create_tag, update_tag, delete_tag, search

## Environment Variables

| Variable | Default | Required |
|----------|---------|----------|
| `TUDUDI_API_TOKEN` | - | Yes |
| `TUDUDI_URL` | `http://localhost:3002` | No |
