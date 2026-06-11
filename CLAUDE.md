# Falsify — Agentic AI Platform for Investment Thesis Drift Detection

## Project Purpose

Falsify detects when an investment thesis has drifted from its original assumptions. Given a written thesis and a stream of market/company signals, the platform uses agentic AI pipelines to surface contradicting evidence and alert analysts.

## Current Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11, FastAPI, Pydantic v2, uvicorn |
| Frontend | (planned — apps/web, not yet scaffolded) |
| AI / Agents | (planned — LangGraph, Anthropic Claude) |
| Database | (planned — not yet wired) |

## Repo Structure

```
falsify-ai/
├── apps/
│   ├── api/          # FastAPI backend
│   └── web/          # Frontend (not yet scaffolded)
├── agents/           # LangGraph agent definitions (planned)
├── pipelines/        # Data ingestion pipelines (planned)
├── retrieval/        # Vector search / RAG (planned)
├── evals/            # Evaluation harness (planned)
├── database/         # DB migrations / models (planned)
├── docs/             # Architecture docs
└── tests/            # Integration & unit tests
```

## Instructions for Claude

- **Make small, controlled changes.** One concern per change. Do not refactor or restructure code that is not directly related to the task.
- **Do not add paid services or secrets.** No API keys, third-party paid services, or credentials should be committed. Use environment variables loaded from `.env` (gitignored).
- **Do not modify unrelated files.** If a task is scoped to the backend, do not touch frontend files, docs, or config files outside that scope.
- **No premature abstractions.** Do not add layers, helpers, or design patterns that the current task does not require.
- **No unnecessary comments.** Only add a comment when the *why* is non-obvious.
- **Do not add database logic until explicitly asked.** The database layer is planned but not yet wired.
- **Do not add AI/LangGraph logic until explicitly asked.**
