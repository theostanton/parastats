# Claude Commands for Parastats

## Development Workflow

### /start-work
Create feature branch and draft PR before making changes
```bash
# Create new feature branch
git checkout -b feature/$(date +%s)-description

# Create draft PR immediately
gh pr create --draft --title "WIP: Feature description" --body "Draft PR for tracking development progress"
```

### /deploy
Run full deployment pipeline
```bash
task deploy
```

### /test-changes
Run comprehensive test suite for all affected packages
```bash
# Test all packages
cd common && yarn test && yarn build
cd ../functions && yarn test
cd ../site && yarn build
```

### /check-health
Verify local build and service health
```bash
task local-build
docker compose up -d
# Check if services are responding
curl -f http://localhost:3001/health || echo "API health check failed"
curl -f http://localhost:3000 || echo "Site health check failed"
```

### /publish-pr
Convert draft PR to ready and include conversation history
```bash
# Convert draft to ready for review
gh pr ready
# Update PR description with conversation history
gh pr edit --body "$(cat <<'EOF'
## Summary
[Description of changes]

## Test Plan
- [ ] All tests passing
- [ ] Local deployment successful
- [ ] Manual testing completed

<details><summary>Conversation History</summary>
[Insert full conversation thread here]
</details>

🤖 Generated with Claude Code
EOF
)"
```

## Build & Test

### /build-all
Build common package and all dependent services
```bash
cd common && yarn build
cd ../functions && yarn buildProd
cd ../site && yarn build
```

### /test-all
Run complete test suite (common, functions, site)
```bash
cd common && yarn test
cd ../functions && yarn test
cd ../site && yarn build # Site uses build as test verification
```

### /local-test
Build and start all services locally with Docker Compose
```bash
task local-build
docker compose up
```

### /lint-check
Run linting and type checking for all packages
```bash
cd common && yarn build # Includes type checking
cd ../functions && yarn test # Includes linting
cd ../site && yarn build # Includes type checking and linting
```

## Deployment

### /deploy-functions
Deploy backend services to Cloud Run
```bash
task functions:build
task functions:deploy
```

### /deploy-site
Deploy frontend to hosting platform
```bash
task site:deploy
```

### /deploy-infra
Apply Terraform infrastructure changes
```bash
cd infra
terraform plan
terraform apply
```

### /health-check
Verify deployed services are responding correctly
```bash
# Check production endpoints
curl -f https://api.parastats.app/health
curl -f https://parastats.app
```

## Git Operations

### /create-branch
Create new feature branch with descriptive name
```bash
git checkout main
git pull origin main
git checkout -b feature/$(read -p "Branch description: " desc && echo "$desc" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
```

### /commit-changes
Run pre-commit checks and create focused commit
```bash
# Run pre-commit requirements
cd common && yarn test && yarn build
cd ../functions && yarn test
cd ../site && yarn build

# Local deployment test
task local-build && docker compose up -d
sleep 10 # Wait for services to start
curl -f http://localhost:3001/health && curl -f http://localhost:3000
docker compose down

# Create commit
git add .
git commit -m "$(read -p "Commit message: " msg && echo "$msg")"
```

### /push-branch
Push current branch and set upstream tracking
```bash
git push -u origin $(git branch --show-current)
```

### /create-pr
Create draft or ready pull request with full context
```bash
gh pr create --title "$(read -p "PR title: " title && echo "$title")" --body "$(cat <<'EOF'
## Summary
[Description of changes]

## Test Plan
- [ ] All tests passing
- [ ] Local deployment successful
- [ ] Manual testing completed

🤖 Generated with Claude Code
EOF
)"
```