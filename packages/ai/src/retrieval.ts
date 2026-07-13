import type { Intent, Venue } from "@boja/core";

/**
 * The venue-curation seam — ADR-0003's quality bet. Implementations go from
 * a hand-curated list (Story 01) to pgvector similarity search (ADR-0001)
 * without the planner noticing.
 */
export interface VenueRetriever {
  retrieve(intent: Intent, limit: number): Promise<Venue[]>;
}

/**
 * Story 01's retriever: a hand-curated store whose given order IS the relevance
 * ranking (ADR-0003's quality bet). A weighted / pgvector scorer drops in later
 * behind this same async seam, at which point `intent` becomes the ranking
 * signal — hence `_intent` is reserved but unused today.
 */
export class FixtureVenueRetriever implements VenueRetriever {
  constructor(private readonly store: readonly Venue[]) {}

  async retrieve(_intent: Intent, limit: number): Promise<Venue[]> {
    return this.store.slice(0, Math.max(0, limit));
  }
}
