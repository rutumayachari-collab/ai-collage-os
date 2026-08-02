import type { Router } from 'express';

/**
 * Contract every feature module implements so the route loader can mount it
 * without the foundation knowing anything about the module internals.
 */
export interface FeatureModule {
  /** URL segment mounted under the API prefix, e.g. "students". */
  readonly basePath: string;
  /** Human readable module name used in logs. */
  readonly name: string;
  /** Router exposing the module endpoints. */
  readonly router: Router;
  /** Set to false to keep a module in the codebase but out of the running API. */
  readonly enabled?: boolean;
}
