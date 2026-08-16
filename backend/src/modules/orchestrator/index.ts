import type { FeatureModule } from "../../shared/types";
import { orchestratorRoutes } from "./orchestrator.routes";

export const orchestratorModule: FeatureModule = {
  name: "Orchestrator",
  basePath: "orchestrator",
  router: orchestratorRoutes,
  enabled: true,
};

export * from "./orchestrator.types";
