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
    if (!idProc || !statutProc) return;
    if (statutProc === 'TERMINEE') return;

    const activate = async () => {
      try {
        const currentUrl = window.location.pathname + window.location.search;
        await axios.post(`${apiURL}/api/procedure-etape/start/${idProc}/${etapeNum}`, {
           link: currentUrl
        });
      } catch (err) {
        console.error(`Échec de l'activation de l'étape ${etapeNum}`, err);
      }
    };

    activate();
  }, [idProc, etapeNum, statutProc]);
};
