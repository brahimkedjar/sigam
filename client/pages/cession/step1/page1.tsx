"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FiUserCheck,
  FiAlertCircle,
  FiChevronRight,
} from "react-icons/fi";
import { CgFileDocument } from "react-icons/cg";
import styles from "@/pages/demande/step2/documents.module.css";
import Navbar from "../../navbar/Navbar";
import Sidebar from "../../sidebar/Sidebar";
import ProgressStepper from "../../../components/ProgressStepper";
import { STEP_LABELS } from "../../../src/constants/steps";
import { useViewNavigator } from "../../../src/hooks/useViewNavigator";

type Permis = {
  id: number;
  code_permis: string;
  typePermis: { id: number; lib_type: string };
  detenteur: { nom_sociétéFR: string } | null;
  statut?: string;
  id_wilaya?: number;
};

type Shareholder = {
  name: string;
  percentage: number;
};

export default function Step1_Permis() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const originalprocid = searchParams?.get("original_proc_id");
  const currentStep = 0;

  const [permisList, setPermisList] = useState<Permis[]>([]);
  const [selectedPermis, setSelectedPermis] = useState<Permis | null>(null);

  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [selectedTransferor, setSelectedTransferor] = useState<string>("");
  const [selectedShareholderData, setSelectedShareholderData] = useState<Shareholder | null>(null);
  const [sharesPercentage, setSharesPercentage] = useState("");
  const [error, setError] = useState("");

  const { currentView, navigateTo } = useViewNavigator("dashboard");

  const handleTransferorChange = (value: string) => {
    setSelectedTransferor(value);
    const shareholder = shareholders.find((s) => s.name === value) || null;
    setSelectedShareholderData(shareholder);
    setSharesPercentage("");
    setError("");
  };

  const handleSharesChange = (value: string) => {
    setSharesPercentage(value);
    if (selectedShareholderData) {
      const val = parseFloat(value);
      if (isNaN(val) || val <= 0 || val > selectedShareholderData.percentage) {
        setError("Valeur invalide ou supérieure aux parts détenues.");
      } else {
        setError("");
      }
    }
  };

  const handleNext = async () => {
    if (!selectedPermis) {
      alert("Veuillez sélectionner un permis avant de continuer.");
      return;
    }
    try {
      const res = await axios.post("/api/procedures/cession/check-payments", {
        permisId: selectedPermis.id,
      });
      if (res.data.ok) {
        router.push(`/demande/step2?page=2&permisId=${selectedPermis.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la vérification des paiements.");
    }
  };

  // Exemple : fetch permis et actionnaires (à adapter à ton API)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const permisRes = await axios.get("/api/procedures/cession/permis");
        setPermisList(permisRes.data);
        const shareholdersRes = await axios.get("/api/procedures/cession/shareholders");
        setShareholders(shareholdersRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles["app-container"]}>
      <Navbar />
      <div className={styles["app-content"]}>
        <Sidebar currentView={currentView} navigateTo={navigateTo} />
        <main className={styles["main-content"]}>
          <div className={styles["breadcrumb"]}>
            <span>SIGAM</span>
            <FiChevronRight className={styles["breadcrumb-arrow"]} />
            <span>Sélection du Permis</span>
          </div>

          <div className={styles["documents-container"]}>
            <div className={styles["content-wrapper"]}>
              {/* Progress Steps */}
              <ProgressStepper
                steps={
                  originalprocid
                    ? STEP_LABELS.filter((step) => step !== "Avis Wali")
                    : STEP_LABELS
                }
                currentStep={currentStep}
              />
                                <h6 className={styles['page-title']}>
                                  <CgFileDocument className={styles['title-icon']} />
                                  Identification du cédant
                                </h6>
              {/* Informations Permis */}
              <div className={styles["info-card"]}>
                <div className={styles["info-content"]}>
                  <div className={styles["info-row"]}>
                    <span className={styles["info-label"]}>Code Permis :</span>
                    <span className={styles["info-value"]}>{selectedPermis?.code_permis}</span>
                    <span className={styles["info-label"]}>Titre / Type :</span>
                    <span className={styles["info-value"]}>{selectedPermis?.typePermis?.lib_type}</span>
                  </div>

                  <div className={styles["info-row"]}>
                    <span className={styles["info-label"]}>Détenteur :</span>
                    <span className={styles["info-value"]}>{selectedPermis?.detenteur?.nom_sociétéFR}</span>
                    <span className={styles["info-label"]}>Statut :</span>
                    <span className={styles["info-value"]}>{selectedPermis?.statut}</span>
                  </div>
                </div>
              </div>

              {/* Identification du Cédant */}
              <div className={styles["info-card"]}>
                <div className={styles["info-header"]}>
                  <h4 className={styles["info-title"]}>
                    <FiUserCheck className={styles["info-icon"]} />
                    Identification du Cédant
                  </h4>
                </div>

                <div className={styles["info-content"]}>
                  <div className={styles["info-row"]}>
                    <label className="block text-sm font-medium mb-2">
                      Actionnaire cédant <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={selectedTransferor}
                      onChange={(e) => handleTransferorChange(e.target.value)}
                    >
                      <option value="">Sélectionner l'actionnaire qui souhaite céder ses parts</option>
                      {shareholders.map((shareholder, index) => (
                        <option key={index} value={shareholder.name}>
                          {shareholder.name} ({shareholder.percentage}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTransferor && selectedShareholderData && (
                    <div className={`${styles["info-card"]} bg-gray-50 border-gray-200`}>
                      <div className={styles["info-content"]}>
                        <h4 className="font-medium text-gray-900 mb-2">Informations du Cédant</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nom:</span>
                            <span className="font-medium">{selectedShareholderData?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Parts détenues:</span>
                            <span className="font-medium text-blue-600">{selectedShareholderData?.percentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTransferor && (
                    <div className={styles["info-row"]}>
                      <label className="block text-sm font-medium mb-2">
                        Pourcentage des parts à céder <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 10"
                        value={sharesPercentage}
                        onChange={(e) => handleSharesChange(e.target.value)}
                        max={selectedShareholderData?.percentage}
                        min={0.01}
                        step={0.01}
                        className={`w-full border rounded px-2 py-1 ${error ? "border-red-500" : ""}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: {selectedShareholderData?.percentage}% (parts actuellement détenues)
                      </p>
                      {error && (
                        <p className="text-xs text-red-500 mt-1 flex items-center">
                          <FiAlertCircle className="w-3 h-3 mr-1" />
                          {error}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedTransferor && sharesPercentage && !error && (
                    <div className={`${styles["info-card"]} bg-green-50 border-green-200`}>
                      <div className={styles["info-content"]}>
                        <h4 className="font-medium text-green-800 mb-2">Résumé de la Cession</h4>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-green-700">Cédant:</span>{" "}
                            <span className="font-medium">{selectedTransferor}</span>
                          </p>
                          <p>
                            <span className="text-green-700">Parts à céder:</span>{" "}
                            <span className="font-medium">{sharesPercentage}%</span>
                          </p>
                          <p>
                            <span className="text-green-700">Parts restantes:</span>{" "}
                            <span className="font-medium">
                              {selectedShareholderData
                                ? (selectedShareholderData.percentage - parseFloat(sharesPercentage)).toFixed(2)
                                : "0"}%
                            </span>
                          </p>
                          {selectedShareholderData &&
                            parseFloat(sharesPercentage) === selectedShareholderData.percentage && (
                              <div className="mt-3 p-2 bg-amber-100 border border-amber-300 rounded">
                                <p className="text-amber-800 font-medium text-xs flex items-center">
                                  <FiAlertCircle className="w-3 h-3 mr-1" />
                                  Cession Complète
                                </p>
                                <p className="text-amber-700 text-xs mt-1">
                                  Le statut de l'actionnaire passera d'<span className="font-medium">"Actif"</span> à{" "}
                                  <span className="font-medium">"Ancien"</span> après validation.
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
