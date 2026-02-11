
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCandidateMatch = async (jobRequirements: string[], resumeText: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Atue como um Especialista em Recrutamento e Seleção. 
        Analise o currículo fornecido em relação aos requisitos da vaga.
        
        REQUISITOS DA VAGA:
        ${jobRequirements.join(', ')}
        
        TEXTO DO CURRÍCULO:
        ${resumeText}
        
        Instruções:
        1. Calcule um Score de 0 a 100.
        2. Justifique a pontuação de forma técnica e objetiva.
        3. Identifique habilidades faltantes (missingSkills).
        4. Crie 3 perguntas de entrevista personalizadas para validar os pontos onde o candidato parece mais fraco ou onde há dúvidas sobre a experiência.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: 'Score de 0 a 100 indicando o match.'
            },
            reasoning: {
              type: Type.STRING,
              description: 'Breve explicação da pontuação.'
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Skills que o candidato não possui.'
            },
            interviewQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 perguntas sugeridas para a entrevista.'
            }
          },
          required: ['score', 'reasoning', 'missingSkills', 'interviewQuestions']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};
