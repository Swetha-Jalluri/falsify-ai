# Falsify

## Agentic AI Platform for Investment Thesis Drift Detection

Falsify is a production-style fintech AI platform that monitors whether an investor's original investment thesis for a public company is still supported by fresh evidence.

The system ingests SEC filings, earnings call transcripts, financial metrics, and news, then uses agentic AI to detect thesis drift and generate structured verdicts with supporting citations.

## Problem

Investors often buy a stock based on a thesis, such as:

> "I believe Nvidia will continue growing because AI data center demand remains strong, margins stay high, and hyperscaler spending continues."

But after investing, they may not continuously monitor whether that thesis is still valid.

Falsify solves this by tracking new public evidence and identifying whether the thesis is:

- Intact
- Weakening
- Broken
- Insufficiently supported

## Core Features

- Public company watchlist
- Plain-English investment thesis input
- AI-generated thesis pillars
- SEC filing and financial metric ingestion
- Evidence retrieval using hybrid search
- Agentic drift reasoning workflow
- Citation-backed verdicts
- Trust and evaluation dashboard
- Agent tracing and observability

## Planned Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Recharts

### Backend
- FastAPI
- Pydantic v2
- Python 3.11

### AI and Agents
- LangGraph
- LangSmith
- Configurable LLM provider: Gemini and Claude

### Data and Retrieval
- Supabase Postgres
- Qdrant hybrid search
- SEC EDGAR data
- Financial metrics
- News signals

### Evaluation and Monitoring
- Evidently
- Custom citation checks
- Hallucination risk checks
- Source freshness checks

### Automation and Deployment
- GitHub Actions
- Vercel
- Render or similar free backend deployment
- Supabase free tier

## Project Status

Currently in early development.

## Disclaimer

This project is for educational and portfolio purposes only. It does not provide financial advice, investment recommendations, or buy/sell signals.
