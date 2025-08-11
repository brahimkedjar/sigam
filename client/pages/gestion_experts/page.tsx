'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './experts.module.css';
import { useViewNavigator } from '@/src/hooks/useViewNavigator';
import Sidebar from '@/pages/sidebar/Sidebar';
import Navbar from '@/pages/navbar/Navbar';

type ExpertMinier = {
  id_expert: number;
  nom_expert: string;
  fonction: string;
  num_registre: string | null;
  organisme: string;
};

export default function ExpertsAdminPage() {
  const [experts, setExperts] = useState<ExpertMinier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentView, navigateTo } = useViewNavigator('gestion_experts');
  const [currentExpert, setCurrentExpert] = useState<ExpertMinier | null>(null);
  const [formData, setFormData] = useState<Omit<ExpertMinier, 'id_expert'>>({
    nom_expert: '',
    fonction: '',
    num_registre: '',
    organisme: ''
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/experts`);
      setExperts(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des experts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentExpert) {
        await axios.put(`${apiUrl}/api/experts/${currentExpert.id_expert}`, {
          ...formData,
          id_expert: currentExpert.id_expert
        });
        toast.success('Expert mis à jour avec succès');
      } else {
        await axios.post(`${apiUrl}/api/experts`, formData);
        toast.success('Expert créé avec succès');
      }
      fetchExperts();
      closeModal();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  const openCreateModal = () => {
    setCurrentExpert(null);
    setFormData({
      nom_expert: '',
      fonction: '',
      num_registre: '',
      organisme: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (expert: ExpertMinier) => (e: React.MouseEvent) => {
    e.preventDefault();
    openEditModal(expert);
  };

  const openEditModal = (expert: ExpertMinier) => {
    setCurrentExpert(expert);
    setFormData({
      nom_expert: expert.nom_expert,
      fonction: expert.fonction,
      num_registre: expert.num_registre || '',
      organisme: expert.organisme
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    deleteExpert(id);
  };

  const deleteExpert = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet expert ?')) {
      try {
        await axios.delete(`${apiUrl}/api/experts/${id}`);
        toast.success('Expert supprimé avec succès');
        fetchExperts();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error(error);
      }
    }
  };

  const filteredExperts = experts.filter(expert =>
    expert.nom_expert.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.fonction.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.organisme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.appContainer}>
      <Navbar />
      <div className={styles.appContent}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1 className={styles.title}>
                <FiUser className={styles.titleIcon} />
                Gestion des Experts Miniers
              </h1>
              <button onClick={openCreateModal} className={styles.addButton}>
                <FiPlus /> Ajouter un expert
              </button>
            </div>

            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Rechercher un expert..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {loading ? (
              <div className={styles.loading}>Chargement...</div>
            ) : (
              <div className={styles.expertTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.headerCell}>Nom complet</div>
                  <div className={styles.headerCell}>Fonction</div>
                  <div className={styles.headerCell}>Numéro de registre</div>
                  <div className={styles.headerCell}>Organisme</div>
                  <div className={styles.headerCell}>Actions</div>
                </div>

                {filteredExperts.length > 0 ? (
                  filteredExperts.map(expert => (
                    <div key={expert.id_expert} className={styles.tableRow}>
                      <div className={styles.tableCell}>{expert.nom_expert}</div>
                      <div className={styles.tableCell}>{expert.fonction}</div>
                      <div className={styles.tableCell}>{expert.num_registre || '-'}</div>
                      <div className={styles.tableCell}>{expert.organisme}</div>
                      <div className={styles.actionsCell}>
                        <button
                          onClick={handleEditClick(expert)}
                          className={styles.editButton}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={handleDeleteClick(expert.id_expert)}
                          className={styles.deleteButton}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noResults}>Aucun expert trouvé</div>
                )}
              </div>
            )}

            {isModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h2>{currentExpert ? `Modifier expert ${currentExpert.nom_expert}` : 'Ajouter un expert'}</h2>
                    <button onClick={closeModal} className={styles.closeButton}>
                      <FiX />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                      <label>Nom complet *</label>
                      <input
                        type="text"
                        name="nom_expert"
                        value={formData.nom_expert}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Fonction *</label>
                      <input
                        type="text"
                        name="fonction"
                        value={formData.fonction}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Numéro de registre</label>
                      <input
                        type="text"
                        name="num_registre"
                        value={formData.num_registre!}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Organisme *</label>
                      <input
                        type="text"
                        name="organisme"
                        value={formData.organisme}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className={styles.modalActions}>
                      <button type="button" onClick={closeModal} className={styles.cancelButton}>
                        Annuler
                      </button>
                      <button type="submit" className={styles.saveButton}>
                        {currentExpert ? 'Mettre à jour' : 'Créer'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}