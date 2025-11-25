# AI Workflow System Guide

## Overview

The Meta Growth Agent now supports a flexible AI workflow system that lets you choose which AI provider (Claude, Gemini 3, etc.) to use for different steps of market research.

## Architecture

### Components

1. **AI Providers** (`app/services/ai_providers.py`)
   - Abstract interface for AI providers
   - Supports Claude and Gemini (including Gemini 3)
   - Easy to add new providers

2. **Workflow Service** (`app/services/workflow_service.py`)
   - Orchestrates multi-step market research
   - Configurable AI provider per task
   - Executes tasks in sequence

3. **Workflow Router** (`app/routers/workflow.py`)
   - REST API for workflow management
   - Execute workflows and individual tasks
   - Configure AI providers per task

## Workflow Tasks

### Available Tasks

1. **`competitor_identification`** - Identify top competitors
   - Default: Gemini (excellent at web research)
   - Best for: Finding competitors via web search

2. **`traffic_analysis`** - Analyze website traffic patterns
   - Default: Gemini (good at data analysis)
   - Best for: Processing traffic metrics

3. **`market_gap_analysis`** - Identify market gaps
   - Default: Claude (strategic thinking)
   - Best for: Strategic market analysis

4. **`growth_opportunity`** - Find growth opportunities
   - Default: Claude (strategic)
   - Best for: Strategic opportunity identification

5. **`meta_ads_diagnostic`** - Diagnose Meta Ads issues
   - Default: Gemini (structured data)
   - Best for: Analyzing performance data

6. **`strategic_recommendations`** - Generate recommendations
   - Default: Claude (nuanced)
   - Best for: Actionable strategic advice

7. **`executive_summary`** - Create executive summary
   - Default: Claude (polished)
   - Best for: Professional summaries

## Usage Examples

### Example 1: Use Gemini 3 for Competitor Research

```python
import requests

# Configure workflow to use Gemini 3 for competitor identification
response = requests.post(
    "https://your-backend.railway.app/workflow/config",
    json={
        "config": {
            "competitor_identification": "gemini"
        }
    }
)

# Execute workflow
response = requests.post(
    "https://your-backend.railway.app/workflow/execute",
    json={
        "domain": "example.com",
        "meta_data": {...},
        "competitor_data": {...}
    }
)
```

### Example 2: Execute Single Task with Gemini 3

```python
response = requests.post(
    "https://your-backend.railway.app/workflow/task",
    json={
        "task": "competitor_identification",
        "prompt": "Find top 5 competitors for example.com",
        "provider": "gemini",
        "model": "gemini-3-pro-preview"  # Use Gemini 3
    }
)
```

### Example 3: Custom Workflow Configuration

```python
# Use Claude for strategy, Gemini 3 for research
response = requests.post(
    "https://your-backend.railway.app/workflow/execute",
    json={
        "domain": "example.com",
        "meta_data": {...},
        "competitor_data": {...},
        "custom_config": {
            "competitor_identification": "gemini",  # Gemini for research
            "market_gap_analysis": "claude",         # Claude for strategy
            "strategic_recommendations": "claude",   # Claude for recommendations
            "meta_ads_diagnostic": "gemini"          # Gemini for data analysis
        }
    }
)
```

### Example 4: Frontend Integration

```typescript
// In your frontend API service
const executeWorkflow = async (domain: string, metaData: any, competitorData: any) => {
  const response = await fetch(`${API_URL}/workflow/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domain,
      meta_data: metaData,
      competitor_data: competitorData,
      custom_config: {
        competitor_identification: 'gemini',  // Use Gemini 3
        market_gap_analysis: 'claude',
        strategic_recommendations: 'claude'
      }
    })
  });
  return response.json();
};
```

## API Endpoints

### List Available Providers
```bash
GET /workflow/providers
```
Returns: `{"available": ["claude", "gemini"]}`

### List Workflow Tasks
```bash
GET /workflow/tasks
```
Returns: List of all available tasks with descriptions

### Configure Workflow
```bash
POST /workflow/config
Body: {
  "config": {
    "competitor_identification": "gemini",
    "market_gap_analysis": "claude"
  }
}
```

### Execute Complete Workflow
```bash
POST /workflow/execute
Body: {
  "domain": "example.com",
  "meta_data": {...},
  "competitor_data": {...},
  "custom_config": {...}  # Optional
}
```

### Execute Single Task
```bash
POST /workflow/task
Body: {
  "task": "competitor_identification",
  "prompt": "Your prompt here",
  "provider": "gemini",  # Optional
  "model": "gemini-3-pro-preview"  # Optional
}
```

## Gemini 3 Support

### Available Models
- `gemini-3-pro-preview` - Latest Gemini 3 Pro (preview)
- `gemini-1.5-pro` - Stable Gemini 1.5 Pro
- `gemini-1.5-flash` - Faster Gemini 1.5 Flash

### Using Gemini 3

#### Method 1: Environment Variable
```bash
GEMINI_MODEL=gemini-3-pro-preview
```

#### Method 2: Per-Request
```json
{
  "provider": "gemini",
  "model": "gemini-3-pro-preview"
}
```

#### Method 3: Workflow Configuration
```json
{
  "config": {
    "competitor_identification": "gemini"
  }
}
```
Then set `GEMINI_MODEL=gemini-3-pro-preview` in environment.

## Best Practices

### When to Use Gemini
- ✅ Web research and competitor identification
- ✅ Data analysis and traffic metrics
- ✅ Structured data processing
- ✅ When you need Google Search integration

### When to Use Claude
- ✅ Strategic analysis and recommendations
- ✅ Executive summaries
- ✅ Complex reasoning tasks
- ✅ When you need nuanced, polished output

### Hybrid Approach (Recommended)
- Use **Gemini 3** for research and data tasks
- Use **Claude** for strategy and recommendations
- Best of both worlds!

## Configuration

### Default Configuration
The system comes with sensible defaults:
- Research tasks → Gemini
- Strategy tasks → Claude

### Custom Configuration
Override defaults per request or set globally via `/workflow/config`.

## Error Handling

All endpoints return proper HTTP status codes:
- `200` - Success
- `400` - Bad request (invalid task/provider)
- `500` - Server error

Check response body for error details.

## Next Steps

1. Deploy backend to Railway
2. Configure API keys
3. Test workflow endpoints
4. Integrate with frontend
5. Customize workflow for your needs

---

**Happy building!** 🚀

