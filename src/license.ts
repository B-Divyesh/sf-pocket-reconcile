export const PRODUCT_SLUG = 'pocket-reconcile';
export const BILLING_BASE = 'https://api.sociobot.in/api/v1';
const TOKEN_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT_SLUG}`;

export interface LicenseState { token: string | null; valid: boolean; checkedAt: number | null; notice?: string }

export function checkoutUrl(email = ''): string {
  const base = `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;
  return email ? `${base}?email=${encodeURIComponent(email)}` : base;
}

export function captureLicenseFromUrl(): void {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function storeLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function cachedLicense(): LicenseState {
  const token = localStorage.getItem(TOKEN_KEY);
  let verdict: { valid?: boolean; checkedAt?: number } = {};
  try { verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '{}') as typeof verdict; } catch { /* ignored */ }
  return { token, valid: Boolean(token && verdict.valid), checkedAt: verdict.checkedAt ?? null };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const cached = cachedLicense();
  if (!cached.token) return cached;
  if (!force && cached.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return cached;
  try {
    const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(cached.token)}`);
    if (!response.ok) throw new Error('Verification unavailable');
    const result = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: result.valid, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return { token: cached.token, ...verdict, notice: result.valid ? undefined : 'License no longer active.' };
  } catch {
    return { ...cached, notice: cached.valid ? 'Offline — using the last verified license.' : 'Could not verify the license. Try again when online.' };
  }
}
