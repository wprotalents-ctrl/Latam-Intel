/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Briefing, Category, IntelligenceBrief } from "../types";
import { db, handleFirestoreError, FirestoreOperation } from "../firebase";
import { doc, setDoc, collection, getDocs, query, orderBy, limit, where, serverTimestamp } from "firebase/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const MOCK_BRIEFINGS: Briefing[] = [
  {
    id: "1",
    date: "Thursday, March 26, 2026",
    region: "BR",
    category: "TECH",
    isPremium: false,
    content: {
      EN: {
        title: "Brazil's FinTech Consolidation: The 'Super-App' War Ends in Unit Economics",
        sections: [
          {
            heading: "The End of Subsidized Growth",
            paragraphs: [
              "The era of subsidized customer acquisition in Brazil is dead. Major players like Nubank and Inter have pivoted from raw user growth to ARPU (Average Revenue Per User). We are tracking a 15-20% reduction in marketing spend across the top five fintechs as they prioritize profitability over market share. If you are still pitching 'growth at all costs' to your board, you are out of touch with the current capital environment.",
              "Consolidation is the only exit for mid-tier players. Neobanks with fewer than 5 million users are drowning in rising cost of capital and regulatory compliance burdens. Expect at least three major M&A announcements in the next 90 days as larger ecosystems swallow specialized niche players to acquire their deposits and license infrastructure."
            ],
            soWhat: "Profitability is the new growth; if your fintech client isn't showing a clear path to positive unit economics, their valuation is a liability in this cycle."
          }
        ]
      },
      ES: {
        title: "Consolidación FinTech en Brasil: La Guerra de las 'Super-Apps' Termina en Economía de la Unidad",
        sections: [
          {
            heading: "El Fin del Crecimiento Subsidiado",
            paragraphs: [
              "La era de la adquisición de clientes subsidiada en Brasil ha muerto. Los principales actores como Nubank e Inter han pasado del crecimiento bruto de usuarios al ARPU (Ingreso Promedio por Usuario). Estamos rastreando una reducción del 15-20% en el gasto de marketing en las cinco principales fintechs mientras priorizan la rentabilidad sobre la cuota de mercado. Si todavía está presentando 'crecimiento a toda costa' a su junta directiva, está fuera de sintonía con el entorno de capital actual.",
              "La consolidación es la única salida para los actores de nivel medio. Los neobancos con menos de 5 millones de usuarios se están ahogando en el creciente costo del capital y las cargas de cumplimiento regulatorio. Se esperan al menos tres anuncios importantes de M&A en los próximos 90 días a medida que los ecosistemas más grandes absorban a los actores de nicho especializados para adquirir sus depósitos e infraestructura de licencias."
            ],
            soWhat: "La rentabilidad es el nuevo crecimiento; si su cliente fintech no muestra un camino claro hacia una economía de unidad positiva, su valoración es un pasivo en este ciclo."
          }
        ]
      },
      PT: {
        title: "Consolidação das FinTechs no Brasil: A Guerra dos 'Super-Apps' Termina na Unit Economics",
        sections: [
          {
            heading: "O Fim do Crescimento Subsidiado",
            paragraphs: [
              "A era da aquisição subsidiada de clientes no Brasil morreu. Grandes players como Nubank e Inter mudaram o foco do crescimento bruto de usuários para o ARPU (Receita Média por Usuário). Estamos monitorando uma redução de 15-20% nos gastos com marketing nas cinco principais fintechs, pois elas priorizam a lucratividade em vez da participação de mercado. Se você ainda está defendendo 'crescimento a qualquer custo' para o seu conselho, você está fora de sintonia com o atual ambiente de capital.",
              "A consolidação é a única saída para os players de médio porte. Neobancos com menos de 5 milhões de usuários estão se afogando no aumento do custo de capital e nos encargos de conformidade regulatória. Espere pelo menos três grandes anúncios de M&A nos próximos 90 dias, à medida que ecossistemas maiores engolem players de nicho especializados para adquirir seus depósitos e infraestrutura de licença."
            ],
            soWhat: "Lucratividade é o novo crescimento; se o seu cliente fintech não estiver mostrando um caminho claro para uma unit economics positiva, seu valuation é um passivo neste ciclo."
          }
        ]
      }
    }
  }
];

export async function saveBriefing(briefing: Briefing) {
  try {
    await setDoc(doc(db, "briefings", briefing.id), {
      ...briefing,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, FirestoreOperation.WRITE, `briefings/${briefing.id}`);
  }
}

export async function saveIntelligenceBrief(brief: IntelligenceBrief) {
  try {
    await setDoc(doc(db, "intelligence_briefs", brief.id), {
      ...brief,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, FirestoreOperation.WRITE, `intelligence_briefs/${brief.id}`);
  }
}

export async function generateIntelligenceBrief(newsContext: string, jobsContext: string): Promise<IntelligenceBrief> {
  const prompt = `Role: You are the Lead Talent Intelligence Expert for WProTalents, focusing on the LATAM AI workforce. 
Your task is to process raw JSON data from news and job APIs into a structured intelligence brief for the "WPro Workforce Daily" dashboard and newsletter.

CONTEXT:
NEWS: ${newsContext}
JOBS: ${jobsContext}

Tone: Intelligent, concise, and informal—like a "text from your smartest friend" in the industry. Avoid boring B2B jargon.
Frame every insight as a useful resource to solve a hiring or workforce problem.

Categorization Logic: Assign every entry to one of these 5 core buckets:
- Workforce Daily: General LATAM AI market shifts.
- TechJobs: High-signal technical roles and talent scarcity trends.
- AI Impact: How automation is reshaping specific LATAM sectors.
- Recruitment: Operational Intel for HR leaders.
- HR: Policy, legal, and remote-work culture updates.

Content Hierarchy:
- Hiring Signal Flag: Identify US/EU firms opening offices or hiring aggressively in Brazil (BR), Mexico (MX), Colombia (CO), Argentina (AR), or Chile (CL).
- The Teaser (Free Tier): A 150-word snappy summary of the "what."
- The Deep Dive ($29 Pro Tier): Analysis of "why this matters" and "what to do."
- Internal Share Hook: A 1-sentence "Slack-ready" summary designed to be copied into corporate channels to drive virality.

Output Format: Return valid JSON only.
{
  "id": "unique_slug",
  "category": "Bucket_Name",
  "country_code": "BR|MX|CO|AR|CL",
  "is_hiring_signal": true/false,
  "subject_line": "informal, lower-case, evocative",
  "free_teaser": "snappy 150-word summary",
  "paid_analysis": "full deep-dive for members",
  "slack_hook": "one-sentence internal share summary",
  "target_persona": "Hiring Manager|Candidate|Analyst"
}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['Workforce Daily', 'TechJobs', 'AI Impact', 'Recruitment', 'HR'] },
          country_code: { type: Type.STRING, enum: ['BR', 'MX', 'CO', 'AR', 'CL'] },
          is_hiring_signal: { type: Type.BOOLEAN },
          subject_line: { type: Type.STRING },
          free_teaser: { type: Type.STRING },
          paid_analysis: { type: Type.STRING },
          slack_hook: { type: Type.STRING },
          target_persona: { type: Type.STRING, enum: ['Hiring Manager', 'Candidate', 'Analyst'] }
        },
        required: ["id", "category", "country_code", "is_hiring_signal", "subject_line", "free_teaser", "paid_analysis", "slack_hook", "target_persona"]
      }
    }
  });

  try {
    return JSON.parse(response.text) as IntelligenceBrief;
  } catch (error) {
    console.error("Failed to parse Intelligence Brief response:", error);
    throw error;
  }
}

export async function getRecentBriefings(limitCount: number = 10, isPremiumUser: boolean = false): Promise<Briefing[]> {
  try {
    let q;
    if (isPremiumUser) {
      q = query(collection(db, "briefings"), orderBy("createdAt", "desc"), limit(limitCount));
    } else {
      q = query(collection(db, "briefings"), where("isPremium", "==", false), orderBy("createdAt", "desc"), limit(limitCount));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Briefing);
  } catch (error) {
    handleFirestoreError(error, FirestoreOperation.LIST, "briefings");
    return MOCK_BRIEFINGS;
  }
}

export async function generateBriefing(language: Language = 'EN', category: Category = 'Workforce Daily'): Promise<Briefing> {
  const langNames = {
    EN: 'English',
    ES: 'Spanish',
    PT: 'Portuguese'
  };

  const prompt = `You are the editorial voice of WProTalents Intel, a premium weekly talent intelligence briefing for Latin American tech executives and global professionals with LatAm exposure.

AUTHOR BACKGROUND:
Founder of WProTalents. 20 years recruiting C-level and tech talent across LatAm. Deep network across CO, BR, MX, AR, CL. Pattern recognition across hundreds of hiring cycles. You have watched LatAm tech evolve from outsourcing to genuine innovation. Network: 23K direct connections — mostly CTOs, VPs, founders.

TONE RULES (non-negotiable):
- Direct. No filler. Never start with "In today's rapidly evolving landscape"
- Executive-level — assume they are busy, smart, skeptical of hype
- One "So what?" at the end of every section — single actionable implication
- Geopolitics always connected to tech or business impact
- Numbers when you have them. Ranges are fine. Vague is not.
- English default. Bilingual awareness — some readers think in Spanish
- No catastrophizing. No cheerleading. Signal over noise.
- Write like a veteran who has seen trends come and go

TASK:
Generate a NEW intelligence briefing about a current high-impact trend in Latin America.
CATEGORY: ${category}
Topics to cover based on category:
- Workforce Daily: General LATAM AI market shifts.
- TechJobs: High-signal technical roles and talent scarcity trends.
- AI Impact: How automation is reshaping specific LATAM sectors.
- Recruitment: Operational Intel for HR leaders.
- HR: Policy, legal, and remote-work culture updates.

The response MUST be in ${langNames[language]}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          date: { type: Type.STRING },
          region: { type: Type.STRING },
          category: { type: Type.STRING },
          isPremium: { type: Type.BOOLEAN },
          content: {
            type: Type.OBJECT,
            properties: {
              EN: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  sections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        heading: { type: Type.STRING },
                        paragraphs: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        soWhat: { type: Type.STRING }
                      },
                      required: ["heading", "paragraphs", "soWhat"]
                    }
                  }
                },
                required: ["title", "sections"]
              },
              ES: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  sections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        heading: { type: Type.STRING },
                        paragraphs: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        soWhat: { type: Type.STRING }
                      },
                      required: ["heading", "paragraphs", "soWhat"]
                    }
                  }
                },
                required: ["title", "sections"]
              },
              PT: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  sections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        heading: { type: Type.STRING },
                        paragraphs: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        soWhat: { type: Type.STRING }
                      },
                      required: ["heading", "paragraphs", "soWhat"]
                    }
                  }
                },
                required: ["title", "sections"]
              }
            },
            required: [language]
          }
        },
        required: ["id", "date", "region", "category", "isPremium", "content"]
      }
    }
  });

  try {
    const briefing = JSON.parse(response.text);
    const fullBriefing: Briefing = {
      ...briefing,
      content: {
        EN: briefing.content.EN || { title: "", sections: [] },
        ES: briefing.content.ES || { title: "", sections: [] },
        PT: briefing.content.PT || { title: "", sections: [] },
      }
    };
    return fullBriefing;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw error;
  }
}

