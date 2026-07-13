import type { Intent, Venue } from "@boja/core";

/**
 * The venue-curation seam — ADR-0003's quality bet. Implementations go from
 * a hand-curated list (Story 01) to pgvector similarity search (ADR-0001)
 * without the planner noticing.
 */
export interface VenueRetriever {
  retrieve(intent: Intent, limit: number): Promise<Venue[]>;
}
