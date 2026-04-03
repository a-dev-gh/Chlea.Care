import { useState, useEffect } from 'react';
import { adminFetch } from '../utils/adminApi';
import type { BadgeEntry } from '../types/database';

// Module-level cache so badges are fetched only once per session
let cachedBadges: BadgeEntry[] | null = null;

export function useBadges() {
  const [badges, setBadges] = useState<BadgeEntry[]>(cachedBadges || []);

  useEffect(() => {
    if (cachedBadges) return;
    adminFetch<BadgeEntry>('badges', { orderBy: 'sort_order' }).then(data => {
      cachedBadges = data;
      setBadges(data);
    });
  }, []);

  function getBadge(name: string): BadgeEntry | undefined {
    return badges.find(b => b.name === name);
  }

  return { badges, getBadge };
}
