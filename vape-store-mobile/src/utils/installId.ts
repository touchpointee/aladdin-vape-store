const STORAGE_KEY = 'first_order_install_id';

function generateId(): string {
  return 'fo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 15);
}

/**
 * Returns a persistent install ID (one per app install). Used for first-order offer eligibility.
 */
export async function getInstallId(storage: { getItem: (k: string) => Promise<string | null>; setItem: (k: string, v: string) => Promise<void> }): Promise<string> {
  let id = await storage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    await storage.setItem(STORAGE_KEY, id);
  }
  return id;
}
