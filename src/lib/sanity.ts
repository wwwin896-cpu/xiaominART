export const sanityConfig = {
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: import.meta.env.SANITY_API_VERSION ?? '2025-01-01',
};

export const hasSanity = Boolean(sanityConfig.projectId);

export async function sanityQuery<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!hasSanity) return null;
  const url = `https://${sanityConfig.projectId}.api.sanity.io/v${sanityConfig.apiVersion}/data/query/${sanityConfig.dataset}`;
  const response = await fetch(`${url}?query=${encodeURIComponent(query)}&${new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]))}`);
  if (!response.ok) throw new Error(`Sanity query failed: ${response.status}`);
  const payload = await response.json();
  return payload.result as T;
}
