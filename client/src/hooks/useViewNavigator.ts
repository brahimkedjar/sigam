// src/hooks/useViewNavigator.ts
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/useAuthStore';
import type { ViewType } from '../types/viewtype';
import { useRouterWithLoading } from './useRouterWithLoading';

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
  'controle_minier': 'controle_minier',
  'manage_users': 'manage_users',
  'manage_documents': 'manage_documents',
  'Audit_Logs': 'Audit_Logs',
  'gestion_experts': 'manage_documents',
  'Gestion_seances': 'view_dashboard'
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
  'controle_minier': '/controle-minier',
  'manage_users': '/admin_panel/manage_users',
  'manage_documents': '/admin_panel/DossierAdminPage',
  'Audit_Logs': '/audit-logs/page',
  'gestion_experts': '/gestion_experts/page',
  'Gestion_seances': '/seances/Dashboard_seances'

};

export const useViewNavigator = (initialView: ViewType = 'dashboard') => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const router = useRouterWithLoading();
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


