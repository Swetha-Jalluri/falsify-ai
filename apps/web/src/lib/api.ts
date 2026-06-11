export type HealthResponse = {
  status: string;
  app_name: string;
  version: string;
  environment: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("http://localhost:8000/health");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<HealthResponse>;
}
