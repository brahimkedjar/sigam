// pages/demande/index.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const procedures = [
  { id: 1, nom: "Permis de prospection - Mines", code: "PPM" },
  { id: 2, nom: "Permis d'exploration - Mines", code: "PEM" },
  { id: 3, nom: "Permis d'exploitation - Carrières", code: "PXC" },
  { id: 4, nom: "Permis ARM - Mines artisanales", code: "ARM" },
  { id: 5, nom: "Permis ARC - Carrières artisanales", code: "ARC" },
  { id: 6, nom: "Permis de ramassage PRA", code: "PRA" },
  { id: 7, nom: "Transfert ou cession TRP", code: "TRP" },
  { id: 8, nom: "Renonciation RNP", code: "RNP" },
  // ... tu peux ajouter les 26
];

export default function DemandeStart() {
  const [idTypeProc, setIdTypeProc] = useState<number | null>(null);
  const [objet, setObjet] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!idTypeProc || !objet) {
      alert('Veuillez sélectionner un type et saisir un objet');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3005/demandes', {
        id_typeproc: idTypeProc,
        objet_demande: objet,
      });

      const demande = res.data;
      console.log('Demande créée :', demande);

      // Rediriger vers l’étape suivante
      router.push(`/demande/step2?id=${demande.id_demande}`);
    } catch (err) {
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h1 className="text-2xl font-semibold mb-6">Nouvelle Demande de Permis</h1>

      <label className="block mb-2">Type de Procédure</label>
      <select
        className="w-full p-2 border rounded mb-4"
        onChange={(e) => setIdTypeProc(Number(e.target.value))}
        value={idTypeProc || ''}
      >
        <option value="">-- Sélectionnez --</option>
        {procedures.map(proc => (
          <option key={proc.id} value={proc.id}>
            {proc.nom} ({proc.code})
          </option>
        ))}
      </select>

      <label className="block mb-2">Objet de la demande</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        value={objet}
        onChange={(e) => setObjet(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Création...' : 'Démarrer la procédure'}
      </button>
    </div>
  );
}
