import { ChecklistItem } from './checklist-item.js';

/**
 * Additional tracking information for a checklist
 */
export interface ChecklistMetadata {
  /** Hash of original screenshot */
  sourceScreenshotHash?: string;
  
  /** For multi-tier upgrades (e.g., "Tier 1", "Tier 2") */
  tier?: string;
  
  /** User-defined tags for organization */
  tags?: string[];
}

/**
 * Represents a complete checklist for tracking upgrade/mission requirements.
 */
export interface Checklist {
  /** Unique identifier (UUID) */
  id: string;
  
  /** User-provided or auto-generated name */
  name: string;
  
  /** List of items to collect */
  items: ChecklistItem[];
  
  /** ISO 8601 timestamp */
  createdAt: string;
  
  /** ISO 8601 timestamp (last modification) */
  updatedAt: string;
  
  /** Calculated (total collected / total required * 100) */
  completionPercentage: number;
  
  /** True when all items collected */
  isComplete: boolean;
  
  /** Additional tracking info */
  metadata: ChecklistMetadata;
}
