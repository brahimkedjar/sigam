
import styles from './formcomponent.module.css';
// Actionnaires.tsx
type Actionnaire = {
  nom: string;
  prenom: string;
  lieu_naissance: string;
  nationalite: string;
  qualification: string;
  numero_carte: string;
  taux_participation: string;
};

type ActionnairesProps = {
  data: Actionnaire[];
  onChange: (data: Actionnaire[]) => void;
  disabled?: boolean;
};

export default function Actionnaires({ data, onChange, disabled = false }: ActionnairesProps) {
  if (!data) return <p>Aucun actionnaire à afficher.</p>; // or return null

  const handleChange = (index: number, field: keyof Actionnaire, value: string) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addActionnaire = () => {
    onChange([
      ...data,
      {
        nom: '',
        prenom: '',
        lieu_naissance: '',
        nationalite: '',
        qualification: '',
        numero_carte: '',
        taux_participation: '',
      },
    ]);
  };

  const removeActionnaire = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div>
      {data.map((actionnaire, idx) => (
        <div key={idx} className={styles.actionnaireSection}>
          {!disabled && (
            <button
              onClick={() => removeActionnaire(idx)}
              className={styles.removeButton}
              type="button"
            >
              ×
            </button>
          )}
          
          <div className={styles.formGrid}>
            <input 
              type="text" 
              className={styles.inputField} 
              placeholder="Nom" 
              value={actionnaire.nom} 
              onChange={(e) => handleChange(idx, 'nom', e.target.value)} 
              required 
              disabled={disabled}
            />
        <input type="text" className={styles.inputField} placeholder="Prénom" value={actionnaire.prenom} onChange={(e) => handleChange(idx, 'prenom', e.target.value)} required disabled={disabled}/>
        <input type="text" className={styles.inputField} placeholder="Lieu de naissance" value={actionnaire.lieu_naissance} onChange={(e) => handleChange(idx, 'lieu_naissance', e.target.value)} required disabled={disabled}/>
        <input type="text" className={styles.inputField} placeholder="Nationalité" value={actionnaire.nationalite} onChange={(e) => handleChange(idx, 'nationalite', e.target.value)} required disabled={disabled}/>
        <input type="text" className={styles.inputField} placeholder="Qualification" value={actionnaire.qualification} onChange={(e) => handleChange(idx, 'qualification', e.target.value)} required disabled={disabled}/>
        <input type="text" className={styles.inputField} placeholder="Numéro d'identité" value={actionnaire.numero_carte} onChange={(e) => handleChange(idx, 'numero_carte', e.target.value)} required disabled={disabled}/>
        <input type="number" className={`${styles.inputField} ${styles.numberInput}`} min="0" max="100" placeholder="Taux de participation (%)" value={actionnaire.taux_participation} onChange={(e) => handleChange(idx, 'taux_participation', e.target.value)} required disabled={disabled}/>
      </div>
    </div>
  ))}

  <button
    type="button"
    className={styles.addButton}
    onClick={addActionnaire}
  >
    + Ajouter un actionnaire
  </button>
</div>

  );
}
