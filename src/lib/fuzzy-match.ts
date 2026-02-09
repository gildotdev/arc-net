import Fuzzysort from 'fuzzysort';

/**
 * Result of a fuzzy match operation.
 */
export interface FuzzyMatchResult {
  /** The matched target string */
  target: string;
  
  /** Match score (0.0-1.0, higher is better) */
  score: number;
  
  /** Normalized score between 0 and 1 */
  normalizedScore: number;
}

/**
 * Fuzzy string matching utilities for item name matching.
 */
export class FuzzyMatcher {
  private readonly threshold: number;

  /**
   * Create a new FuzzyMatcher.
   * 
   * @param threshold - Minimum score threshold (0.0-1.0) for accepting matches
   */
  constructor(threshold: number = 0.7) {
    this.threshold = threshold;
  }

  /**
   * Find the best fuzzy match for a query string against a list of targets.
   * 
   * @param query - String to match
   * @param targets - List of candidate strings
   * @returns Best match result, or null if no match above threshold
   */
  findBestMatch(query: string, targets: string[]): FuzzyMatchResult | null {
    const result = Fuzzysort.go(query, targets, {
      threshold: -10000, // Use our own threshold logic
      limit: 1
    });

    if (result.length === 0) {
      return null;
    }

    const match = result[0];
    const normalizedScore = this.normalizeScore(match.score);

    if (normalizedScore < this.threshold) {
      return null;
    }

    return {
      target: match.target,
      score: match.score,
      normalizedScore
    };
  }

  /**
   * Find multiple fuzzy matches for a query string.
   * 
   * @param query - String to match
   * @param targets - List of candidate strings
   * @param limit - Maximum number of results to return
   * @returns Array of match results, sorted by score (best first)
   */
  findMatches(query: string, targets: string[], limit: number = 3): FuzzyMatchResult[] {
    const results = Fuzzysort.go(query, targets, {
      threshold: -10000,
      limit
    });

    return results
      .map(result => ({
        target: result.target,
        score: result.score,
        normalizedScore: this.normalizeScore(result.score)
      }))
      .filter(result => result.normalizedScore >= this.threshold);
  }

  /**
   * Normalize fuzzysort score to 0.0-1.0 range.
   * Fuzzysort returns negative scores, with 0 being perfect match.
   * 
   * @param score - Raw fuzzysort score
   * @returns Normalized score between 0 and 1
   */
  private normalizeScore(score: number): number {
    // Fuzzysort scores are negative, with 0 being perfect
    // Typical range is -10000 (bad) to 0 (perfect)
    // We normalize to 0-1 range
    if (score >= 0) return 1.0;
    if (score <= -10000) return 0.0;
    
    return Math.max(0, 1 + (score / 10000));
  }
}
