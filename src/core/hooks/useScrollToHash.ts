import { useEffect } from 'react';

import { readLocationHash, scrollToId } from '@/src/core/web/browser-actions';

/**
 * Ouvre la page sur l'ancre de l'URL (`#debats`) : le HTML statique ne connaît pas le fragment et le
 * contenu n'est prêt qu'après le chargement. Sans effet hors navigateur ou sans fragment.
 */
export function useScrollToHash(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const id = readLocationHash().replace(/^#/, '');
    if (!id || id.includes('=')) return;
    const timer = setTimeout(() => scrollToId(id), 50);
    return () => clearTimeout(timer);
  }, [ready]);
}
