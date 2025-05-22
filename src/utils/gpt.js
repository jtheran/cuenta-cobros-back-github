import OpenAI from 'openai';
import config from '../logs/logger.js';
import logger from '../logs/logger.js';

export const openai = new OpenAI({
  apiKey: config.keyGPT,
});

export const generateEmbedding = async (text) => {
    try{

    const res = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    });

    logger.info('[GPT] EMBEBIDO GENERADO');
    return res.status(200).data[0].embedding;

  }catch(err){}

    logger.info('[GPT] ERROR EMBEBIDO NO GENERADO: '+err.message);
    return res.status(500).json({msg: 'EMBEBIDO NO GENERADO: '});
};

export const askGPT = async (msg) => {

  try{

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente legal para abogados en Colombia. Responde de forma clara, útil y profesional.',
        },
        {
          role: 'user',
          content: msg,
        },
      ],
      temperature: 0.5,
    });

    logger.info('[GPT] RESPUESTA GENERADA....');
    return res.status(200).json({msg: `${completion.choices[0].message.content}`});

  }catch(err){

    logger.error('[GPT] ERROR AL GENERAR LA RESPUESTA: '+err.message);
    return res.json({msg: 'RESPUESTA NO GENERADA CORRECTAMENTE'});

  }

};