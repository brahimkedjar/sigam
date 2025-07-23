// hooks/useActivateEtape.ts
import { useEffect } from 'react';
import axios from 'axios';

interface UseActivateEtapeOptions {
  idProc?: number;
  etapeNum: number;
  statutProc?: string;
}

export const useActivateEtape = ({ idProc, etapeNum, statutProc }: UseActivateEtapeOptions) => {
  useEffect(() => {
    if (!idProc || !statutProc ||  window.self !== window.top) return;
    if (statutProc === 'TERMINEE') return;

    const activate = async () => {
      try {
        await axios.post(`http://localhost:3001/api/procedure-etape/start/${idProc}/${etapeNum}`);
      } catch (err) {
        console.error(`Échec de l'activation de l'étape ${etapeNum}`, err);
      }
    };

    activate();
  }, [idProc, etapeNum, statutProc]);
};
