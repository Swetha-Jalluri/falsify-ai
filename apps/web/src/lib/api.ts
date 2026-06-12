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
