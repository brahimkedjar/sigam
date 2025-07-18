import styles from './formcomponent.module.css'
// RepresentantLegal.tsx
type RepresentantLegalProps = {
  data: {
    nom: string;
    prenom: string;
    nom_ar: string;
    prenom_ar: string;
    tel: string;
    email: string;
    fax: string;
    qualite: string;
    nationalite: string;
    nin: string;
    taux_participation: string;
  };
  onChange: (data: RepresentantLegalProps['data']) => void;
  disabled?: boolean;
};

export default function RepresentantLegal({ data, onChange, disabled = false }: RepresentantLegalProps) {
  if (!data) return <p>Aucune donnée disponible pour le représentant légal.</p>; // Or simply return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
   <div className={styles.formGrid}>
  <input name="nom" className={styles.inputField} value={data.nom} onChange={handleChange} placeholder="Nom (FR)" required disabled={disabled}/>
  <input name="prenom" className={styles.inputField} value={data.prenom} onChange={handleChange} placeholder="Prénom (FR)" required disabled={disabled}/>
  <input name="nom_ar" className={`${styles.inputField} ${styles.arabicInput}`} value={data.nom_ar} onChange={handleChange} placeholder="اسم (AR)" required disabled={disabled}/>
  <input name="prenom_ar" className={`${styles.inputField} ${styles.arabicInput}`} value={data.prenom_ar} onChange={handleChange} placeholder="لقب (AR)" required disabled={disabled}/>
  <input name="tel" className={styles.inputField} value={data.tel} onChange={handleChange} placeholder="Téléphone" required disabled={disabled}/>
  <input type="email" name="email" className={styles.inputField} value={data.email} onChange={handleChange} placeholder="Email" required disabled={disabled}/>
  <input name="fax" className={styles.inputField} value={data.fax} onChange={handleChange} placeholder="Fax" disabled={disabled}/>
  <select name="qualite" className={`${styles.inputField} ${styles.selectField}`} value={data.qualite} onChange={handleChange} required disabled={disabled}>
    <option value="">Qualité du représentant</option>
    <option value="Gérant">Gérant</option>
    <option value="PDG">PDG</option>
    <option value="Président">Président</option>
  </select>
  <input name="nationalite" className={styles.inputField} value={data.nationalite} onChange={handleChange} placeholder="Nationalité" required disabled={disabled}/>
  <input name="nin" className={styles.inputField} value={data.nin} onChange={handleChange} placeholder="Numéro NIN" required disabled={disabled}/>
  <input name="taux_participation" type="number" className={styles.inputField} value={data.taux_participation} onChange={handleChange} placeholder="Taux de participation (%)" min="0" max="100"
disabled={disabled}/>
</div>

  );
}
