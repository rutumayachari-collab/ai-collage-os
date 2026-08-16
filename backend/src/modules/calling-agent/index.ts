import type { FeatureModule } from '../../shared/types';
import { callingAgentRoutes } from './calling-agent.routes';

export const callingAgentModule: FeatureModule = {
  name: 'CallingAgent',
  basePath: 'outreach',
  router: callingAgentRoutes,
  enabled: true,
};

export * from './calling-agent.types';
export * from './calling-agent.model';
export * from './calling-agent.repository';
export * from './calling-agent.service';
export * from './calling-agent.controller';
export * from './calling-agent.validator';
export * from './calling-provider.types';
export * from './calling-provider.demo';
export * from './calling-provider.real';
export * from './calling-provider.factory';
