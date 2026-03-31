/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { Language, Briefing, Category } from "../types";
import { db, handleFirestoreError, FirestoreOperation } from "../firebase";
import { doc, setDoc, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";

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
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, FirestoreOperation.WRITE, `briefings/${briefing.id}`);
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

export async function generateBriefing(language: Language = 'EN', category: Category = 'TECH'): Promise<Briefing> {
  const langNames = {
    EN: 'English',
    ES: 'Spanish',
    PT: 'Portuguese'
  };

  const prompt = `You are the editorial voice of LATAM INTEL, a premium weekly intelligence briefing for Latin American tech executives and global professionals with LatAm exposure.

AUTHOR BACKGROUND:
20 years recruiting C-level and tech talent across LatAm. Deep network across CO, BR, MX, AR, CL. Pattern recognition across hundreds of hiring cycles. You have watched LatAm tech evolve from outsourcing to genuine innovation. LinkedIn: 23K direct connections — mostly CTOs, VPs, founders.

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
- JOBS: Market shifts, salary trends, remote work impact.
- AI_IMPACT: Job loss vs creation, productivity gains, automation risks.
- RECRUITMENT: New tools, C-level shifts, talent wars.
- HR: Retention strategies, culture shifts in tech hubs.
- TECH: General ecosystem trends (Fintech, SaaS, Infrastructure).

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

