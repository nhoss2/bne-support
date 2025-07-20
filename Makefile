# Local development database commands

migrate:
	npx drizzle-kit migrate

generate:
	npx drizzle-kit generate

reset-db:
	rm -rf api/.wrangler/state
	npx drizzle-kit migrate

.PHONY: migrate generete reset-db