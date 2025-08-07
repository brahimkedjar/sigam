'use client';

import styles from './PermisDashboard.module.css';
import { useEffect, useState } from 'react';
import { 
  FiCalendar, 
  FiFileText, 
  FiActivity, 
  FiUsers, 
  FiRefreshCw,
  FiTrendingUp,
  FiX,
  FiSearch,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import Navbar from '../../features/navbar/Navbar';
import Sidebar from '../../features/sidebar/Sidebar';
import { ViewType } from '../../src/types/viewtype';
import router from 'next/router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useViewNavigator } from '../../src/hooks/useViewNavigator';

// Types
type DashboardStats = {
  total: number;
  actifs: number;
  enCours: number;
  expires: number;
};

type EvolutionData = {
  year: string;
  value: number;
};

type TypeDistribution = {
  name: string;
  value: number;
  color: string;
};

type Permis = {
  id: number;
  code_permis: string;
  date_octroi: string;
  date_expiration: string;
  superficie?: number;
  typePermis: {
    lib_type: string;
  };
  detenteur?: {
    nom_sociétéFR: string;
  };
  statut?: {
    lib_statut: string;
  };
  procedures?: {
    SubstanceAssocieeDemande: {
      substance: {
        nom_subFR: string;
      };
    }[];
  }[];
};

type Demande = {
  id_demande: number;
  code_demande: string;
  date_demande: string;
  statut_juridique_terrain: string;
  procedure: {
    statut_proc: string;
  };
  detenteur?: {
    nom_sociétéFR: string;
  };
};

export default function PermisDashboard() {
  // Dashboard data states
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    actifs: 0,
    enCours: 0,
    expires: 0
  });
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [typeData, setTypeData] = useState<TypeDistribution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  
  // Data states
  const [permisData, setPermisData] = useState<Permis[]>([]);
  const [activePermisData, setActivePermisData] = useState<Permis[]>([]);
  const [expiredPermisData, setExpiredPermisData] = useState<Permis[]>([]);
  const [demandesData, setDemandesData] = useState<Demande[]>([]);
  const [currentDataType, setCurrentDataType] = useState<'total' | 'actifs' | 'enCours' | 'expires' | 'expiringSoon'>('total');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPermisPage, setCurrentPermisPage] = useState(1);
  const [permisPerPage] = useState(10);
  const [totalPermisCount, setTotalPermisCount] = useState(0);
  const [isLoadingPermis, setIsLoadingPermis] = useState(false);
  const [permisList, setPermisList] = useState<Permis[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentView, navigateTo } = useViewNavigator('dashboard');
  const filteredPermis = permisList.filter((permis) => {
  const query = searchQuery.toLowerCase();
  const matchesSearch =
    permis.code_permis.toLowerCase().includes(query) ||
    permis.typePermis?.lib_type.toLowerCase().includes(query) ||
    permis.detenteur?.nom_sociétéFR.toLowerCase().includes(query);
  const now = new Date();
  const isExpired = !!permis.date_expiration && new Date(permis.date_expiration) < now;
  const isActive = permis.statut?.lib_statut === 'Actif';
  let matchesStatus: boolean = true;
  if (statusFilter === 'active') matchesStatus = !!isActive;
  else if (statusFilter === 'expired') matchesStatus = !!isExpired;
  return matchesSearch && matchesStatus;
});
  const [expiringSoonPermis, setExpiringSoonPermis] = useState<Permis[]>([]);

  useEffect(() => {
  const now = new Date();
  const sixMonthsLater = new Date();
  sixMonthsLater.setMonth(now.getMonth() + 6);

  const expiring = permisList.filter(permis => {
    const expDate = permis.date_expiration ? new Date(permis.date_expiration) : null;
    return expDate && expDate > now && expDate <= sixMonthsLater;
  });

  setExpiringSoonPermis(expiring);
}, [permisList]);


   /*const fetchExpiringSoonPermis = async () => {
  try {
    const response = await axios.get(`${apiURL}/Permisdashboard/expiring-soon`);
    setExpiringSoonPermis(response.data);
  } catch (err) {
    console.error('Failed to fetch expiring soon permis:', err);
  }
};*/

const handleViewPermis = (permisId: number) => {
  // Implement view logic
router.push(`/permis_dashboard/view/permisdetails?id=${permisId}`);
};

const handleDeletePermis = async (permisId: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce permis?')) {
    try {
      await axios.delete(`${apiURL}/Permisdashboard/${permisId}`);
      setPermisList(permisList.filter(p => p.id !== permisId));
      alert('Permis supprimé avec succès');
    } catch (error) {
      console.error('Error deleting permis:', error);
      alert('Erreur lors de la suppression du permis');
    }
  }
};

  const fetchPermisList = async (page: number = 1) => {
  setIsLoadingPermis(true);
  try {
    const response = await axios.get(`${apiURL}/Permisdashboard`, {
      params: {
        page: Number(page),
        limit: Number(permisPerPage)
      }
    });
    setPermisList(response.data.data || response.data);
    setTotalPermisCount(response.data.totalCount || response.data.length);
  } catch (error) {
    console.error('Error fetching permis list:', error);
  } finally {
    setIsLoadingPermis(false);
  }
};

  // Function to get substances for a permis
  const getSubstancesForPermis = (permis: Permis) => {
    if (!permis.procedures) return [];
    const substances = new Set<string>();
    
    permis.procedures.forEach(procedure => {
      procedure.SubstanceAssocieeDemande?.forEach(assoc => {
        substances.add(assoc.substance.nom_subFR);
      });
    });
    
    return Array.from(substances);
  };

  // Handle pagination change
  const handlePermisPageChange = (page: number) => {
    setCurrentPermisPage(page);
    fetchPermisList(page);
  };

  // Add to your useEffect for initial data loading
  useEffect(() => {
    fetchDashboardData();
    fetchPermisList();
  }, []);


  // Get current data based on type
  const getCurrentData = () => {
  switch (currentDataType) {
    case 'total': return permisData;
    case 'actifs': return activePermisData;
    case 'expires': return expiredPermisData;
    case 'enCours': return demandesData;
    case 'expiringSoon': return expiringSoonPermis;
    default: return [];
  }
};


  // Re-render modal when filters or data change
  useEffect(() => {
    if (modalOpen) {
      const data = getCurrentData();
      if (data.length > 0) {
        if (currentDataType === 'enCours') {
          renderDemandesModal(modalTitle, data as Demande[]);
        } else {
          renderPermisModal(modalTitle, data as Permis[]);
        }
      }
    }
  }, [searchTerm, statusFilter, currentPage, permisData, activePermisData, expiredPermisData, demandesData, modalOpen]);

  // Fetch dashboard summary data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, evolutionResponse, typesResponse] = await Promise.all([
        axios.get(`${apiURL}/api/dashboard/stats`),
        axios.get(`${apiURL}/api/dashboard/evolution`),
        axios.get(`${apiURL}/api/dashboard/types`)
      ]);

      setStats(statsResponse.data);
      setEvolutionData(evolutionResponse.data);
      setTypeData(typesResponse.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Échec du chargement des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed data when cards are clicked
  const fetchDetailedData = async (type: 'total' | 'actifs' | 'enCours' | 'expires') => {
    try {
      setLoading(true);
      
      let endpoint = '';
      let title = '';
      
      switch (type) {
        case 'total':
          endpoint = `${apiURL}/Permisdashboard`;
          title = 'Tous les permis';
          break;
        case 'actifs':
          endpoint = `${apiURL}/Permisdashboard/actifs`;
          title = 'Permis actifs';
          break;
        case 'enCours':
          endpoint = `${apiURL}/Demandesdashboard/en-cours`;
          title = 'Demandes en cours';
          break;
        case 'expires':
          endpoint = `${apiURL}/Permisdashboard/expires`;
          title = 'Permis expirés';
          break;
      }
      
      const response = await axios.get(endpoint);
      
      if (type === 'total') {
        setPermisData(response.data);
      } else if (type === 'actifs') {
        setActivePermisData(response.data);
      } else if (type === 'expires') {
        setExpiredPermisData(response.data);
      } else if (type === 'enCours') {
        setDemandesData(response.data);
      }
      
      setModalTitle(title);
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch detailed data:', err);
      setError('Échec du chargement des données détaillées');
    } finally {
      setLoading(false);
    }
  };

  // Render permis modal content
  const renderPermisModal = (title: string, data: Permis[]) => {
    const filteredData = data.filter(permis => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (permis.code_permis?.toLowerCase().includes(searchTermLower) || false) ||
        (permis.detenteur?.nom_sociétéFR?.toLowerCase().includes(searchTermLower) || false) ||
        (permis.typePermis?.lib_type?.toLowerCase().includes(searchTermLower) || false);
      
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = permis.statut?.lib_statut === 'Actif';
      } else if (statusFilter === 'expired') {
        matchesStatus = !!permis.date_expiration && new Date(permis.date_expiration) < new Date();
      }
      
      return matchesSearch && matchesStatus;
    });

    const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const modalContent = (
      <div>
        <div className={styles.searchFilterContainer}>
          <div className={styles.searchInputContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="expired">Expirés</option>
          </select>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Code Permis</th>
                <th>Type</th>
                <th>Détenteur</th>
                <th>Date Octroi</th>
                <th>Date Expiration</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((permis) => (
                <tr key={permis.id}>
                  <td>{permis.code_permis}</td>
                  <td>{permis.typePermis?.lib_type || 'N/A'}</td>
                  <td>{permis.detenteur?.nom_sociétéFR || 'N/A'}</td>
                  <td>{permis.date_octroi ? new Date(permis.date_octroi).toLocaleDateString() : 'N/A'}</td>
                  <td>{permis.date_expiration ? new Date(permis.date_expiration).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      permis.statut?.lib_statut === 'Actif' ? styles.statusActive : 
                      permis.date_expiration && new Date(permis.date_expiration) < new Date() ? styles.statusExpired : ''
                    }`}>
                      {permis.statut?.lib_statut || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length > itemsPerPage && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FiChevronLeft />
            </button>
            
            {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              className={styles.paginationButton}
              disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
        
        <div className={styles.totalCount}>
          Total: {filteredData.length} {filteredData.length === 1 ? 'permis' : 'permis'}
        </div>
      </div>
    );
    
    setModalContent(modalContent);
  };

  // Render demandes modal content
  const renderDemandesModal = (title: string, data: Demande[]) => {
    const filteredData = data.filter(demande => {
      return demande.code_demande.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (demande.detenteur?.nom_sociétéFR.toLowerCase().includes(searchTerm.toLowerCase()));
    });
    
    const paginatedData = filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    const modalContent = (
      <div>
        <div className={styles.searchFilterContainer}>
          <div className={styles.searchInputContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Code Demande</th>
                <th>Type Permis</th>
                <th>Détenteur</th>
                <th>Date Demande</th>
                <th>Statut Terrain</th>
                <th>Statut Procédure</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((demande) => (
                <tr key={demande.id_demande}>
                  <td>{demande.code_demande}</td>
                  <td>{demande.detenteur?.nom_sociétéFR || 'N/A'}</td>
                  <td>{new Date(demande.date_demande).toLocaleDateString()}</td>
                  <td>{demande.statut_juridique_terrain || 'N/A'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                      {demande.procedure.statut_proc}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length > itemsPerPage && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FiChevronLeft />
            </button>
            
            {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.active : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              className={styles.paginationButton}
              disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
        
        <div className={styles.totalCount}>
          Total: {filteredData.length} {filteredData.length === 1 ? 'demande' : 'demandes'}
        </div>
      </div>
    );
    
    setModalContent(modalContent);
  };

  // Handle card click
  const handleCardClick = (type: 'total' | 'actifs' | 'enCours' | 'expires') => {
    setCurrentPage(1);
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentDataType(type);
    fetchDetailedData(type);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !modalOpen) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loading}>
          <FiRefreshCw className="animate-spin" size={24} />
          <span className="ml-2">Chargement des données...</span>
        </div>
      </div>
    );
  }

  if (error && !modalOpen) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.error}>
          <p>{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['app-container']}>
      <Navbar />
      <div className={styles['app-content']}>
      <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles['main-content']}>
          <div className={styles['container']}>
            <div className={styles['content-wrapper']}></div>
            <div className={styles.dashboardContainer}>
              {/* Dashboard Header */}
              <div className={styles.header}>
                <h1>SIGAM Dashboard</h1>
                <div className={styles.updateContainer}>
                  <div className={styles.timestamp}>
                    Dernière mise à jour: {new Date().toLocaleString()}
                  </div>
                  <button onClick={() => {
    fetchDashboardData();
    fetchPermisList();
  }} className={styles.refreshButton}>
                    <FiRefreshCw size={16} />
                    Actualiser
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className={styles.cardRow}>
                <div 
                  className={`${styles.card} ${styles.teal}`}
                  onClick={() => handleCardClick('total')}
                >
                  <FiFileText className={styles.icon} />
                  <div className={styles.cardContent}>
                    <h4>Total des permis</h4>
                    <p>{stats.total.toLocaleString()}</p>
                  </div>
                </div>

                <div 
                  className={`${styles.card} ${styles.yellow}`}
                  onClick={() => handleCardClick('actifs')}
                >
                  <FiActivity className={styles.icon} />
                  <div className={styles.cardContent}>
                    <h4>Permis actifs</h4>
                    <p>{stats.actifs.toLocaleString()}</p>
                    <div className="text-xs mt-1">
                      {Math.round((stats.actifs / stats.total) * 100)}% du total
                    </div>
                  </div>
                </div>

                <div 
                  className={`${styles.card} ${styles.blue}`}
                  onClick={() => handleCardClick('enCours')}
                >
                  <FiUsers className={styles.icon} />
                  <div className={styles.cardContent}>
                    <h4>Demandes en cours</h4>
                    <p>{stats.enCours.toLocaleString()}</p>
                  </div>
                </div>

                <div 
                  className={`${styles.card} ${styles.pink}`}
                  onClick={() => handleCardClick('expires')}
                >
                  <FiCalendar className={styles.icon} />
                  <div className={styles.cardContent}>
                    <h4>Permis expirés</h4>
                    <p>{stats.expires.toLocaleString()}</p>
                    <div className="text-xs mt-1">
                      {stats.actifs > 0 && `${Math.round((stats.expires / stats.actifs) * 100)}% des actifs`}
                    </div>
                  </div>
                </div>
                <div 
  className={`${styles.card} ${styles.orange}`} // Add .orange style to your CSS
  onClick={() => {
    setCurrentDataType('expiringSoon');
    setModalTitle('Permis expirant dans moins de 6 mois');
    setModalOpen(true);
renderPermisModal('Permis expirant bientôt', expiringSoonPermis);
  }}
>
  <FiCalendar className={styles.icon} />
  <div className={styles.cardContent}>
    <h4>Expirent bientôt</h4>
    <p>{expiringSoonPermis.length.toLocaleString()}</p>
    <div className="text-xs mt-1 text-orange-600">Dans les 6 mois</div>
  </div>
</div>

              </div>

              {/* Charts */}
              <div className={styles.gridRow}>
                <div className={styles.chartCard}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={styles.chartTitle}>Évolution des permis</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiTrendingUp className="mr-1" />
                      <span>
                        {evolutionData.length > 1 && 
                          `${((evolutionData[evolutionData.length - 1].value - evolutionData[evolutionData.length - 2].value) > 0 ? '+' : '')}${evolutionData[evolutionData.length - 1].value - evolutionData[evolutionData.length - 2].value} vs. dernière année`
                        }
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={evolutionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis 
                        tick={{ fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip 
                        formatter={(value) => [value.toLocaleString(), 'Nombre de permis']}
                        labelFormatter={(label) => `Année: ${label}`}
                        contentStyle={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: '#3B82F6' }}
                        activeDot={{ r: 8, stroke: '#1D4ED8', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.chartCard}>
                  <h4 className={styles.chartTitle}>Répartition des permis par type</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={2}
                        label={({ name, percent }) =>
                          percent && percent > 0.02
                            ? `${name.length > 25 ? name.slice(0, 25) + '…' : name}: ${(percent * 100).toFixed(0)}%`
                            : ''
                        }
                        labelLine={false}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value, entry, index) => (
                          <span style={{ color: '#334155' }}>{value}</span>
                        )}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          value.toLocaleString(),
                          name,
                          `${((props.payload.percent || 0) * 100).toFixed(1)}%`
                        ]}
                        contentStyle={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Add this right after the charts section */}
              
<div className={styles.permisTableContainer}>
    <div className={styles.filtersContainer}>
  <input
    type="text"
    placeholder="🔍 Rechercher par code, titulaire, type..."
    className={styles.searchInput}
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />

  <select
    className={styles.statusSelect}
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">Tous les statuts</option>
    <option value="active">Actifs</option>
    <option value="expired">Expirés</option>
  </select>
</div>
        <h3 className={styles.permisTableTitle}>Liste des Permis</h3>
        
        {isLoadingPermis ? (
          <div className={styles.loading}>
            <FiRefreshCw className="animate-spin" size={24} />
            <span className="ml-2">Chargement des permis...</span>
          </div>
        ) : (
          <>
            <div className={styles.tableResponsive}>
              <table className={styles.permisTable}>
                <thead>
                  <tr>
                    <th>Code Permis</th>
                    <th>Type</th>
                    <th>Titulaire</th>
                    <th>Statut</th>
                    <th>Date Octroi</th>
                    <th>Date Expiration</th>
                    <th>Surface (HA)</th>
                    <th>Substances</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermis.map((permis) => (
                    <tr key={permis.id}>
                      <td>{permis.code_permis}</td>
                      <td>{permis.typePermis?.lib_type || 'N/A'}</td>
                      <td>{permis.detenteur?.nom_sociétéFR || 'N/A'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          permis.statut?.lib_statut === 'Actif' ? styles.statusActive : 
                          permis.date_expiration && new Date(permis.date_expiration) < new Date() ? styles.statusExpired : ''
                        }`}>
                          {permis.statut?.lib_statut || 'N/A'}
                        </span>
                      </td>
                      <td>{permis.date_octroi ? new Date(permis.date_octroi).toLocaleDateString() : 'N/A'}</td>
                      <td>{permis.date_expiration ? new Date(permis.date_expiration).toLocaleDateString() : 'N/A'}</td>
                      <td>{permis.superficie?.toFixed(2) || 'N/A'}</td>
                      <td>
                        {getSubstancesForPermis(permis).join(', ') || 'N/A'}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.viewButton}
                            onClick={() => handleViewPermis(permis.id)}
                          >
                            Voir
                          </button>
                          <button 
                            className={styles.deleteButton}
                            onClick={() => handleDeletePermis(permis.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPermisCount > permisPerPage && (
              <div className={styles.pagination}>
                <button
                  disabled={currentPermisPage === 1}
                  onClick={() => handlePermisPageChange(currentPermisPage - 1)}
                >
                  <FiChevronLeft />
                </button>
                
                {Array.from({ length: Math.ceil(totalPermisCount / permisPerPage) }, (_, i) => (
                  <button
                    key={i + 1}
                    className={currentPermisPage === i + 1 ? styles.active : ''}
                    onClick={() => handlePermisPageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  disabled={currentPermisPage === Math.ceil(totalPermisCount / permisPerPage)}
                  onClick={() => handlePermisPageChange(currentPermisPage + 1)}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

              {/* Modal */}
              {modalOpen && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                      <h2 className={styles.modalTitle}>{modalTitle}</h2>
                      <button onClick={closeModal} className={styles.closeButton}>
                        <FiX size={24} />
                      </button>
                    </div>
                    <div className={styles.modalBody}>
                      {modalContent}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}