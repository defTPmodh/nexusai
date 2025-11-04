# Nexus-AI MVP

Enterprise AI Orchestration & Governance platform providing secure, governed access to multiple LLM providers with PII protection, RAG document grounding, cost tracking, and no-code agent workflow automation.

## Features

### Core Capabilities

- **Unified Gateway**: Single interface for OpenAI, Anthropic, and Google models
- **PII Protection**: Automatic detection and redaction of sensitive information (SSN, credit cards, emails, phone numbers, IP addresses)
- **RAG Document Grounding**: Upload PDFs and query them with vector similarity search
- **Cost Tracking**: Real-time monitoring of API usage and costs per user/department
- **Agent Workflows**: No-code workflow builder with LLM, RAG, API, and conditional nodes
- **Enterprise SSO**: Auth0 integration with SAML and OAuth support
- **Role-Based Access Control**: Employee, Manager, and Admin roles with granular permissions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: Supabase (PostgreSQL + pgvector for embeddings)
- **Authentication**: Auth0 (SSO, SAML, OAuth)
- **LLM Providers**: OpenAI, Anthropic, Google (via official SDKs)
- **Vector Search**: pgvector with cosine similarity
- **Deployment**: Vercel (frontend), Supabase (database)

## Prerequisites

- Node.js 20+ and npm
- Supabase account and project
- Auth0 account and tenant
- API keys for LLM providers (OpenAI, Anthropic, Google)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd nexusai
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Auth0 Configuration
AUTH0_SECRET=<generate-random-32-char-string>
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=<your-auth0-client-id>
AUTH0_CLIENT_SECRET=<your-auth0-client-secret>

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>

# LLM Provider API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# PII Detection
PII_DETECTION_ENABLED=true
```

### 3. Set Up Supabase Database

#### Enable pgvector Extension

In your Supabase project SQL editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Run Database Migrations

Run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_vector_search_function.sql` - Vector similarity search function
3. `supabase/migrations/003_analytics_function.sql` - Analytics aggregation function

In Supabase SQL Editor, paste and execute each file's contents.

#### Seed Initial Data

Run `supabase/seed.sql` to populate:
- Default LLM models with pricing
- Model permissions for each role

### 4. Configure Auth0

#### Create Application

1. Go to Auth0 Dashboard → Applications → Create Application
2. Choose "Regular Web Application"
3. Note the Client ID and Client Secret

#### Configure Application Settings

- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

#### Set Up Roles (Optional for MVP)

1. Create roles: `employee`, `manager`, `admin`
2. Assign roles to test users via Auth0 dashboard

#### Configure Enterprise Connections (Optional)

For enterprise SSO:
1. Go to Authentication → Enterprise
2. Add SAML or OAuth connections as needed
3. Link to your application

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Create Test Users

In Auth0 Dashboard → User Management → Users:
1. Create test users with different roles
2. Assign roles via user metadata or Auth0 Actions

Default role for new users: `employee` (set in API)

## Project Structure

```
nexusai/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── chat/                 # Chat interface
│   └── admin/                # Admin dashboards
├── lib/                      # Core libraries
│   ├── llm/                  # Canonical LLM layer
│   ├── guardrails/           # PII detection
│   ├── rag/                  # Document processing & vector search
│   ├── agents/               # Workflow execution engine
│   └── supabase/             # Database client
├── types/                    # TypeScript types
├── supabase/
│   ├── migrations/           # SQL migrations
│   └── seed.sql              # Seed data
├── .env.local                # Environment variables
└── README.md
```

## Usage Guide

### Employee Workflow

1. **Login**: Navigate to homepage and click "Sign In with SSO"
2. **Chat Interface**:
   - Select an LLM model from dropdown (based on your role)
   - Type messages in the chat input
   - View conversation history in sidebar
   - PII is automatically detected and redacted
3. **New Chat**: Click "New Chat" to start fresh conversation

### Admin Workflow

#### Document Management (`/admin/documents`)

1. Upload PDFs via drag-and-drop or file browser
2. Documents are automatically processed:
   - Text extraction from PDF
   - Chunking with overlap
   - Embedding generation
   - Storage in pgvector
3. View processing status in real-time
4. Delete documents as needed

#### Cost Analytics (`/admin/analytics`)

1. Select time period (Today, Last 7 Days, Last 30 Days, etc.)
2. View summary metrics:
   - Total cost
   - Total requests
   - Tokens used
3. Analyze usage over time (chart)
4. Review user breakdown (table with sorting)

#### Agent Management (`/admin/agents`)

1. View all created agents
2. Toggle agents active/inactive
3. Delete agents
4. **Visual Builder**: Full React Flow implementation available (see `planning.md` for specifications)

### Agent Execution

Agents can be executed via API:

```bash
POST /api/agents/execute
{
  "agentId": "uuid",
  "input": {
    "user_input": "Draft a compliance report for new product",
    "user_id": "uuid"
  }
}
```

Response includes:
- Execution ID
- Output from workflow
- Metadata (cost, tokens, execution time)
- Complete execution trace

## MVP Success Validation

Test the complete flow:

1. **Admin Setup**:
   - Login as admin
   - Upload compliance policy PDF
   - Wait for processing to complete

2. **Employee Usage**:
   - Login as employee
   - Send message with PII (e.g., "My SSN is 123-45-6789. What is our policy?")
   - Verify PII is redacted (warning icon shown)
   - Receive response from LLM

3. **Agent Execution**:
   - Create agent via API with RAG → LLM workflow
   - Execute agent with input
   - Verify RAG retrieves relevant documents
   - Verify LLM generates response

4. **Analytics Verification**:
   - View analytics dashboard
   - Confirm costs tracked
   - Verify user breakdown
   - Check audit trail in database

## Database Schema

Key tables:
- `users` - User profiles and roles
- `llm_models` - Available models with pricing
- `model_permissions` - RBAC for model access
- `chat_sessions` / `chat_messages` - Chat history
- `documents` / `document_chunks` - RAG documents with vectors
- `agents` / `agent_executions` - Workflow definitions and runs
- `llm_requests` - Complete audit trail
- `pii_allowlist` - Whitelisted PII patterns

See `supabase/migrations/001_initial_schema.sql` for complete schema.

## API Documentation

### Chat API

- `POST /api/chat/message` - Send message to LLM
- `GET /api/models` - Get available models for user role
- `GET /api/user/profile` - Get/create user profile

### Admin APIs

#### Documents
- `GET /api/admin/documents` - List all documents
- `POST /api/admin/documents/upload` - Upload PDF
- `DELETE /api/admin/documents/:id` - Delete document

#### Analytics
- `GET /api/admin/analytics?period=today` - Get usage analytics

#### Agents
- `GET /api/admin/agents` - List all agents
- `PUT /api/admin/agents/:id` - Update agent
- `DELETE /api/admin/agents/:id` - Delete agent

### RAG API

- `POST /api/rag/query` - Query documents with vector search

### Agent API

- `POST /api/agents/execute` - Execute agent workflow

## Security Features

1. **PII Detection**: Regex-based detection with allowlist support
2. **RBAC**: Role-based access to models and features
3. **Row-Level Security**: Supabase RLS policies
4. **Auth0 SSO**: Enterprise authentication
5. **Audit Logging**: All LLM requests logged with metadata
6. **Environment Variables**: Sensitive keys in env vars

## Cost Optimization

- Model permissions restrict expensive models to managers/admins
- Real-time cost tracking per request
- Analytics dashboard for monitoring spend
- Token usage visible in all requests

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Production Checklist

- [ ] Set production AUTH0_BASE_URL
- [ ] Use production Supabase project
- [ ] Set PII_DETECTION_ENABLED=true
- [ ] Configure Auth0 enterprise connections
- [ ] Set up domain with SSL
- [ ] Review and adjust model permissions
- [ ] Set up monitoring/alerts

## Troubleshooting

### Common Issues

**"Model not found in configuration"**
- Ensure seed.sql was run
- Check llm_models table has entries
- Verify environment variables for API keys

**"User not found"**
- First login creates user automatically
- Check Auth0 user has valid email
- Verify Supabase connection

**"PII detection failed"**
- Check PII_DETECTION_ENABLED environment variable
- Verify pii_allowlist table exists

**Document processing stuck**
- Check Supabase logs
- Verify OPENAI_API_KEY is valid
- Check document status in database

## Future Enhancements

- Real-time streaming responses
- Multi-tenant organization support
- Advanced analytics with charts/graphs
- Export functionality for reports
- Slack/Teams integrations
- Custom PII pattern configuration UI
- Agent workflow templates
- A/B testing for different models
- Fine-tuning management

## Support

For issues and questions:
- Check `planning.md` for detailed specifications
- Review API error messages in browser console
- Check Supabase logs for database errors
- Verify Auth0 configuration

## License

Proprietary - Enterprise B2B SaaS Platform

