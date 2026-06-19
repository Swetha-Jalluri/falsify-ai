const BASE = "http://localhost:8000";

export type HealthResponse = {
  status: string;
  app_name: string;
  version: string;
  environment: string;
};

export type Company = {
  id: string;
  ticker: string;
  name: string;
  sector: string;
};

export type CompanyRequest = {
  ticker: string;
  name: string;
  sector: string;
};

export type Thesis = {
  id: string;
  company_ticker: string;
  thesis_text: string;
  status: string;
};

export type ThesisRequest = {
  company_ticker: string;
  thesis_text: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<HealthResponse>;
}

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch(`${BASE}/companies`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Company[]>;
}

export async function createCompany(body: CompanyRequest): Promise<Company> {
  const res = await fetch(`${BASE}/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Company>;
}

export async function fetchTheses(): Promise<Thesis[]> {
  const res = await fetch(`${BASE}/theses`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Thesis[]>;
}

export async function createThesis(body: ThesisRequest): Promise<Thesis> {
  const res = await fetch(`${BASE}/theses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Thesis>;
}

export type Evidence = {
  id: string;
  thesis_id: string;
  company_ticker: string;
  source_type: string;
  source_title: string;
  source_url: string;
  evidence_text: string;
  stance: string;
  created_at: string;
};

export type EvidenceRequest = {
  thesis_id: string;
  company_ticker: string;
  source_type: string;
  source_title: string;
  source_url: string;
  evidence_text: string;
  stance: string;
};

export async function fetchEvidence(): Promise<Evidence[]> {
  const res = await fetch(`${BASE}/evidence`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Evidence[]>;
}

export async function fetchEvidenceByThesis(thesisId: string): Promise<Evidence[]> {
  const res = await fetch(`${BASE}/evidence/thesis/${thesisId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Evidence[]>;
}

export async function createEvidence(body: EvidenceRequest): Promise<Evidence> {
  const res = await fetch(`${BASE}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Evidence>;
}

export type DriftVerdict = {
  id: string;
  thesis_id: string;
  company_ticker: string;
  verdict: string;
  confidence: number;
  rationale: string;
  created_at: string;
};

export type DriftVerdictRequest = {
  thesis_id: string;
  company_ticker: string;
  verdict: string;
  confidence: number;
  rationale: string;
};

export async function fetchDriftVerdicts(): Promise<DriftVerdict[]> {
  const res = await fetch(`${BASE}/drift-verdicts`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DriftVerdict[]>;
}

export async function fetchDriftVerdictsByThesis(thesisId: string): Promise<DriftVerdict[]> {
  const res = await fetch(`${BASE}/drift-verdicts/thesis/${thesisId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DriftVerdict[]>;
}

export async function createDriftVerdict(body: DriftVerdictRequest): Promise<DriftVerdict> {
  const res = await fetch(`${BASE}/drift-verdicts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DriftVerdict>;
}

export async function generateDriftVerdict(thesisId: string): Promise<DriftVerdict> {
  const res = await fetch(`${BASE}/analyze/thesis/${thesisId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DriftVerdict>;
}

export type SecFinancialEvidenceResult = {
  ticker: string;
  thesis_id: string;
  created_evidence_count: number;
  created_evidence: Evidence[];
};

export async function importSecFinancialEvidence(
  ticker: string,
  thesisId: string,
): Promise<SecFinancialEvidenceResult> {
  const res = await fetch(
    `${BASE}/sec/company/${ticker}/financial-evidence/${thesisId}`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<SecFinancialEvidenceResult>;
}
