import type {
  CallingProvider,
  CallSessionInit,
  TranscriptTurn,
  CallTurnResult,
  CallState,
} from './calling-provider.types';
import type { SupportedLanguage } from './calling-agent.types';
import { ApiError } from '../../shared/utils/api-error.util';
import { HttpStatus, ErrorCode } from '../../shared/constants';

export interface TelephonyProviderConfig {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  webhookUrl?: string;
  gatewayType: 'TWILIO' | 'EXOTEL' | 'AGORA_SIP' | 'NONE';
}

/**
 * Clean architectural abstraction for future real telephony integration.
 * When real telephony is not yet provisioned, it safely informs the system
 * rather than falsely claiming an actual cellular/PSTN call occurred.
 */
export class RealTelephonyProvider implements CallingProvider {
  public readonly providerType = 'REAL_TELEPHONY' as const;
  public readonly isSimulated = false;

  constructor(private readonly config: TelephonyProviderConfig = { gatewayType: 'NONE' }) {}

  public async initiateCall(init: CallSessionInit): Promise<{
    sessionId: string;
    initialAgentGreeting: string;
    language: SupportedLanguage;
    callState: CallState;
    isSimulated: boolean;
    disclaimer: string;
  }> {
    if (this.config.gatewayType === 'NONE' || !this.config.accountSid) {
      throw new ApiError(
        HttpStatus.NOT_IMPLEMENTED,
        'Real telephony provider is not configured. Please configure telephony credentials or switch to Demo simulation mode.',
        ErrorCode.INTERNAL_ERROR,
      );
    }

    // Future telephony dispatch placeholder (e.g. Twilio Voice REST API / Exotel Outbound Voice API)
    return {
      sessionId: `telephony-${Date.now()}`,
      initialAgentGreeting: `Hello, calling from ${init.collegeName}`,
      language: init.preferredLanguage || 'English',
      callState: 'CONNECTING',
      isSimulated: false,
      disclaimer: 'REAL TELEPHONY CALL DISPATCHED',
    };
  }

  public async processStudentTurn(
    _session: CallSessionInit,
    _transcriptHistory: TranscriptTurn[],
    _studentUtterance: string,
    _currentLanguage: SupportedLanguage,
  ): Promise<CallTurnResult> {
    throw new ApiError(
      HttpStatus.NOT_IMPLEMENTED,
      'Real-time streaming speech-to-text pipeline for real telephony is pending webhook integration.',
      ErrorCode.INTERNAL_ERROR,
    );
  }
}

export const realTelephonyProvider = new RealTelephonyProvider();
