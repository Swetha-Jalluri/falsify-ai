# Falsify — AI Upgrade Architecture Plan

> This document describes the planned AI layer for Falsify. It is intentionally separated from the current MVP to be honest about what exists today versus what is being built next.

---

## 1. Why This Upgrade Matters

The current MVP proves the product concept works: a user can add a company, write a thesis, log evidence manually, and get a structured drift verdict. But the workflow requires the analyst to find their own evidence and enter it by hand.

That bottleneck removes the core value of the platform. An analyst who is already reading SEC filings and news articles could form their own opinion without Falsify. The AI upgrade automates evidence collection, retrieval, and reasoning — so Falsify does the continuous monitoring work that no human could sustain at scale.

---

## 2. Real Problem Statement

Institutional and retail investors set a thesis once and revisit it rarely. When market or company fundamentals shift, the signal is buried in a stream of filings, transcripts, news articles, and data releases. No single analyst can read everything. Existing tools (screeners, financial terminals) surface data but do not reason about it relative to a specific thesis.

Falsify's AI layer changes the workflow:

- **Before:** Analyst reads everything → forms opinion → updates tracker manually.
- **After:** Falsify ingests everything → retrieves what is thesis-relevant → generates a cited verdict → alerts the analyst.

---

## 3. Target Users

| User | Need |
|---|---|
| Retail investor | Know when a thesis on a held stock has deteriorated, without reading 10-Ks |
| Junior analyst | Quickly surface contradicting evidence before a review meeting |
| Portfolio manager | Monitor multiple theses simultaneously, at a cadence no assistant could sustain |
| Student / researcher | Learn what structured investment reasoning looks like with real data |

---

## 4. Current MVP Architecture

What is **built and working today**:

```
User
 ↓
Next.js Frontend (dashboard, forms)
 ↓
FastAPI REST API
 ↓
Supabase Postgres
 ↓
Rule-Based Analyzer (stance counts → verdict)
 ↓
Drift Verdict displayed on dashboard
```

**What the rule-based analyzer does:**
Counts evidence rows tagged `supports` vs `contradicts` by the user, computes a ratio, and writes a verdict (`supported`, `contradicted`, `weakening`, `needs_more_evidence`) with a confidence score.

**What it cannot do:**
- Find evidence automatically
- Understand the *content* of a thesis or document
- Reason about whether a piece of evidence is actually thesis-relevant
- Cite its sources

---

## 5. Target AI Architecture

What the system will look like after the full AI upgrade:

```
User / Analyst
 ↓
Next.js Dashboard
 ↓
FastAPI API Layer
 ↓
Supabase Postgres
 ↓
Ingestion Workers
 ↓
SEC Filings + News + Financial Metrics
 ↓
Chunking + Metadata
 ↓
Qdrant Vector Search
 ↓
LangGraph Analysis Workflow
 ↓
LLM Verdict Generator
 ↓
Citation-Grounded Drift Dashboard
```

The analyst interacts only with the dashboard. Everything below that line runs automatically on a schedule or on-demand trigger.

---

## 6. Data Sources and Why We Chose Them

### SEC EDGAR — Primary Source (Phase 1)

**What it is:** The U.S. Securities and Exchange Commission's public filing database. Every public company must file 10-Ks (annual), 10-Qs (quarterly), 8-Ks (material events), and earnings transcripts here.

**Why it is first:**
- Completely free and public via the EDGAR full-text search API
- Authoritative — this is the same source institutional analysts use
- Structured enough to parse (XBRL metadata, consistent filing types)
- High signal-to-noise ratio — companies write these carefully

**What we will extract:**
- Management discussion and analysis (MD&A) sections
- Risk factor updates
- Revenue, margin, and guidance figures
- Forward-looking statements

### GDELT / Financial News — Secondary Source (Phase 2)

**What it is:** GDELT is a free, real-time news database that indexes global news articles. As a secondary source, news surfaces faster-moving signals that lag SEC filings.

**Why it comes second:**
- Higher noise than EDGAR — requires more filtering
- Good for catching sentiment shifts, analyst reactions, and macro events
- Free and API-accessible

### Financial Metrics — Tertiary Source (Phase 3)

**What it is:** Structured numerical data — revenue growth, gross margin, P/E, debt levels — from public APIs (e.g., SEC XBRL, open financial data sources).

**Why it comes third:**
- Useful for thesis pillars like "margins stay high" or "debt remains manageable"
- Requires more schema design to store and retrieve cleanly
- Adds quantitative grounding to what is otherwise text-based reasoning

---

## 7. Data Lifecycle

Each piece of evidence moves through this pipeline before it appears in the dashboard:

### 7.1 Fetch
Ingestion workers poll SEC EDGAR on a schedule (or on-demand for a specific ticker). Raw filing documents are downloaded and stored temporarily.

### 7.2 Clean
Strip boilerplate, HTML tags, legal headers, and table-of-contents sections. Retain only content-bearing sections (MD&A, Risk Factors, Earnings Discussion).

### 7.3 Chunk
Split cleaned text into overlapping chunks of ~400–600 tokens. Overlap (typically 10–15%) prevents relevant context from being split across chunk boundaries and lost during retrieval.

### 7.4 Store
Each chunk is embedded using a text embedding model and stored in **Qdrant** (vector database) alongside metadata: ticker, filing type, date, source URL, section name. The raw chunk text is also stored in **Supabase** for citation rendering.

### 7.5 Retrieve
When analysis runs for a thesis, the thesis text is embedded and used to query Qdrant for the top-K most semantically similar chunks. A metadata filter narrows results to the relevant company and date range.

### 7.6 Analyze
The retrieved chunks, the original thesis text, and prior verdict history are passed to a **LangGraph** workflow. LangGraph manages the multi-step reasoning process: expanding the query, retrieving additional context, and coordinating the LLM calls.

### 7.7 Cite
The LLM is prompted to reason over the evidence and produce a structured verdict with inline citations. Each claim in the rationale is linked to a specific chunk, which is linked to a specific source document and URL.

### 7.8 Display
The verdict, confidence score, rationale, and citations are written to the `drift_verdicts` table in Supabase and surfaced in the Next.js dashboard — in the same panel that currently shows rule-based verdicts.

---

## 8. Why Each Technology Is Used

### FastAPI (Backend)
Python-native REST API framework. Chosen because the AI and data science ecosystem is Python-first — LangGraph, LangChain, the Anthropic SDK, and most embedding libraries are Python packages. FastAPI integrates cleanly with all of them without an impedance mismatch.

### Supabase (Relational Database)
Postgres-compatible, free-tier available, with a good Python client. Stores structured records: companies, theses, evidence metadata, verdicts, and citation references. Not used for vector storage — that is Qdrant's role.

### Qdrant (Vector Database)
Open-source vector search engine. Stores embedded chunks of filing and news text and supports fast approximate nearest-neighbor search with metadata filtering. Chosen over alternatives (Pinecone, Weaviate) because it is self-hostable, has a generous free cloud tier, and has clean Python SDK support.

### LangGraph (Agentic Workflow Orchestration)
LangGraph models multi-step AI workflows as directed graphs. This matters because thesis drift analysis is not a single LLM call — it involves: query expansion, multi-round retrieval, evidence ranking, and structured output generation. LangGraph lets each step be explicit, inspectable, and independently testable. It also integrates with LangSmith for tracing.

### LLM (Claude via Anthropic API)
The reasoning core. Given a thesis and a set of retrieved evidence chunks, the LLM produces a structured verdict: classification, confidence rationale, and inline citations. Claude is chosen for its long context window (important for passing multiple filing excerpts) and its reliability on structured output tasks.

### Next.js (Frontend)
React-based framework for the analyst dashboard. Handles server-side rendering for SEO, TypeScript for type safety, and Tailwind CSS for rapid UI development. The frontend is intentionally kept thin — it displays what the backend and AI pipeline produce; it does not contain business logic.

---

## 9. Scalability Considerations

The current MVP is a single-user, single-machine system. The AI upgrade introduces components that need to scale independently.

| Component | Scaling consideration |
|---|---|
| Ingestion workers | Run as background jobs; can be parallelized per ticker |
| Qdrant | Horizontally scalable; namespaces can isolate per-company collections |
| LangGraph workflows | Stateless per run; can be queued and processed concurrently |
| Supabase | Row-level security enables multi-user isolation when needed |
| FastAPI | Stateless; multiple instances behind a load balancer if needed |

For the MVP and portfolio phase, all components run on a single server or free-tier cloud. The architecture is designed so each layer can be scaled or swapped independently without rewriting others.

---

## 10. Differentiation from Generic Financial RAG Projects

Many portfolio projects implement RAG over financial documents. Falsify is differentiated in three ways:

**1. Thesis-relative retrieval**
Standard RAG retrieves documents relevant to a query. Falsify retrieves documents relevant to a *specific thesis* for a *specific company* — meaning the retrieval is scoped by ticker, date, and the semantic content of the original investment claim. This is a more constrained and harder problem than open-domain Q&A.

**2. Verdict classification with history**
The output is not a summary. It is a structured classification (`supported`, `contradicted`, `weakening`, `needs_more_evidence`) with a confidence score and rationale, stored over time so drift can be tracked longitudinally.

**3. Citation-grounded reasoning**
Every claim in the rationale is anchored to a source chunk with a document reference and URL. This is not decoration — it is what makes the verdict auditable and trustworthy to an analyst who needs to verify the system's reasoning.

---

## 11. Interview Talking Points

These are the design decisions worth articulating clearly in a technical interview:

- **Why LangGraph instead of a single LLM call?** Thesis drift analysis has multiple distinct steps (retrieval, re-ranking, reasoning, output structuring) that need to be debuggable and independently observable. A monolithic prompt cannot be inspected step by step.

- **Why Qdrant alongside Supabase?** Postgres (via Supabase) is the right store for structured, relational data — theses, verdicts, company records. It is not efficient for approximate nearest-neighbor vector search over millions of embedding dimensions. Qdrant is purpose-built for that. The two databases serve fundamentally different access patterns.

- **Why chunk with overlap?** A key insight in RAG systems: if a sentence relevant to the query sits at a chunk boundary and is split, neither chunk will rank high in retrieval. Overlapping chunks ensure boundary content appears fully in at least one chunk.

- **Why citations in the verdict?** A verdict without citations is a black box. For financial reasoning, where a wrong conclusion has real consequences, the analyst needs to be able to follow the AI's logic back to primary sources. Citations make the system auditable, not just useful.

- **Why SEC EDGAR before news?** Filings are authoritative, structured, and have consistent update cadences tied to earnings calendars. News is higher volume, noisier, and requires more filtering to reach signal. Starting with EDGAR lets us validate the pipeline end-to-end with high-quality input before adding complexity.

---

## 12. Phased Roadmap

### Phase 1 — SEC Ingestion
- Build an ingestion worker that fetches 10-K and 10-Q filings from EDGAR for a given ticker
- Parse and clean the MD&A and Risk Factors sections
- Store raw chunks in Supabase with source metadata
- No vector search yet — this phase validates the data pipeline

### Phase 2 — Evidence Auto-Population
- Wire ingested chunks as evidence rows in the existing `evidence` table
- Each chunk gets a `source_type` of `sec_filing`, a `source_url`, and a `source_title`
- The frontend already displays evidence — this phase makes it automatic rather than manual

### Phase 3 — Qdrant Semantic Search
- Stand up a Qdrant instance (local or cloud free tier)
- Embed all stored chunks and index them in Qdrant with ticker + date metadata
- Replace or supplement direct evidence lookup with semantic search against the thesis text
- Validate that retrieved chunks are more relevant than keyword-matched ones

### Phase 4 — LangGraph Workflow
- Define the analysis graph: retrieve → re-rank → pass to LLM
- Add a query expansion node (decompose the thesis into sub-claims before retrieval)
- Add observability via LangSmith
- Return structured output from the graph rather than raw LLM text

### Phase 5 — LLM Verdict Generation with Citations
- Prompt the LLM with the thesis, retrieved chunks, and output schema
- Require the LLM to produce: verdict classification, confidence, rationale paragraphs, and inline chunk citations
- Store the verdict in `drift_verdicts` with citation references
- Render citations in the frontend dashboard

### Phase 6 — Deployment
- Deploy FastAPI on Render (free tier to start)
- Deploy Next.js on Vercel (free tier)
- Supabase remains on its managed cloud
- Qdrant on Qdrant Cloud free tier or self-hosted on the same server as FastAPI
- Add a GitHub Actions workflow to run ingestion on a cron schedule

---

*This document reflects the intended architecture as of the current planning phase. Implementation details will evolve as each phase is built and validated.*
