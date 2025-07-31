
// /pages/DEA/index.tsx
import React from 'react';
import dynamic from 'next/dynamic';

const SuiviDemandes = dynamic(() => import('@/features/dashboard/suivi_procedure'), { ssr: false });

export default function SuiviDemandesIndexPage() {
  return <SuiviDemandes />;
}
