import { GoogleGenAI, Type } from "@google/genai";
import { Language, Briefing } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const MOCK_BRIEFINGS: Briefing[] = [
  {
    id: "1",
    date: "Thursday, March 26, 2026",
    region: "BR",
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
  },
  {
    id: "2",
    date: "Thursday, March 19, 2026",
    region: "MX",
    content: {
      EN: {
        title: "Mexico's Nearshoring Bottleneck: The Senior Talent Deficit",
        sections: [
          {
            heading: "The Engineering Wage Spiral",
            paragraphs: [
              "Monterrey and Guadalajara are at 98% capacity for senior engineering talent. The influx of US tech firms setting up 'nearshore' hubs has driven salaries up by 35-40% in the last 18 months. We are no longer competing with local firms; we are competing with Silicon Valley remote rates. I've seen CTOs lose entire squads to US startups offering $120K USD for roles that paid $70K two years ago.",
              "The 'English-first' requirement is the primary filter failing 70% of otherwise qualified candidates. Technical skills are present, but the communication bridge remains fragile. Firms that invest in internal language training and soft-skill development are scaling 3x faster than those waiting for the 'perfect' bilingual hire who likely doesn't exist at your price point."
            ],
            soWhat: "Stop hunting for the 'perfect' bilingual senior; hire for technical excellence and build the communication layer internally if you want to scale in 2026."
          }
        ]
      },
      ES: {
        title: "Cuello de Botella del Nearshoring en México: El Déficit de Talento Senior",
        sections: [
          {
            heading: "La Espiral Salarial de Ingeniería",
            paragraphs: [
              "Monterrey y Guadalajara están al 98% de su capacidad para talento senior en ingeniería. La afluencia de empresas tecnológicas de EE. UU. que establecen centros de 'nearshore' ha impulsado los salarios un 35-40% en los últimos 18 meses. Ya no competimos con empresas locales; competimos con las tarifas remotas de Silicon Valley. He visto a CTOs perder escuadrones enteros ante startups de EE. UU. que ofrecen $120K USD por roles que pagaban $70K hace dos años.",
              "El requisito de 'inglés primero' es el filtro principal que falla al 70% de los candidatos calificados. Las habilidades técnicas están presentes, pero el puente de comunicación sigue siendo frágil. Las empresas que invierten en capacitación lingüística interna y desarrollo de habilidades blandas están escalando 3 veces más rápido que aquellas que esperan al candidato bilingüe 'perfecto' que probablemente no existe a su nivel de precio."
            ],
            soWhat: "Deje de cazar al senior bilingüe 'perfecto'; contrate por excelencia técnica y construya la capa de comunicación internamente si quiere escalar en 2026."
          }
        ]
      },
      PT: {
        title: "Gargalo do Nearshoring no México: O Déficit de Talentos Seniores",
        sections: [
          {
            heading: "A Espiral Salarial da Engenharia",
            paragraphs: [
              "Monterrey e Guadalajara estão com 98% de capacidade para talentos seniores de engenharia. O fluxo de empresas de tecnologia dos EUA estabelecendo hubs de 'nearshore' elevou os salarios em 35-40% nos últimos 18 meses. Não estamos mais competindo com empresas locais; estamos competindo com as taxas remotas do Silicon Valley. Vi CTOs perderem squads inteiros para startups dos EUA que oferecem US$ 120 mil por cargos que pagavam US$ 70 mil há dois anos.",
              "O requisito 'English-first' é o principal filtro que reprova 70% dos candidatos qualificados. As habilidades técnicas estão presentes, mas a ponte de comunicação permanece frágil. As empresas que investem em treinamento de idiomas interno e desenvolvimento de soft skills estão escalando 3x mais rápido do que aquelas que esperam pela contratação bilíngue 'perfeita' que provavelmente não existe na sua faixa de preço."
            ],
            soWhat: "Pare de caçar o sênior bilíngue 'perfeito'; contrate pela excelência técnica e construva a camada de comunicação internamente se quiser escalar em 2026."
          }
        ]
      }
    }
  },
  {
    id: "3",
    date: "Thursday, March 12, 2026",
    region: "CO",
    content: {
      EN: {
        title: "Colombia's Tech Resilience: Beyond the Rappi Mafia",
        sections: [
          {
            heading: "The Second Wave of Founders",
            paragraphs: [
              "Bogotá and Medellín are witnessing a second wave of founders who aren't just Rappi alumni. We are seeing specialized B2B SaaS and Logistics Tech startups emerging with leaner operations. These founders have learned from the 2021-2022 burn rates and are building for 40-50% gross margins from day one. The network effect in Medellín is particularly strong, rivaling São Paulo in terms of community density.",
              "Geopolitical stability remains the primary concern for foreign VCs. While the local currency has stabilized, the regulatory environment for gig-economy and fintech remains in flux. Smart money is moving into 'infrastructure-play' startups that solve regional logistics and payment friction rather than consumer-facing apps."
            ],
            soWhat: "The smart play in Colombia is B2B infrastructure; consumer apps are saturated and facing regulatory headwinds."
          }
        ]
      },
      ES: {
        title: "Resiliencia Tech en Colombia: Más allá de la Rappi Mafia",
        sections: [
          {
            heading: "La Segunda Ola de Fundadores",
            paragraphs: [
              "Bogotá y Medellín están presenciando una segunda ola de fundadores que no son solo ex-alumnos de Rappi. Estamos viendo el surgimiento de startups especializadas en B2B SaaS y Logistics Tech con operaciones más magras. Estos fundadores han aprendido de las tasas de quema de 2021-2022 y están construyendo para márgenes brutos del 40-50% desde el primer día. El efecto de red en Medellín es particularmente fuerte, rivalizando con São Paulo en términos de densidad comunitaria.",
              "La estabilidad geopolítica sigue siendo la principal preocupación para los VCs extranjeros. Si bien la moneda local se ha estabilizado, el entorno regulatorio para la economía colaborativa y las fintech sigue en constante cambio. El dinero inteligente se está moviendo hacia startups de 'juego de infraestructura' que resuelven la fricción logística y de pagos regional en lugar de aplicaciones orientadas al consumidor."
            ],
            soWhat: "La jugada inteligente en Colombia es la infraestructura B2B; las aplicaciones de consumo están saturadas y enfrentan vientos regulatorios en contra."
          }
        ]
      },
      PT: {
        title: "Resiliência Tech na Colômbia: Além da Rappi Mafia",
        sections: [
          {
            heading: "A Segunda Onda de Fundadores",
            paragraphs: [
              "Bogotá e Medellín estão testemunhando uma segunda onda de fundadores que não são apenas ex-alunos da Rappi. Estamos vendo o surgimento de startups especializadas em B2B SaaS e Logistics Tech com operações mais enxutas. Esses fundadores aprenderam com as taxas de queima de 2021-2022 e estão construindo para margens brutas de 40-50% desde o primeiro dia. O efeito de rede em Medellín é particularmente forte, rivalizando com São Paulo em termos de densidade comunitária.",
              "A estabilidade geopolítica continua sendo a principal preocupação dos VCs estrangeiros. Embora a moeda local tenha se estabilizado, o ambiente regulatório para a gig-economy e fintechs permanece em fluxo. O dinheiro inteligente está migrando para startups de 'infraestrutura' que resolvem o atrito logístico e de pagamentos regional, em vez de aplicativos voltados para o consumidor."
            ],
            soWhat: "A jogada inteligente na Colômbia é a infraestrutura B2B; os aplicativos de consumo estão saturados e enfrentam ventos regulatórios contrários."
          }
        ]
      }
    }
  }
];

export async function generateBriefing(language: Language = 'EN'): Promise<Briefing> {
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
Generate a NEW intelligence briefing about a current high-impact tech or macro trend in Latin America (e.g., AI regulation in Brazil, nearshoring in Mexico, fintech consolidation in Colombia, or lithium geopolitics in the Andes).

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
        required: ["id", "date", "region", "content"]
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

