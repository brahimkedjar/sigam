'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Sidebar from '@/pages/sidebar/Sidebar';
import Navbar from '@/pages/navbar/Navbar';
import { FiChevronRight } from 'react-icons/fi';
import { useViewNavigator } from '@/src/hooks/useViewNavigator';
import styles from './permis.module.css'
import { useActivateEtape } from '@/src/hooks/useActivateEtape';
import ProgressStepper from '@/components/ProgressStepper';
import { STEP_LABELS } from '@/src/constants/steps';
const PermisDesigner = dynamic(() => import('../../../components/PermisDesigner'), {
  ssr: false,
  loading: () => <div>Loading designer...</div>
});

interface PermisSaveResponse {
  id: number;
  [key: string]: any; // Allow other properties if needed
}

const Step10GeneratePermis = () => {
  const searchParams = useSearchParams();
  const idProcStr = searchParams?.get('id');
  const idProc = idProcStr ? parseInt(idProcStr, 10) : undefined;
  const [permisData, setPermisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const [idDemande, setIdDemande] = useState<string | null>(null);
  const [codeDemande, setCodeDemande] = useState<string | null>(null);
  const [statutProc, setStatutProc] = useState<string | undefined>(undefined);
  const { currentView, navigateTo } = useViewNavigator();
  useActivateEtape({ idProc, etapeNum: 9, statutProc });
  const currentStep = 8;

  useEffect(() => {
    
    if (!idProc) return;

    axios.get(`${apiURL}/api/procedures/${idProc}/demande`)
      .then(res => {
        setIdDemande(res.data.id_demande?.toString());
        setCodeDemande(res.data.code_demande!);
        setStatutProc(res.data.procedure.statut_proc);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de la demande", err);
        setError("Impossible de récupérer la demande");
      });
  }, [idProc]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiURL}/api/procedures/${idProc}/demande`);
        const demandeId = response.data.id_demande;
        
        const summaryResponse = await axios.get(`${apiURL}/api/demande/${demandeId}/summary`);
        setPermisData(summaryResponse.data);
        console.log("qqqqqqqqqq",summaryResponse.data)
      } catch (err) {
        console.error('Failed to fetch permis data', err);
        setError('Failed to load permis data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (idProc) fetchData();
  }, [idProc, apiURL]);

  const handleSaveDesign = async (design: any): Promise<void> => {
    try {
      await axios.post(`${apiURL}/api/permis/templates`, design);
    } catch (error) {
      console.error('Failed to save design', error);
      throw new Error('Failed to save design');
    }
  };

  const handleGeneratePdf = async (design: any) => {
    try {
      const response = await axios.post(`${apiURL}/api/permis/generate-pdf`, design, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate PDF', error);
      throw new Error('Failed to generate PDF');
    }
  };

const handleSavePermis = async (permisData: any): Promise<PermisSaveResponse> => {
  try {
    const response = await axios.post(`${apiURL}/api/permis/save-permis`, {
      elements: permisData.elements, // Make sure this is included
      data: permisData,
      id_demande: parseInt(idDemande!)
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to save permis', error);
    throw new Error('Failed to save permis');
  }
};
  if (loading) return <div className="loading">Loading permis data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!permisData) return <div className="error">No permis data found</div>;

  return (<div className={styles['app-container']}>
      <Navbar />
      <div className={styles['app-content']}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles['main-content']}>
          <div className={styles.headerContainer}>
            <ProgressStepper steps={STEP_LABELS} currentStep={currentStep} />
            <h1 className={styles.mainTitle}>
              <span className={styles.stepNumber}>8</span>
              Décision du Comité de Direction
            </h1>
          </div>
          <div className={styles['breadcrumb']}>
            <span>SIGAM</span>
            <FiChevronRight className={styles['breadcrumb-arrow']} />
            <span>Genaration Permis</span>
          </div>
    <div className="page-container">
      <PermisDesigner 
        initialData={permisData}
        onSave={handleSaveDesign}
        onGeneratePdf={handleGeneratePdf}
        onSavePermis={handleSavePermis}
      />

      <style jsx>{`
        .page-container {
          margin: 0 auto;
        }
        .loading, .error {
          padding: 20px;
          text-align: center;
        }
        .error {
          color: #d32f2f;
        }
      `}</style>
    </div>
    </main>
    </div>
    </div>
  );
};

export default Step10GeneratePermis;