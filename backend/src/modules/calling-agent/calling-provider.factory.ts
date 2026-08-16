import type { CallingProvider, CallingProviderType } from './calling-provider.types';
import { demoCallingProvider } from './calling-provider.demo';
import { realTelephonyProvider } from './calling-provider.real';

export class CallingProviderFactory {
  public static getProvider(type: CallingProviderType = 'DEMO'): CallingProvider {
    switch (type) {
      case 'DEMO':
        return demoCallingProvider;
      case 'REAL_TELEPHONY':
        return realTelephonyProvider;
      default:
        return demoCallingProvider;
    }
  }
}
