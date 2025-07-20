# Database commands

# Generate migration files from schema changes
generate:
	npx drizzle-kit generate

# Apply migrations to local development database
migrate:
	npx wrangler d1 migrations apply bne-support-db

# Apply migrations to remote production database
migrate-remote:
	npx wrangler d1 migrations apply bne-support-db --remote

# Reset local database and apply all migrations
reset-db:
	rm -rf .wrangler/state
	npx wrangler d1 migrations apply bne-support-db

# Deploy API with migrations
deploy:
	npx wrangler d1 migrations apply bne-support-db --remote && npx wrangler deploy api/src/index.ts

.PHONY: migrate generate reset-db migrate-remote deploy