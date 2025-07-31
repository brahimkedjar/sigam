// /pages/DEA/index.tsx
import React from 'react';
import dynamic from 'next/dynamic';

const DEADashboard = dynamic(() => import('@/features/dea/DEA_dashboard'), { ssr: false });

export default function DEAIndexPage() {
  return <DEADashboard />;
}
