# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Parastats is a paragliding flight tracking application that integrates with Strava to analyze and display flight statistics. The project uses a microservices architecture with a Next.js frontend, Express.js backend services, and PostgreSQL database, all deployed on Google Cloud Platform.

## Architecture

### Core Components
- **`/common`** - Shared TypeScript package with database models, utilities, and core business logic
- **`/functions`** - Backend services (API, tasks, webhooks) deployed as Cloud Run containers
- **`/site`** - Next.js frontend application
- **`/infra`** - Terraform infrastructure definitions
- **`/tasks`** - Task business logic package consumed by functions

### Key Technologies
- **Database**: PostgreSQL with PostGIS extension for geospatial queries
- **Authentication**: JWT with Strava OAuth 2.0 integration  
- **Background Jobs**: Google Cloud Tasks for reliable async processing
- **Testing**: Vitest with Testcontainers for integration tests
- **Deployment**: Docker containers with Terraform infrastructure

## Common Development Commands

### Build and Deploy (from root)
```bash
# Full deployment pipeline
task deploy

# Local development with hot reload
task local-build
docker compose up

# Individual service builds
task functions:build
task site:deploy
task infra:apply
```

### Functions Development
```bash
cd functions

# Development servers with hot reload
yarn devApi        # API server on port 3001
yarn devTasks      # Tasks server on port 3002  
yarn devWebhooks   # Webhooks server on port 3003

# Production build (includes common package copy)
yarn buildProd

# Run tests (uses Testcontainers for PostgreSQL)
yarn test
```

### Site Development
```bash
cd site

yarn dev          # Next.js dev server on port 3000
yarn build        # Production build
yarn start        # Start production server
```

### Common Package Development
```bash
cd common

yarn build        # Compile TypeScript
yarn dev          # Watch mode compilation
yarn test         # Run unit tests
```

## Database Schema

### Core Tables
- **`pilots`** - User accounts with Strava tokens and profile data
- **`flights`** - Paragliding flights derived from Strava activities with geospatial data
- **`sites`** - Takeoff/landing sites with PostGIS polygon data from FFVL API
- **`windsocks`** - Wind measurement stations
- **`description_preferences`** - User preferences for AI-generated flight descriptions

### Migration Scripts
Database schema changes are managed via SQL files in `functions/src/model/database/scripts/`. Apply manually to database instances.

## Task System

Background jobs are processed via Google Cloud Tasks:

- **`fetchAllActivities`** - Sync Strava activities to flights table
- **`syncSites`** - Update paragliding sites from external FFVL API  
- **`updateDescription`** - Generate AI-powered flight descriptions using preferences
- **`helloWorld`** - Health check task

Task handlers are in `functions/src/tasks/` with business logic in the separate `/tasks` package.

## Testing

Use `yarn test` in any package. Functions package uses Testcontainers to spin up PostgreSQL for integration tests with 60-second timeout.

Test database operations thoroughly as they involve complex geospatial queries for site proximity calculations.

## Common Patterns

- **Shared Models**: All database types and API models are in `/common` package
- **Task Dependencies**: Functions create task dependencies via `createTaskDependencies()` adapter
- **Geospatial Queries**: Use PostGIS `earthdistance` for site proximity calculations  
- **Error Handling**: Tasks return `{ success: boolean, message?: string }` pattern
- **Authentication**: JWT tokens in cookies, Strava OAuth refresh token handling

## Development Workflow Guardrails

**MANDATORY: Claude Code must follow these guardrails for ALL code changes:**

### 1. Branch Management
- **ALWAYS** create a new feature branch before making any changes
- Branch naming: `feature/description`, `fix/description`, `refactor/description`
- **NEVER** commit directly to `main` branch
- Delete feature branches after PR merge

### 2. Pre-Commit Requirements
Before EVERY commit, Claude Code must:
1. Run full test suite for affected packages:
   - `cd common && yarn test && yarn build`
   - `cd functions && yarn test`
   - `cd site && yarn build`
2. Test locally with `task local-build && docker compose up`
3. Verify all services start correctly and endpoints respond
4. Only commit if all tests pass and local deployment succeeds

### 3. Commit Strategy
- Make small, focused commits with clear messages
- Many small commits per branch are encouraged
- Each commit must pass all pre-commit requirements
- Commit message format: `type: brief description`

### 4. Pull Request Workflow
- Create PR only when feature is complete and fully tested
- PR will be squashed into single commit on main
- Include clear description of changes and test plan
- **NEVER** merge without human review

### 5. Rollback Strategy
- Keep git history clean for easy rollbacks
- Document any infrastructure changes in PR description
- If deployment fails, immediately revert to last known good state

### 6. Testing Requirements
- Full test suite before every commit
- Local integration testing with Docker Compose
- For infrastructure: `terraform plan` before any applies
- Validate API endpoints and frontend functionality

**Claude Code will refuse to proceed if any guardrail is violated.**

## Legacy Development Workflow

1. Make changes in relevant package (`common`, `functions`, `site`)
2. Run tests with `yarn test` 
3. For local testing, use `task local-build && docker compose up`
4. Deploy individual services or full stack with `task deploy`

The monorepo structure requires building the common package before consuming packages can use changes.