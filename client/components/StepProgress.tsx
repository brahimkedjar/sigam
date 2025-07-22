// components/StepProgress.tsx
type StepProps = {
  current: number;
  total: number;
};

export default function StepProgress({ current, total }: StepProps) {
  const steps = [
    "Type de permis", "Identification", "Capacités", "Substances", "Documents",
    "Avis Wali", "Comité", "Paiement", "Génération"
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        {steps.map((step, index) => (
          <div key={index} className={`flex-1 text-center ${index === current ? "font-bold text-blue-600" : ""}`}>
            <div className={`w-6 h-6 mx-auto rounded-full border ${index <= current ? "bg-blue-600 text-white" : "bg-white"} flex items-center justify-center`}>
              {index + 1}
            </div>
            <div>{step}</div>
          </div>
        ))}
      </div>
      <div className="h-2 w-full bg-gray-200 rounded">
        <div className="h-2 bg-blue-600 rounded transition-all" style={{ width: `${(current / (total - 1)) * 100}%` }} />
      </div>
    </div>
  );
}
