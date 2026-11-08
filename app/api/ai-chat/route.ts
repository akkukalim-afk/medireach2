import { NextResponse } from 'next/server';

const SYSTEM_INSTRUCTION = `You are the MediReach Health Assistant, an AI guide on the MediReach medicine ordering platform in Yelahanka, Bengaluru.
Your role is to provide general, educational medicine information (such as active ingredients, common uses, typical side effects, storage guidelines) and help users navigate the MediReach platform (ordering, prescription upload, checking store stock, delay fallback).

CRITICAL SAFETY RULES:
1. NEVER diagnose medical conditions or interpret symptoms as a specific disease.
2. NEVER prescribe dosages, recommend custom drug regimens, or tell a user how many pills to take.
3. ALWAYS state: "Always consult your doctor or registered pharmacist before taking any medication."
4. If a user describes emergency symptoms (chest pain, severe shortness of breath, sudden numbness, anaphylaxis), immediately advise them to call emergency medical services (112 / 108 in India) or visit the nearest emergency room (e.g. Aster CMI / Manipal Hospital).
5. Always maintain a calm, helpful, trustworthy tone.`;

const MEDICAL_KNOWLEDGE_BASE: Record<string, string> = {
  dolo: `**Dolo 650 (Paracetamol 650mg)** is an analgesic (pain reliever) and antipyretic (fever reducer).
- **Common uses:** Managing temporary fever, headaches, muscular aches, and mild flu discomfort.
- **Safety guidelines:** Never exceed 4,000mg (4g) in a 24-hour period. Avoid combining with other paracetamol-containing cold remedies to prevent liver stress.
- **Consultation:** If fever persists beyond 3 days, consult a physician.`,

  paracetamol: `**Paracetamol (Acetaminophen)** is widely used across India for fever management and mild pain relief.
- **Dosage Form:** Commonly available in 500mg (e.g. Crocin) and 650mg (e.g. Dolo).
- **Key Precaution:** Heavy alcohol consumption while taking paracetamol increases hepatotoxicity risk.`,

  azithromycin: `**Azithromycin (e.g., Azee 500mg)** is a prescription macrolide antibiotic.
- **Common uses:** Bacterial respiratory infections, pharyngitis, sinusitis, and skin infections.
- **Important:** As a Schedule H1 prescription medicine, MediReach requires a valid doctor's prescription before checkout. Always complete the entire prescribed course even if you feel better.`,

  augmentin: `**Augmentin 625 Duo** contains Amoxicillin and Clavulanic Acid.
- **Mechanism:** Clavulanic acid blocks bacterial enzymes that destroy amoxicillin, extending its spectrum.
- **Usage:** Take at the start of a meal to minimize gastrointestinal discomfort. Requires a valid doctor's prescription.`,

  digene: `**Digene Gel / Tablets** is an over-the-counter antacid containing Magnesium Hydroxide, Aluminium Hydroxide, and Simethicone.
- **Common uses:** Heartburn, gastric acidity, and gas discomfort.
- **Tip:** Shake the liquid bottle well before use and take 30–60 minutes after meals or at bedtime.`,

  delay: `**MediReach Delay & Unavailability Fallback:**
If your delivery is delayed past the promised ETA or if a selected store is out of stock, MediReach automatically queries nearby Yelahanka pharmacies within 5 km.
- You will see a banner and interactive map showing alternative stores with real-time stock and ETA.
- You can transfer your order with 1 click to the nearest available store.`,

  prescription: `**How to Upload a Prescription on MediReach:**
1. Add your required medicines to the cart.
2. If any item is marked "Rx Required", you will see a prescription upload box at checkout.
3. Upload an image (JPG/PNG) or PDF of your doctor's signed prescription.
4. The pharmacist at the selected pharmacy will verify your prescription before dispatching your order.`,
};

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const lower = message.toLowerCase();

    // Check for emergency keywords
    if (
      lower.includes('heart attack') ||
      lower.includes('chest pain') ||
      lower.includes('cant breathe') ||
      lower.includes("can't breathe") ||
      lower.includes('severe bleeding') ||
      lower.includes('unconscious')
    ) {
      return NextResponse.json({
        reply: `🚨 **EMERGENCY NOTICE**
If you or someone around you is experiencing severe symptoms such as sudden chest tightness, difficulty breathing, or loss of consciousness, please **call emergency services immediately (112 or 108 in India)** or proceed to the nearest hospital emergency room (e.g., Aster Medcity Kogilu or Manipal Hospital Hebbal).

*MediReach AI cannot evaluate emergency life-threatening conditions.*`,
      });
    }

    // Attempt Gemini API if key is set
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SYSTEM_INSTRUCTION}\n\nUser Question: ${message}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({
              reply: `${generatedText}\n\n*⚠️ Disclaimer: MediReach AI provides general pharmacological information only and is NOT a substitute for professional medical advice, diagnosis, or prescription dosages. Always consult your qualified physician or pharmacist.*`,
            });
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local heuristic intelligence:', err);
      }
    }

    // Heuristic / Knowledge-Base Fallback response
    let matchedKnowledge = '';
    for (const [key, text] of Object.entries(MEDICAL_KNOWLEDGE_BASE)) {
      if (lower.includes(key)) {
        matchedKnowledge += text + '\n\n';
      }
    }

    let reply = '';
    if (matchedKnowledge) {
      reply = `${matchedKnowledge}\n\n*⚠️ Disclaimer: MediReach AI provides general pharmacological information only and is NOT a substitute for professional medical advice, diagnosis, or prescription dosages. Always consult your qualified physician or pharmacist.*`;
    } else {
      reply = `Thank you for asking about **"${message}"**.

Here is what you can do on MediReach:
- **Search Medicines:** Explore our catalog of over 50 medicines across Yelahanka pharmacies with live stock statuses.
- **Find Open Pharmacies:** Browse nearby stores with live distance and estimated delivery times.
- **Smart Fallback:** If your medicine is out of stock or your order is delayed, our Fallback Engine automatically finds alternative stores with stock on an interactive map.
- **Prescription Upload:** Seamlessly upload doctor prescriptions for Rx-required medications.

*⚠️ Disclaimer: MediReach AI provides general pharmacological information only and is NOT a substitute for professional medical advice, diagnosis, or prescription dosages. Always consult your qualified physician or pharmacist.*`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

