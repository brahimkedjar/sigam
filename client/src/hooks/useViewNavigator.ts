// src/hooks/useViewNavigator.ts
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import type { ViewType } from '@/types/viewtype';

const permissionMap: Record<ViewType, string> = {
  'dashboard': 'view_dashboard',
  'nouvelle-demande': 'create_demande',
  'gestion-permis': 'manage_permits',
  'procedures': 'view_procedures',
  'instruction-cadastrale': 'view_cadastre',
  'generateur-permis': 'generate_permits',
  'parametres': 'manage_settings',
  'gestion-utilisateurs': 'manage_users',
  'Admin-Panel': 'Admin-Panel',
  'Payments': 'Payments',
  'controle_minier': 'controle_minier'
};

const routeMap: Record<ViewType, string> = {
  'dashboard': '/permis_dashboard/PermisDashboard',
  'nouvelle-demande': '/demande/step1/page1',
  'gestion-permis': '/gestion-permis',
  'procedures': '/dashboard/suivi_procedure',
  'instruction-cadastrale': '/instruction-cadastrale',
  'generateur-permis': '/generateur-permis',
  'parametres': '/parametres',
  'gestion-utilisateurs': '/gestion-utilisateurs',
  'Admin-Panel': '/admin_panel/panel',
  'Payments': '/DEA/DEA_dashboard',
   'controle_minier': '/controle-minier'
};

export const useViewNavigator = (initialView: ViewType = 'dashboard') => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const navigateTo = (view: ViewType) => {
    const permissionRequired = permissionMap[view];
    if (permissionRequired && !hasPermission(permissionRequired)) return;
    setCurrentView(view);
    router.push(routeMap[view]);
  };

  return {
    currentView,
    navigateTo
  };
};
