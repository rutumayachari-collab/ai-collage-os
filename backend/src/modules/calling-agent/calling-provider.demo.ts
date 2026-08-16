import type {
  CallingProvider,
  CallSessionInit,
  TranscriptTurn,
  CallTurnResult,
  CallState,
} from './calling-provider.types';
import type {
  SupportedLanguage,
  CallIntent,
  CallSentiment,
  AdmissionInterestLevel,
  RecommendedActionType,
  CallOutcome,
} from './calling-agent.types';

// ─── Multilingual Greetings & Phrases ────────────────────────────────────────

const LANGUAGE_GREETINGS: Record<SupportedLanguage, string> = {
  English:
    "Hello! I am the AI admissions counselor calling on behalf of Nexora Institute of Technology. You had expressed interest in our admissions. Is this a good time to speak for two minutes? Which language would you prefer to continue in?",
  Hindi:
    'नमस्ते! मैं नेक्सोरा इंस्टीट्यूट ऑफ टेक्नोलॉजी की ओर से एआई एडमिशन असिस्टेंट बात कर रहा हूँ। आपने हमारे एडमिशन में रुचि दिखाई थी। क्या आपसे दो मिनट बात हो सकती है? आप किस भाषा में बात करना पसंद करेंगे?',
  Marathi:
    'नमस्कार! मी नेक्सोरा इन्स्टिट्यूट ऑफ टेक्नॉलॉजीच्या वतीने एआय प्रवेश सहाय्यक बोलत आहे. आपण आमच्या कॉलेज प्रवेशामध्ये स्वारस्य दाखवले होते. आपल्याशी दोन मिनिटे बोलू शकतो का? आपण कोणत्या भाषेत संवाद साधण्यास प्राधान्य द्याल?',
  Gujarati:
    'નમસ્તે! હું નેક્સોરા ઇન્સ્ટિટ્યૂટ ઓફ ટેક્નોલોજી વતી AI એડમિશન આસિસ્ટન્ટ વાત કરી રહ્યો છું. તમે અમારા એડમિશનમાં રસ દર્શાવ્યો હતો. શું તમારી સાથે વાત કરવાનો આ સારો સમય છે? તમે કઈ ભાષામાં વાત કરવાનું પસંદ કરશો?',
  Bengali:
    'নমস্কার! আমি নেক্সোরা ইনস্টিটিউট অফ টেকনোলজির পক্ষ থেকে এআই অ্যাডমিশন অ্যাসিস্ট্যান্ট বলছি। আপনি আমাদের ভর্তি প্রক্রিয়ায় আগ্রহ প্রকাশ করেছিলেন। আপনার সাথে কি কথা বলার উপযুক্ত সময়? আপনি কোন ভাষায় কথা বলতে চান?',
  Tamil:
    'வணக்கம்! நான் நெக்ஸோரா இன்ஸ்டிடியூட் ஆஃப் டெக்னாலஜி சார்பாக பேசும் AI சேர்க்கை உதவியாளர். எங்கள் கல்லூரியில் சேர நீங்கள் விருப்பம் தெரிவித்திருந்தீர்கள். இரண்டு நிமிடங்கள் பேசலாமா? எந்த மொழியில் தொடர விரும்புகிறீர்கள்?',
  Telugu:
    'నమస్కారం! నేను నెక్సోరా ఇన్స్టిట్యూట్ ఆఫ్ టెక్నాలజీ తరపున మాట్లాడుతున్న AI అడ్మిషన్ అసిస్టెంట్‌ని. మీరు మా అడ్మిషన్లలో ఆసక్తి చూపించారు. ఇప్పుడు మాట్లాడటానికి అనుకూలమైన సమయమా? మీరు ఏ భాషలో మాట్లాడటానికి ఇష్టపడతారు?',
  Kannada:
    'ನಮಸ್ಕಾರ! ನಾನು ನೆಕ್ಸೋರಾ ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್ ಆಫ್ ಟೆಕ್ನಾಲಜಿ ಪರವಾಗಿ ಮಾತನಾಡುವ ಎಐ ಪ್ರವೇಶ ಸಹಾಯಕ. ನೀವು ನಮ್ಮ ಪ್ರವೇಶದಲ್ಲಿ ಆಸಕ್ತಿ ತೋರಿಸಿದ್ದೀರಿ. ಮಾತನಾಡಲು ಇದು ಸರಿಯಾದ ಸಮಯವೇ? ನೀವು ಯಾವ ಭಾಷೆಯಲ್ಲಿ ಮುಂದುವರಿಯಲು ಬಯಸುತ್ತೀರಿ?',
  Malayalam:
    'നമസ്കാരം! ഞാൻ നെക്സോറ ഇൻസ്റ്റിറ്റ്യൂട്ട് ഓഫ് ടെക്നോളജിക്ക് വേണ്ടി സംസാരിക്കുന്ന AI അഡ്മിഷൻ അസിസ്റ്റന്റാണ്. ഞങ്ങളുടെ അഡ്മിഷനിൽ നിങ്ങൾ താല്പര്യം പ്രകടിപ്പിച്ചിരുന്നു. രണ്ട് മിനിറ്റ് സംസാരിക്കാൻ ഇത് നല്ല സമയമാണോ? ഏത് ഭാഷയിലാണ് സംസാരിക്കാൻ താല്പര്യപ്പെടുന്നത്?',
  Punjabi:
    'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਨੈਕਸੋਰਾ ਇੰਸਟੀਚਿਊਟ ਆਫ ਟੈਕਨਾਲੋਜੀ ਵੱਲੋਂ ਏਆਈ ਦਾਖਲਾ ਸਹਾਇਕ ਬੋਲ ਰਿਹਾ ਹਾਂ। ਤੁਸੀਂ ਸਾਡੇ ਦਾਖਲੇ ਵਿੱਚ ਦਿਲਚਸਪੀ ਦਿਖਾਈ ਸੀ। ਕੀ ਤੁਹਾਡੇ ਨਾਲ ਗੱਲ ਕਰਨ ਦਾ ਇਹ ਸਹੀ ਸਮਾਂ ਹੈ? ਤੁਸੀਂ ਕਿਸ ਭਾਸ਼ਾ ਵਿੱਚ ਗੱਲ ਕਰਨਾ ਚਾਹੋਗੇ?',
};

export class DemoCallingProvider implements CallingProvider {
  public readonly providerType = 'DEMO' as const;
  public readonly isSimulated = true;

  public async initiateCall(init: CallSessionInit): Promise<{
    sessionId: string;
    initialAgentGreeting: string;
    language: SupportedLanguage;
    callState: CallState;
    isSimulated: boolean;
    disclaimer: string;
  }> {
    const lang: SupportedLanguage = init.preferredLanguage || 'English';
    const baseGreeting = LANGUAGE_GREETINGS[lang] || LANGUAGE_GREETINGS.English;
    const personalizedGreeting = init.studentName
      ? baseGreeting.replace(
          /Hello!|नमस्ते!|नमस्कार!|નમસ્તે!|নমস্কার!|வணக்கம்!|నమస్కారం!|ನಮಸ್ಕಾರ!|നമസ്കാരം!|ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!/,
          (match) => `${match} ${init.studentName},`,
        )
      : baseGreeting;

    return {
      sessionId: `sim-call-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      initialAgentGreeting: personalizedGreeting,
      language: lang,
      callState: 'CONNECTED',
      isSimulated: true,
      disclaimer: 'DEMO CALL — NO REAL PHONE CALL IS BEING PLACED',
    };
  }

  public async processStudentTurn(
    session: CallSessionInit,
    _transcriptHistory: TranscriptTurn[],
    studentUtterance: string,
    currentLanguage: SupportedLanguage,
  ): Promise<CallTurnResult> {
    const cleanText = studentUtterance.toLowerCase().trim();

    // 1. Check for language switch requests
    const langDetect = this.detectLanguageSwitch(cleanText);
    let effectiveLanguage = currentLanguage;
    let languageChanged = false;

    if (langDetect && langDetect !== currentLanguage) {
      effectiveLanguage = langDetect;
      languageChanged = true;
    }

    // 2. Perform admission intent, sentiment, and response evaluation
    const analysis = this.analyzeAdmissionUtterance(cleanText, session, effectiveLanguage);

    return {
      agentResponse: analysis.response,
      language: effectiveLanguage,
      detectedLanguage: langDetect || undefined,
      languageChanged,
      sentiment: analysis.sentiment,
      intent: analysis.intent,
      admissionInterest: analysis.admissionInterest,
      primaryConcern: analysis.primaryConcern,
      recommendedAction: analysis.recommendedAction,
      actionReasoning: analysis.actionReasoning,
      suggestedOutcome: analysis.suggestedOutcome,
      shouldEndCall: analysis.shouldEndCall,
      confidence: analysis.confidence,
    };
  }

  private detectLanguageSwitch(text: string): SupportedLanguage | null {
    if (text.includes('hindi') || text.includes('हिंदी') || text.includes('हिन्दी')) return 'Hindi';
    if (text.includes('marathi') || text.includes('मराठी')) return 'Marathi';
    if (text.includes('gujarati') || text.includes('ગુજરાતી')) return 'Gujarati';
    if (text.includes('bengali') || text.includes('বাংলা') || text.includes('bangla')) return 'Bengali';
    if (text.includes('tamil') || text.includes('தமிழ்')) return 'Tamil';
    if (text.includes('telugu') || text.includes('తెలుగు')) return 'Telugu';
    if (text.includes('kannada') || text.includes('ಕನ್ನಡ')) return 'Kannada';
    if (text.includes('malayalam') || text.includes('മലയാളം')) return 'Malayalam';
    if (text.includes('punjabi') || text.includes('ਪੰਜਾਬੀ')) return 'Punjabi';
    if (text.includes('english') || text.includes('angrezi')) return 'English';
    return null;
  }

  private analyzeAdmissionUtterance(
    text: string,
    session: CallSessionInit,
    language: SupportedLanguage,
  ): {
    response: string;
    sentiment: CallSentiment;
    intent: CallIntent;
    admissionInterest: AdmissionInterestLevel;
    primaryConcern?: string;
    recommendedAction: RecommendedActionType;
    actionReasoning: string;
    suggestedOutcome: CallOutcome;
    shouldEndCall: boolean;
    confidence: number;
  } {
    const course = session.courseInterest || 'B.Tech';

    // ── DNC / Opt-Out Detection ──
    if (
      text.includes('don\'t call') ||
      text.includes('dont call') ||
      text.includes('stop calling') ||
      text.includes('remove my number') ||
      text.includes('never call') ||
      text.includes('do not call') ||
      text.includes('कॉल मत करो') ||
      text.includes('फोन करू नका')
    ) {
      const responseMap: Record<SupportedLanguage, string> = {
        English: "I apologize for any inconvenience. I have marked your preference and we will not contact you again. Have a great day.",
        Hindi: "असुविधा के लिए क्षमा करें। मैंने आपकी प्राथमिकता दर्ज कर ली है और हम आगे से आपको कॉल नहीं करेंगे। आपका दिन शुभ हो।",
        Marathi: "झालेल्या गैरसोयीबद्दल आम्ही दिलगीर आहोत. आम्ही आपली नोंद घेतली असून आपल्याला पुन्हा कॉल केला जाणार नाही. धन्यवाद.",
        Gujarati: "અસુવિધા માટે દિલગીર છીએ. અમે તમારી વિનંતી નોંધી લીધી છે અને ફરીથી કૉલ નહીં કરીએ. તમારો આભાર.",
        Bengali: "অসুবিধার জন্য আমরা দুঃখিত। আপনার পছন্দ নথিভুক্ত করা হয়েছে এবং ভবিষ্যতে আর যোগাযোগ করা হবে না। ধন্যবাদ।",
        Tamil: "ஏற்பட்ட சிரமத்திற்கு மன்னிக்கவும். உங்கள் கோரிக்கை பதிவு செய்யப்பட்டது, இனி தொடர்பு கொள்ள மாட்டோம். நன்றி.",
        Telugu: "అసౌకర్యానికి క్షమించండి. మీ అభ్యర్థన నమోదు చేయబడింది, ఇకపై మేము సంప్రదించము. ధన్యవాదాలు.",
        Kannada: "ಉಂಟಾದ ಅನನುಕೂಲಕ್ಕೆ ಕ್ಷಮಿಸಿ. ನಿಮ್ಮ ಆದ್ಯತೆಯನ್ನು ದಾಖಲಿಸಲಾಗಿದೆ, ಇನ್ನು ಮುಂದೆ ಸಂಪರ್ಕಿಸುವುದಿಲ್ಲ. ಧನ್ಯವಾದಗಳು.",
        Malayalam: "ഉണ്ടായ അസൗകര്യത്തിൽ ക്ഷമ ചോദിക്കുന്നു. നിങ്ങളുടെ താല്പര്യം രേഖപ്പെടുത്തിയിട്ടുണ്ട്, ഇനി ബന്ധപ്പെടില്ല. നന്ദി.",
        Punjabi: "ਹੋਈ ਅਸੁਵਿਧਾ ਲਈ ਮੁਆਫ਼ੀ ਚਾਹੁੰਦੇ ਹਾਂ। ਤੁਹਾਡੀ ਬੇਨਤੀ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ ਅਤੇ ਦੁਬਾਰਾ ਕਾਲ ਨਹੀਂ ਕੀਤੀ ਜਾਵੇਗੀ। ਧੰਨਵਾਦ।",
      };

      return {
        response: responseMap[language] || responseMap.English,
        sentiment: 'FRUSTRATED',
        intent: 'OPT_OUT_DNC',
        admissionInterest: 'LOW',
        primaryConcern: 'Student requested Do Not Call / Opt-out',
        recommendedAction: 'MARK_DNC',
        actionReasoning: 'Student explicitly requested not to be contacted further. Add to DNC suppression list.',
        suggestedOutcome: 'OPTED_OUT_DNC',
        shouldEndCall: true,
        confidence: 0.98,
      };
    }

    // ── Not Interested ──
    if (
      text.includes('not interested') ||
      text.includes('no interest') ||
      text.includes('already took admission') ||
      text.includes('joined another') ||
      text.includes('रुचि नहीं') ||
      text.includes('इच्छा नाही')
    ) {
      const responseMap: Record<SupportedLanguage, string> = {
        English: `Thank you for letting us know! We wish you the very best in your academic journey. Feel free to visit our website if you ever need information in the future.`,
        Hindi: `बताने के लिए धन्यवाद! हम आपकी शैक्षणिक यात्रा के लिए शुभकामनाएं देते हैं। भविष्य में किसी भी जानकारी के लिए हमारी वेबसाइट देख सकते हैं।`,
        Marathi: `माहिती दिल्याबद्दल धन्यवाद! आपल्या पुढील शैक्षणिक प्रवासासाठी मनःपूर्वक शुभेच्छा. भविष्यात माहिती हवी असल्यास आमच्या संकेतस्थळाला भेट द्या.`,
        Gujarati: `જણાવવા બદલ આભાર! તમારી શૈક્ષણિક યાત્રા માટે હાર્દિક શુભેચ્છાઓ.`,
        Bengali: `জানানোর জন্য ধন্যবাদ! আপনার ভবিষ্যৎ শিক্ষার জন্য শুভকামনা রইল।`,
        Tamil: `தெரிவித்தமைக்கு நன்றி! உங்கள் கல்விப் பயணத்திற்கு நல்வாழ்த்துகள்.`,
        Telugu: `తెలియజేసినందుకు ధన్యవాదాలు! మీ విద్యా ప్రయాణానికి శుభాకాంక్షలు.`,
        Kannada: `ತಿಳಿಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಮುಂದಿನ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ಶುಭ ಹಾರೈಕೆಗಳು.`,
        Malayalam: `അറിയിച്ചതിന് നന്ദി! നിങ്ങളുടെ തുടർപഠനത്തിന് ആശംസകൾ നേരുന്നു.`,
        Punjabi: `ਦੱਸਣ ਲਈ ਧੰਨਵਾਦ! ਤੁਹਾਡੀ ਅਕਾਦਮਿਕ ਯਾਤਰਾ ਲਈ ਸ਼ੁੱਭਕਾਮਨਾਵਾਂ।`,
      };

      return {
        response: responseMap[language] || responseMap.English,
        sentiment: 'NEUTRAL',
        intent: 'NOT_INTERESTED',
        admissionInterest: 'LOW',
        primaryConcern: 'Student enrolled elsewhere or not interested',
        recommendedAction: 'MARK_NOT_INTERESTED',
        actionReasoning: 'Student stated they are not pursuing admission with the college.',
        suggestedOutcome: 'NOT_INTERESTED',
        shouldEndCall: true,
        confidence: 0.95,
      };
    }

    // ── Campus Visit ──
    if (
      text.includes('visit') ||
      text.includes('campus tour') ||
      text.includes('see the college') ||
      text.includes('come to college') ||
      text.includes('कैंपस देखना') ||
      text.includes('कॅम्पस भेट')
    ) {
      const responseMap: Record<SupportedLanguage, string> = {
        English: `We would love to host you for a guided campus tour! Our admissions center is open Monday to Saturday from 10:00 AM to 4:00 PM. Would you prefer a weekday or Saturday visit?`,
        Hindi: `हमें कैंपस टूर पर आपका स्वागत करते हुए बहुत खुशी होगी! हमारा एडमिशन सेंटर सोमवार से शनिवार सुबह 10 से शाम 4 बजे तक खुला रहता है। आप किस दिन आना पसंद करेंगे?`,
        Marathi: `आम्हाला कॅम्पस टूरसाठी आपले स्वागत करण्यास नक्कीच आवडेल! आमचे प्रवेश केंद्र सोमवार ते शनिवार सकाळी १० ते दुपारी ४ या वेळेत सुरू असते. आपण कोणत्या वारी भेट देऊ इच्छिता?`,
        Gujarati: `કેમ્પસ ટૂર માટે તમારું સ્વાગત કરતાં અમને આનંદ થશે! અમારું એડમિશન સેન્ટર સોમવારથી શનિવાર સવારે 10 થી સાંજે 4 સુધી ખુલ્લું રહે છે. તમે ક્યારે મુલાકાત લેવાનું પસંદ કરશો?`,
        Bengali: `আমাদের ক্যাম্পাসে আপনাকে স্বাগত জানাতে পেরে আমরা আনন্দিত হব! আমাদের ভর্তি কেন্দ্র সোম থেকে শনিবার সকাল ১০টা থেকে বিকেল ৪টা পর্যন্ত খোলা থাকে। আপনি কোন দিন আসতে চান?`,
        Tamil: `வளாகச் சுற்றுப்பயணத்திற்கு உங்களை வரவேற்பதில் மகிழ்ச்சி! எங்கள் சேர்க்கை மையம் திங்கள் முதல் சனி வரை காலை 10 முதல் மாலை 4 மணி வரை திறந்திருக்கும். நீங்கள் எந்த நாளில் வர விரும்புகிறீர்கள்?`,
        Telugu: `క్యాంపస్ టూర్‌కు మిమ్మల్ని ఆహ్వానించడం మాకు సంతోషం! మా అడ్మిషన్ కేంద్రం సోమవారం నుండి శనివారం వరకు ఉదయం 10 నుండి సాయంత్రం 4 గంటల వరకు తెరిచి ఉంటుంది. మీరు ఎప్పుడు రాదలిచారు?`,
        Kannada: `ಕ್ಯಾಂಪಸ್ ಪ್ರವಾಸಕ್ಕೆ ನಿಮ್ಮನ್ನು ಸ್ವಾಗತಿಸಲು ನಾವು ಸಂತೋಷಪಡುತ್ತೇವೆ! ನಮ್ಮ ಪ್ರವೇಶ ಕೇಂದ್ರವು ಸೋಮವಾರದಿಂದ ಶನಿವಾರದವರೆಗೆ ಬೆಳಗ್ಗೆ 10 ರಿಂದ ಸಂಜೆ 4 ರವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ. ನೀವು ಯಾವ ದಿನ ಭೇಟಿ ನೀಡಲು ಬಯಸುತ್ತೀರಿ?`,
        Malayalam: `കാമ്പസ് ടൂറിലേക്ക് നിങ്ങളെ സ്വാഗതം ചെയ്യുന്നതിൽ സന്തോഷമുണ്ട്! ഞങ്ങളുടെ അഡ്മിഷൻ സെന്റർ തിങ്കൾ മുതൽ ശനി വരെ രാവിലെ 10 മുതൽ വൈകിട്ട് 4 വരെ പ്രവർത്തിക്കുന്നു. ഏത് ദിവസമാണ് വരാൻ താല്പര്യപ്പെടുന്നത്?`,
        Punjabi: `ਕੈਂਪਸ ਦੌਰੇ ਲਈ ਤੁਹਾਡਾ ਸੁਆਗਤ ਕਰਕੇ ਸਾਨੂੰ ਖੁਸ਼ੀ ਹੋਵੇਗੀ! ਸਾਡਾ ਦਾਖਲਾ ਕੇਂਦਰ ਸੋਮਵਾਰ ਤੋਂ ਸ਼ਨੀਵਾਰ ਸਵੇਰੇ 10 ਤੋਂ ਸ਼ਾਮ 4 ਵਜੇ ਤੱਕ ਖੁੱਲ੍ਹਾ ਰਹਿੰਦਾ ਹੈ। ਤੁਸੀਂ ਕਦੋਂ ਆਉਣਾ ਚਾਹੋਗੇ?`,
      };

      return {
        response: responseMap[language] || responseMap.English,
        sentiment: 'POSITIVE',
        intent: 'CAMPUS_VISIT',
        admissionInterest: 'HIGH',
        primaryConcern: 'Prospective student desires in-person campus inspection',
        recommendedAction: 'SCHEDULE_CAMPUS_VISIT',
        actionReasoning: 'Student expressed strong admission interest and requested a campus tour.',
        suggestedOutcome: 'CAMPUS_VISIT_SCHEDULED',
        shouldEndCall: false,
        confidence: 0.94,
      };
    }

    // ── Fee Structure & Scholarship Query ──
    if (
      text.includes('fee') ||
      text.includes('cost') ||
      text.includes('tuition') ||
      text.includes('scholarship') ||
      text.includes('discount') ||
      text.includes('फीस') ||
      text.includes('शुल्क') ||
      text.includes('शिष्यवृत्ती')
    ) {
      const responseMap: Record<SupportedLanguage, string> = {
        English: `For ${course}, our annual tuition fee is ₹1,45,000 per year. We also offer merit scholarships up to 40% based on your 12th/entrance score. Would you like me to connect you with our counselor for exact scholarship eligibility?`,
        Hindi: `${course} के लिए हमारी वार्षिक ट्यूशन फीस ₹1,45,000 प्रति वर्ष है। हम आपके 12वीं/प्रवेश परीक्षा अंकों के आधार पर 40% तक मेरिट स्कॉलरशिप भी प्रदान करते हैं। क्या आप विस्तृत विवरण के लिए हमारे काउंसलर से बात करना चाहेंगे?`,
        Marathi: `${course} साठी आमची वार्षिक फी ₹1,45,000 प्रति वर्ष आहे. तसेच आपल्या १२ वी किंवा प्रवेश परीक्षेतील गुणांवर आधारित ४०% पर्यंत मेरिट शिष्यवृत्ती उपलब्ध आहे. अधिक माहितीसाठी आम्ही समुपदेशकाशी संपर्क करून देऊ का?`,
        Gujarati: `${course} માટે અમારી વાર્ષિક ટ્યુશન ફી દર વર્ષે ₹1,45,000 છે. અમે 40% સુધી મેરિટ સ્કોલરશિપ પણ પ્રદાન કરીએ છીએ. શું તમે વધુ માહિતી માટે કાઉન્સિલર સાથે વાત કરવા માંગો છો?`,
        Bengali: `${course}-এর জন্য আমাদের বার্ষিক টিউশন ফি বছরে ₹১,৪৫,০০০। এছাড়াও উচ্চ মাধ্যমিক বা প্রবেশিকা পরীক্ষার নম্বরের ভিত্তিতে ৪০% পর্যন্ত স্কলারশিপ রয়েছে। আপনি কি কাউন্সেলরের সাথে কথা বলতে চান?`,
        Tamil: `${course} படிப்பிற்கான ஆண்டு கல்விக்கட்டணம் ₹1,45,000 ஆகும். தகுதி அடிப்படையில் 40% வரை கல்வி உதவித்தொகை வழங்கப்படுகிறது. மேலும் விவரங்களுக்கு ஆலோசகரிடம் பேச விரும்புகிறீர்களா?`,
        Telugu: `${course} కోసం మా వార్షిక ఫీజు సంవత్సరానికి ₹1,45,000. మెరిట్ ఆధారంగా 40% వరకు స్కాలర్‌షిప్‌లు కూడా ఉన్నాయి. మరిన్ని వివరాల కోసం కౌన్సెలర్‌తో మాట్లాడాలనుకుంటున్నారా?`,
        Kannada: `${course} ಕೋರ್ಸ್‌ಗೆ ನಮ್ಮ ವಾರ್ಷಿಕ ಶುಲ್ಕ ವರ್ಷಕ್ಕೆ ₹1,45,000 ಆಗಿದೆ. ಮೆರಿಟ್ ಆಧಾರದ ಮೇಲೆ 40% ವರೆಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ ಲಭ್ಯವಿದೆ. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗೆ ಕೌನ್ಸಿಲರ್ ಜೊತೆ ಮಾತನಾಡಲು ಬಯಸುವಿರಾ?`,
        Malayalam: `${course} കോഴ്‌സിന് വാർഷിക ഫീസ് ₹1,45,000 ആണ്. മെറിറ്റ് അടിസ്ഥാനത്തിൽ 40% വരെ സ്കോളർഷിപ്പ് ലഭ്യമാണ്. കൂടുതൽ വിവരങ്ങൾക്ക് കൗൺസിലറുമായി സംസാരിക്കാൻ താല്പര്യമുണ്ടോ?`,
        Punjabi: `${course} ਲਈ ਸਾਡੀ ਸਾਲਾਨਾ ਟਿਊਸ਼ਨ ਫੀਸ ₹1,45,000 ਪ੍ਰਤੀ ਸਾਲ ਹੈ। ਅਸੀਂ 40% ਤੱਕ ਮੈਰਿਟ ਸਕਾਲਰਸ਼ਿਪ ਵੀ ਦਿੰਦੇ ਹਾਂ। ਕੀ ਤੁਸੀਂ ਕਾਊਂਸਲਰ ਨਾਲ ਗੱਲ ਕਰਨਾ ਚਾਹੋਗੇ?`,
      };

      return {
        response: responseMap[language] || responseMap.English,
        sentiment: 'POSITIVE',
        intent: text.includes('scholarship') || text.includes('शिष्यवृत्ती') ? 'SCHOLARSHIP_QUERY' : 'FEE_QUERY',
        admissionInterest: 'HIGH',
        primaryConcern: 'Fee structure and merit scholarship eligibility inquiry',
        recommendedAction: 'SEND_FEE_INFORMATION',
        actionReasoning: 'Student requested official fee breakdown and scholarship options for their desired program.',
        suggestedOutcome: 'INTERESTED',
        shouldEndCall: false,
        confidence: 0.92,
      };
    }

    // ── Callback Request ──
    if (
      text.includes('call back') ||
      text.includes('call me later') ||
      text.includes('call tomorrow') ||
      text.includes('evening') ||
      text.includes('busy right now') ||
      text.includes('बाद में कॉल') ||
      text.includes('नंतर फोन करा') ||
      text.includes('parents')
    ) {
      const responseMap: Record<SupportedLanguage, string> = {
        English: `Understood! I will schedule a callback for you. What time tomorrow would be most convenient for you and your parents?`,
        Hindi: `बिल्कुल! मैं आपके लिए एक कॉलबैक शेड्यूल कर दूंगा। कल आपके और आपके माता-पिता के लिए कौन सा समय सबसे सुविधाजनक रहेगा?`,
        Marathi: `नक्कीच! मी आपल्यासाठी कॉलबॅक शेड्युल करतो. उद्या आपल्यासाठी आणि पालकांसाठी कोणती वेळ सोयीची असेल?`,
        Gujarati: `ચોક્કસ! હું તમારા માટે કૉલબૅક શેડ્યૂલ કરું છું. આવતીકાલે કયો સમય તમારા માટે અનુકૂળ રહેશે?`,
        Bengali: `নিশ্চয়ই! আমি আপনার জন্য একটি কলব্যাক নির্ধারণ করব। আগামীকাল কোন সময় আপনার জন্য সুবিধাজনক হবে?`,
        Tamil: `நிச்சயமாக! உங்களுக்காக மீண்டும் அழைக்க ஏற்பாடு செய்கிறேன். நாளை எந்த நேரம் உங்களுக்கு வசதியாக இருக்கும்?`,
        Telugu: `తప్పకుండా! నేను మీ కోసం కాల్‌బ్యాక్ షెడ్యూల్ చేస్తాను. రేపు ఏ సమయం మీకు అనుకూలంగా ఉంటుంది?`,
        Kannada: `ಖಂಡಿತ! ನಾನು ನಿಮಗಾಗಿ ಕಾಲ್‌ಬ್ಯಾಕ್ ನಿಗದಿಪಡಿಸುತ್ತೇನೆ. ನಾಳೆ ಯಾವ ಸಮಯ ನಿಮಗೆ ಅನುಕೂಲಕರವಾಗಿರುತ್ತದೆ?`,
        Malayalam: `തീർച്ചയായും! ഞാൻ നിങ്ങൾക്കായി തിരികെ വിളിക്കാൻ ക്രമീകരിക്കാം. നാളെ ഏത് സമയമാണ് സൗകര്യം?`,
        Punjabi: `ਜ਼ਰੂਰ! ਮੈਂ ਤੁਹਾਡੇ ਲਈ ਕਾਲਬੈਕ ਤਹਿ ਕਰ ਦਿਆਂਗਾ। ਕੱਲ੍ਹ ਕਿਹੜਾ ਸਮਾਂ ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਰਹੇਗਾ?`,
      };

      return {
        response: responseMap[language] || responseMap.English,
        sentiment: 'NEUTRAL',
        intent: 'CALLBACK_REQUEST',
        admissionInterest: 'MEDIUM',
        primaryConcern: 'Student currently occupied or needs parent consultation',
        recommendedAction: 'SCHEDULE_COUNSELOR_CALLBACK',
        actionReasoning: 'Student requested a callback at a more convenient time.',
        suggestedOutcome: 'CALLBACK_REQUESTED',
        shouldEndCall: true,
        confidence: 0.93,
      };
    }

    // ── Counselor Escalation Request ──
    if (
      text.includes('human') ||
      text.includes('counselor') ||
      text.includes('talk to someone') ||
      text.includes('admission officer') ||
      text.includes('काउंसलर') ||
      text.includes('समुपदेशक')
    ) {
      const responseMap: Record<SupportedLanguage, string> = {
        English: `I would be happy to connect you directly with our senior admissions counselor who can guide you through every detail. Let me arrange that priority call for you.`,
        Hindi: `मैं आपको हमारे वरिष्ठ एडमिशन काउंसलर से सीधे जोड़ दूंगा जो आपको हर विवरण में मार्गदर्शन करेंगे। मैं आपके लिए यह प्राथमिकता कॉल व्यवस्थित कर देता हूँ।`,
        Marathi: `मी आपल्याला थेट आमच्या वरिष्ठ प्रवेश समुपदेशकांशी जोडून देतो जे आपल्याला सविस्तर मार्गदर्शन करतील. मी आपल्यासाठी कॉलची व्यवस्था करतो.`,
        Gujarati: `હું તમને અમારા સિનિયર એડમિશન કાઉન્સિલર સાથે કનેક્ટ કરીશ જે તમને સંપૂર્ણ માર્ગદર્શન આપશે.`,
        Bengali: `আমি আপনাকে আমাদের সিনিয়র অ্যাডমিশন কাউন্সেলরের সাথে সংযুক্ত করে দিচ্ছি যিনি আপনাকে বিস্তারিত তথ্য দেবেন।`,
        Tamil: `எங்கள் மூத்த சேர்க்கை ஆலோசகருடன் உங்களை இணைக்கிறேன், அவர் உங்களுக்கு முழு வழிகாட்டுதல் வழங்குவார்.`,
        Telugu: `మిమ్మల్ని మా సీనియర్ అడ్మిషన్ కౌన్సెలర్‌తో కనెక్ట్ చేస్తాను, వారు మీకు పూర్తి వివరాలను అందిస్తారు.`,
        Kannada: `ನಮ್ಮ ಹಿರಿಯ ಪ್ರವೇಶ ಕೌನ್ಸಿಲರ್ ಅವರೊಂದಿಗೆ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತೇನೆ, ಅವರು ನಿಮಗೆ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತಾರೆ.`,
        Malayalam: `ഞങ്ങളുടെ സീനിയർ അഡ്മിഷൻ കൗൺസിലറുമായി ഞാൻ നിങ്ങളെ ബന്ധിപ്പിക്കാം, അവർ വിശദമായ വിവരങ്ങൾ നൽകും.`,
        Punjabi: `ਮੈਂ ਤੁਹਾਨੂੰ ਸਾਡੇ ਸੀਨੀਅਰ ਦਾਖਲਾ ਕਾਊਂਸਲਰ ਨਾਲ ਜੋੜਦਾ ਹਾਂ ਜੋ ਤੁਹਾਨੂੰ ਪੂਰੀ ਜਾਣਕਾਰੀ ਦੇਣਗੇ।`,
      };

      return {
        response: responseMap[language] || responseMap.English,
        sentiment: 'POSITIVE',
        intent: 'COUNSELOR_REQUEST',
        admissionInterest: 'HIGH',
        primaryConcern: 'Complex query requiring human counseling handoff',
        recommendedAction: 'ESCALATE_COUNSELOR',
        actionReasoning: 'Student specifically requested human counselor interaction.',
        suggestedOutcome: 'COUNSELOR_ESCALATED',
        shouldEndCall: false,
        confidence: 0.95,
      };
    }

    // ── General Admission & Course Inquiry ──
    const responseMap: Record<SupportedLanguage, string> = {
      English: `Our ${course} program at Nexora offers state-of-the-art labs, 94% placement record with top recruiters, and modern hostel facilities. Are you interested in knowing about our eligibility criteria, fee structure, or scheduling a campus visit?`,
      Hindi: `नेक्सोरा में हमारा ${course} प्रोग्राम अत्याधुनिक लैब्स, 94% प्लेसमेंट रिकॉर्ड और आधुनिक हॉस्टल सुविधाएं प्रदान करता है। क्या आप पात्रता, फीस या कैंपस विज़िट के बारे में जानना चाहते हैं?`,
      Marathi: `नेक्सोरा येथील आमचा ${course} अभ्यासक्रम अद्ययावत लॅब्स, ९४% प्लेसमेंट रेकॉर्ड आणि सुसज्ज हॉस्टेल सुविधा देतो. आपल्याला पात्रता, फी किंवा कॅम्पस भेटीबद्दल माहिती हवी आहे का?`,
      Gujarati: `અમારો ${course} પ્રોગ્રામ અદ્યતન લેબ્સ અને 94% પ્લેસમેન્ટ રેકોર્ડ ધરાવે છે. શું તમે પાત્રતા, ફી અથવા કેમ્પસ મુલાકાત વિશે જાણવા માંગો છો?`,
      Bengali: `নেক্সোরাতে আমাদের ${course} প্রোগ্রামে রয়েছে আধুনিক ল্যাব এবং ৯৪% প্লেসমেন্ট রেকর্ড। আপনি কি যোগ্যতা, ফি বা ক্যাম্পাস ভিজিট সম্পর্কে জানতে চান?`,
      Tamil: `எங்கள் ${course} பாடப்பிரிவு அதிநவீன ஆய்வகங்கள் மற்றும் 94% வேலைவாய்ப்பு பதிவைக் கொண்டுள்ளது. தகுதி, கட்டணம் அல்லது வளாக வருகை பற்றி அறிய விரும்புகிறீர்களா?`,
      Telugu: `మా ${course} ప్రోగ్రామ్‌లో అత్యాధునిక ల్యాబ్‌లు మరియు 94% ప్లేస్‌మెంట్ రికార్డ్ ఉన్నాయి. మీరు అర్హత, ఫీజు లేదా క్యాంపస్ సందర్శన గురించి తెలుసుకోవాలనుకుంటున్నారా?`,
      Kannada: `ನಮ್ಮ ${course} ಕೋರ್ಸ್ ಅತ್ಯಾಧುನಿಕ ಲ್ಯಾಬ್‌ಗಳು ಮತ್ತು 94% ಪ್ಲೇಸ್‌ಮೆಂಟ್ ದಾಖಲೆಯನ್ನು ಹೊಂದಿದೆ. ನೀವು ಅರ್ಹತೆ, ಶುಲ್ಕ ಅಥವಾ ಕ್ಯಾಂಪಸ್ ಭೇಟಿಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುವಿರಾ?`,
      Malayalam: `ഞങ്ങളുടെ ${course} പ്രോഗ്രാമിൽ അത്യാധുനിക ലാബുകളും 94% പ്ലേസ്‌മെന്റ് റെക്കോർഡുമുണ്ട്. യോഗ്യത, ഫീസ് അല്ലെങ്കിൽ കാമ്പസ് സന്ദർശനം എന്നിവയെക്കുറിച്ച് അറിയാൻ താല്പര്യമുണ്ടോ?`,
      Punjabi: `ਸਾਡੇ ${course} ਪ੍ਰੋਗਰਾਮ ਵਿੱਚ ਆਧੁਨਿਕ ਲੈਬਾਂ ਅਤੇ 94% ਪਲੇਸਮੈਂਟ ਰਿਕਾਰਡ ਹਨ। ਕੀ ਤੁਸੀਂ ਯੋਗਤਾ, ਫੀਸ ਜਾਂ ਕੈਂਪਸ ਦੌਰੇ ਬਾਰੇ ਜਾਣਨਾ ਚਾਹੁੰਦੇ ਹੋ?`,
    };

    return {
      response: responseMap[language] || responseMap.English,
      sentiment: 'POSITIVE',
      intent: 'ADMISSION_INTEREST',
      admissionInterest: 'MEDIUM',
      primaryConcern: 'Exploring course details and admission prospects',
      recommendedAction: 'SEND_COURSE_INFORMATION',
      actionReasoning: 'Student is exploring program offerings. Send brochure and syllabus overview.',
      suggestedOutcome: 'INTERESTED',
      shouldEndCall: false,
      confidence: 0.88,
    };
  }
}

export const demoCallingProvider = new DemoCallingProvider();
