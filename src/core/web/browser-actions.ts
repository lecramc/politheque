/* global window, navigator, document */
/**
 * Actions du navigateur utilisées par « Garder mes résultats ». Tout reste sur l'appareil : presse-
 * papiers, impression et lecture du fragment d'URL. Sur natif, `window.print` n'existe pas.
 */
type BrowserWindow = { print?: () => void; location?: { hash?: string } };
const browser = (): BrowserWindow | undefined =>
  typeof window === 'undefined' ? undefined : (window as unknown as BrowserWindow);

export const canPrint = (): boolean => typeof browser()?.print === 'function';

export const printPage = (): void => browser()?.print?.();

export const canCopy = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';

export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** Fait défiler jusqu'à l'élément d'identifiant `id` (web). Sans effet ailleurs. */
export const scrollToId = (id: string): void => {
  const doc = typeof document === 'undefined' ? undefined : document;
  doc?.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** Fragment de l'URL courante (`#r=…`), vide hors navigateur. Jamais envoyé au serveur. */
export const readLocationHash = (): string => browser()?.location?.hash ?? '';
