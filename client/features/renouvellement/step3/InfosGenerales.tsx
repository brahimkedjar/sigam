import styles from './formcomponent.module.css'
// InfosGenerales.tsx
type InfosGeneralesProps = {
  data: {
    nom_fr: string;
    nom_ar: string;
    statut_id: string;
    tel: string;
    email: string;
    fax: string;
    adresse: string;
    nationalite: string;
  };
  onChange: (data: InfosGeneralesProps['data']) => void;
  disabled?: boolean;
};

export default function InfosGenerales({ data, onChange, disabled = false }: InfosGeneralesProps) {
  if (!data) return <p>Aucune donnée fournie.</p>; // or return null / fallback UI

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.formGrid}>
  <input name="nom_fr" className={styles.inputField} value={data.nom_fr} onChange={handleChange} placeholder="Nom société (FR)" required disabled={disabled}/>
  <input name="nom_ar" className={`${styles.inputField} ${styles.arabicInput}`} value={data.nom_ar} onChange={handleChange} placeholder="اسم الشركة (AR)" required disabled={disabled}/>
  <select name="statut_id" className={`${styles.inputField} ${styles.selectField}`} value={data.statut_id} onChange={handleChange} required disabled={disabled}>
    <option value="">Statut juridique</option>
    <option value="1">SPA</option>
    <option value="2">SARL</option>
    <option value="3">EURL</option>
  </select>
  <input name="tel" className={styles.inputField} value={data.tel} onChange={handleChange} placeholder="Téléphone" required disabled={disabled}/>
  <input type="email" name="email" className={styles.inputField} value={data.email} onChange={handleChange} placeholder="Email" required disabled={disabled}/>
  <input name="fax" className={styles.inputField} value={data.fax} onChange={handleChange} placeholder="Fax"disabled={disabled} />
  <input name="adresse" className={styles.inputField} value={data.adresse} onChange={handleChange} placeholder="Adresse complète" required disabled={disabled}/>
  <input name="nationalite" className={styles.inputField} value={data.nationalite} onChange={handleChange} placeholder="Nationalité" required disabled={disabled}/>
</div>
  );
}
