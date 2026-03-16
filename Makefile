-include .env
export

.PHONY: help eval view clean check-token

help: ## Show this help message
	@echo "Copilot Agent Evaluation - Local Development"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  make eval          # Run the full evaluation"
	@echo "  make view          # View results in browser"
	@echo "  make clean         # Remove all results"

check-token: ## Verify GITHUB_TOKEN is set
	@if [ -z "$$GITHUB_TOKEN" ]; then \
		echo "❌ GITHUB_TOKEN not set"; \
		echo "   Load it: source .env"; \
		exit 1; \
	fi
	@echo "✅ GITHUB_TOKEN is set"

eval: check-token ## Run the evaluation (requires GITHUB_TOKEN)
	npx promptfoo@0.120.19 eval --config promptfoo.yaml --output results.json || true
	@bash scripts/report-failures.sh

eval-no-cache: check-token ## Run evaluation without cache (forces fresh API calls)
	npx promptfoo@0.120.19 eval --config promptfoo.yaml --output results.json --no-cache || true
	@bash scripts/report-failures.sh

eval-watch: check-token ## Run evaluation in watch mode
	npx promptfoo@0.120.19 eval --config promptfoo.yaml --watch

view: ## View results in browser (requires previous eval run)
	npx promptfoo@0.120.19 view

clean: ## Remove all evaluation results
	rm -rf .promptfoo results.json
	@echo "✅ Cleaned up results"

.DEFAULT_GOAL := help
