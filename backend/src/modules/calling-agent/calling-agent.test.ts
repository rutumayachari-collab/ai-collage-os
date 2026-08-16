import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DemoCallingProvider } from './calling-provider.demo';
import { RealTelephonyProvider } from './calling-provider.real';
import { CallingProviderFactory } from './calling-provider.factory';
import { CallingAgentService } from './calling-agent.service';
import type { SupportedLanguage } from './calling-agent.types';

describe('Calling Provider Abstraction', () => {
  it('instantiates DemoCallingProvider and confirms simulated mode with explicit disclaimer', async () => {
    const provider = CallingProviderFactory.getProvider('DEMO');
    expect(provider.providerType).toBe('DEMO');
    expect(provider.isSimulated).toBe(true);

    const session = await provider.initiateCall({
      callId: 'test-call-1',
      campaignId: 'camp-1',
      queueItemId: 'queue-1',
      studentId: 'stu-1',
      studentName: 'Rahul Sharma',
      phone: '+91-9876543210',
      courseInterest: 'B.Tech AI & ML',
      collegeName: 'Nexora Institute of Technology',
      campaignPurpose: 'New Admission Outreach',
      preferredLanguage: 'English',
    });

    expect(session.isSimulated).toBe(true);
    expect(session.disclaimer).toBe('DEMO CALL — NO REAL PHONE CALL IS BEING PLACED');
    expect(session.initialAgentGreeting).toContain('Rahul Sharma');
  });

  it('provides natural multilingual greetings across Indian languages', async () => {
    const provider = new DemoCallingProvider();
    const languages: SupportedLanguage[] = [
      'English',
      'Hindi',
      'Marathi',
      'Gujarati',
      'Bengali',
      'Tamil',
      'Telugu',
      'Kannada',
      'Malayalam',
      'Punjabi',
    ];

    for (const lang of languages) {
      const session = await provider.initiateCall({
        callId: `test-${lang}`,
        campaignId: 'camp-1',
        queueItemId: 'queue-1',
        studentId: 'stu-1',
        studentName: 'Amit',
        phone: '+91-9876543210',
        courseInterest: 'B.Tech CSE',
        collegeName: 'Nexora Institute of Technology',
        campaignPurpose: 'Admissions Outreach',
        preferredLanguage: lang,
      });

      expect(session.language).toBe(lang);
      expect(session.initialAgentGreeting.length).toBeGreaterThan(10);
    }
  });

  it('detects language switch requests in real-time dialog', async () => {
    const provider = new DemoCallingProvider();
    const result = await provider.processStudentTurn(
      {
        callId: 'call-1',
        campaignId: 'camp-1',
        queueItemId: 'queue-1',
        studentId: 'stu-1',
        studentName: 'Pooja',
        phone: '+91-9876543210',
        courseInterest: 'B.Tech CSE',
        collegeName: 'Nexora Institute of Technology',
        campaignPurpose: 'Admissions Outreach',
      },
      [],
      'Can we speak in Marathi please?',
      'English',
    );

    expect(result.languageChanged).toBe(true);
    expect(result.language).toBe('Marathi');
    expect(result.detectedLanguage).toBe('Marathi');
  });

  it('detects FEE_QUERY accurately and provides approved fee details', async () => {
    const provider = new DemoCallingProvider();
    const result = await provider.processStudentTurn(
      {
        callId: 'call-1',
        campaignId: 'camp-1',
        queueItemId: 'queue-1',
        studentId: 'stu-1',
        studentName: 'Rohan',
        phone: '+91-9876543210',
        courseInterest: 'B.Tech CSE',
        collegeName: 'Nexora Institute of Technology',
        campaignPurpose: 'Admissions Outreach',
      },
      [],
      'What is the annual fee and is there any scholarship?',
      'English',
    );

    expect(result.intent).toBe('SCHOLARSHIP_QUERY');
    expect(result.agentResponse).toContain('1,45,000');
    expect(result.recommendedAction).toBe('SEND_FEE_INFORMATION');
    expect(result.admissionInterest).toBe('HIGH');
  });

  it('detects CAMPUS_VISIT and recommends scheduling a tour', async () => {
    const provider = new DemoCallingProvider();
    const result = await provider.processStudentTurn(
      {
        callId: 'call-1',
        campaignId: 'camp-1',
        queueItemId: 'queue-1',
        studentId: 'stu-1',
        studentName: 'Aditi',
        phone: '+91-9876543210',
        courseInterest: 'B.Tech AI & ML',
        collegeName: 'Nexora Institute of Technology',
        campaignPurpose: 'Admissions Outreach',
      },
      [],
      'I would like to visit the campus and labs this Saturday with my parents.',
      'English',
    );

    expect(result.intent).toBe('CAMPUS_VISIT');
    expect(result.sentiment).toBe('POSITIVE');
    expect(result.recommendedAction).toBe('SCHEDULE_CAMPUS_VISIT');
    expect(result.suggestedOutcome).toBe('CAMPUS_VISIT_SCHEDULED');
  });

  it('detects DNC / Opt-out requests and immediately flags for suppression', async () => {
    const provider = new DemoCallingProvider();
    const result = await provider.processStudentTurn(
      {
        callId: 'call-1',
        campaignId: 'camp-1',
        queueItemId: 'queue-1',
        studentId: 'stu-1',
        studentName: 'Vikram',
        phone: '+91-9876543210',
        courseInterest: 'B.Tech Mechanical',
        collegeName: 'Nexora Institute of Technology',
        campaignPurpose: 'Admissions Outreach',
      },
      [],
      'Please stop calling me and remove my number from your list.',
      'English',
    );

    expect(result.intent).toBe('OPT_OUT_DNC');
    expect(result.recommendedAction).toBe('MARK_DNC');
    expect(result.suggestedOutcome).toBe('OPTED_OUT_DNC');
    expect(result.shouldEndCall).toBe(true);
  });

  it('throws NOT_IMPLEMENTED when RealTelephonyProvider is unconfigured', async () => {
    const realProvider = new RealTelephonyProvider({ gatewayType: 'NONE' });
    await expect(
      realProvider.initiateCall({
        callId: 'real-1',
        campaignId: 'camp-1',
        queueItemId: 'q-1',
        studentId: 's-1',
        studentName: 'Test',
        phone: '+91-9999999999',
        courseInterest: 'CSE',
        collegeName: 'Nexora',
        campaignPurpose: 'Outreach',
      }),
    ).rejects.toThrow('Real telephony provider is not configured');
  });
});

describe('Calling Agent Service Smart Priority Algorithm', () => {
  const service = new CallingAgentService();

  it('assigns URGENT priority to callback-due candidates', () => {
    const pastTime = new Date(Date.now() - 5 * 60000); // 5 mins ago
    const priority = service.computeSmartPriority({
      name: 'Ananya',
      phone: '+91-9876543210',
      callbackDue: pastTime,
    });

    expect(priority.priorityLevel).toBe('URGENT');
    expect(priority.priorityScore).toBe(100);
    expect(priority.priorityReason).toContain('Due now');
  });

  it('calculates score based on academic score and high intent', () => {
    const priority = service.computeSmartPriority({
      name: 'Karan',
      phone: '+91-9876543210',
      courseInterest: 'B.Tech CSE',
      academicScore: 92,
      leadStage: 'HIGH_INTENT',
    });

    expect(priority.priorityLevel).toBe('HIGH');
    expect(priority.priorityScore).toBeGreaterThanOrEqual(80);
    expect(priority.priorityReason).toContain('Merit profile');
  });
});
