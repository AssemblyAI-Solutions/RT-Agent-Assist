import axios from 'axios';

export default async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.assemblyai.com/v2/realtime/token',
      { expires_in: 3600 },
      { headers: { authorization: process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY } }
    );
    const { data } = response;
    res.json(data);
  } catch (error) {
    const { response: { status, data } } = error;
    res.status(status).json(data);
  }
};
