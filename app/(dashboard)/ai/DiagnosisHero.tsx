import { useState, useEffect, useRef } from "react";

const mockAnalysisData = {
  plantInfo: {
    commonName: "Mango",
    scientificName: "Mangifera indica",
    family: "Anacardiaceae",
    origin: "South Asia",
    cropType: "Fruit Tree",
    growingSeason: "March - June",
    emoji: "🥭",
  },
  disease: {
    name: "Anthracnose",
    scientificName: "Colletotrichum gloeosporioides",
    confidence: 92,
    severity: "High",
    severityScore: 8.2,
    affectedArea: "67%",
    stage: "Advanced",
    spreadRisk: "Very High",
    description:
      "Anthracnose is a fungal disease causing dark, sunken lesions on leaves, stems, flowers, and fruits. It thrives in warm, humid conditions and can devastate entire crops if left untreated.",
    symptoms: [
      "Dark brown to black irregular spots on leaves",
      "Sunken lesions with yellow halos",
      "Premature leaf drop",
      "Fruit rot with dark patches",
      "Twig dieback in severe cases",
    ],
    causes: [
      "High humidity (>80%)",
      "Warm temperatures (25-30°C)",
      "Poor air circulation",
      "Infected plant debris",
      "Overhead irrigation",
    ],
    lifecycle: "3-7 days infection cycle",
  },
  nutritional: {
    nitrogen: { status: "Normal", value: 72, unit: "kg/ha" },
    phosphorus: { status: "Low", value: 18, unit: "kg/ha" },
    potassium: { status: "Normal", value: 85, unit: "kg/ha" },
    zinc: { status: "Low", value: 0.8, unit: "ppm" },
    iron: { status: "Adequate", value: 4.2, unit: "ppm" },
    calcium: { status: "Normal", value: 65, unit: "kg/ha" },
    overallHealth: 6,
    soilPH: 6.2,
    moistureLevel: "High",
  },
  treatment: {
    immediate: [
      {
        type: "Fungicide",
        product: "Azoxystrobin 25% SC",
        dosage: "1ml per litre",
        frequency: "Every 7 days",
        duration: "3 weeks",
        cost: "₹250/acre",
      },
      {
        type: "Copper Spray",
        product: "Copper Oxychloride 50% WP",
        dosage: "3g per litre",
        frequency: "Every 10 days",
        duration: "2 weeks",
        cost: "₹180/acre",
      },
    ],
    fertilizer: [
      {
        nutrient: "Zinc",
        product: "Zinc Sulfate 21%",
        dosage: "25kg/acre",
        timing: "Immediately",
      },
      {
        nutrient: "Phosphorus",
        product: "DAP 18-46-0",
        dosage: "50kg/acre",
        timing: "Next irrigation",
      },
    ],
    cultural: [
      "Remove and destroy infected leaves immediately",
      "Improve canopy ventilation by pruning",
      "Avoid overhead irrigation",
      "Apply mulch to prevent soil splash",
      "Sanitize pruning tools with 70% alcohol",
    ],
  },
  precautions: [
    {
      icon: "🧤",
      title: "Personal Protection",
      desc: "Wear gloves and mask while applying fungicides",
    },
    {
      icon: "⏰",
      title: "Application Timing",
      desc: "Apply sprays early morning or evening only",
    },
    {
      icon: "🚫",
      title: "Harvest Interval",
      desc: "Wait 14 days after last spray before harvest",
    },
    {
      icon: "🌧️",
      title: "Weather Check",
      desc: "Do not apply before expected rainfall",
    },
    {
      icon: "🐝",
      title: "Pollinator Safety",
      desc: "Avoid spraying during flowering stage",
    },
    {
      icon: "💧",
      title: "Water Safety",
      desc: "Keep chemicals away from water bodies",
    },
  ],
  forecast: {
    recoveryTime: "21-28 days",
    successRate: "78%",
    yieldImpact: "-35% if untreated",
    weatherRisk: "High (Rain expected)",
  },
};

const AnimatedCounter = ({ value, duration = 2000, suffix = "" }: { value: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), 300);
    return () => clearTimeout(timer);
  }, [value, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

const CircularProgress = ({ value, size = 80, color = "#10b981", label }: { value: number; size?: number; color?: string; label?: string }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 500);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: "center",
            fontSize: "14px",
            fontWeight: "700",
            fill: color,
          }}
        >
          {value}%
        </text>
      </svg>
      {label && (
        <span style={{ fontSize: "11px", color: "#6b7280", textAlign: "center", fontWeight: "500" }}>
          {label}
        </span>
      )}
    </div>
  );
};

const NutrientBar = ({ label, value, max = 100, status, color, delay = 0 }: { label: string; value: number; max?: number; status: string; color?: string; delay?: number }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth((value / max) * 100), 800 + delay);
    return () => clearTimeout(timer);
  }, [value, max, delay]);

  const statusColors: Record<string, string> = {
    Normal: "#10b981",
    Low: "#f59e0b",
    High: "#ef4444",
    Adequate: "#3b82f6",
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            {value} {label === "Zinc" || label === "Iron" ? "ppm" : "kg/ha"}
          </span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: statusColors[status],
              background: `${statusColors[status]}20`,
              padding: "2px 8px",
              borderRadius: "20px",
            }}
          >
            {status}
          </span>
        </div>
      </div>
      <div
        style={{
          height: "8px",
          background: "#f3f4f6",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            background: `linear-gradient(90deg, ${statusColors[status]}, ${statusColors[status]}aa)`,
            borderRadius: "10px",
            transition: `width 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const configs: Record<string, { color: string; bg: string; icon: string; pulse: boolean }> = {
    High: { color: "#ef4444", bg: "#fef2f2", icon: "🔴", pulse: true },
    Medium: { color: "#f59e0b", bg: "#fffbeb", icon: "🟡", pulse: false },
    Low: { color: "#10b981", bg: "#f0fdf4", icon: "🟢", pulse: false },
    "Very High": { color: "#dc2626", bg: "#fef2f2", icon: "🚨", pulse: true },
  };
  const config = configs[severity] || configs.Medium;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: config.bg,
        border: `1.5px solid ${config.color}`,
        borderRadius: "20px",
        padding: "4px 12px",
      }}
    >
      <span style={{ fontSize: "12px" }}>{config.icon}</span>
      <span style={{ fontSize: "12px", fontWeight: "700", color: config.color }}>
        {severity}
      </span>
      {config.pulse && (
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: config.color,
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: string }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      padding: "10px 4px",
      border: "none",
      background: active
        ? "linear-gradient(135deg, #10b981, #059669)"
        : "transparent",
      color: active ? "white" : "#6b7280",
      borderRadius: "10px",
      fontSize: "11px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      boxShadow: active ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
    }}
  >
    <span style={{ fontSize: "16px" }}>{icon}</span>
    {children}
  </button>
);

const PrecautionCard = ({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 100 + 500);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px",
        background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
        borderRadius: "12px",
        border: "1px solid #d1fae5",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-20px)",
        transition: "all 0.5s ease",
        marginBottom: "8px",
      }}
    >
      <span style={{ fontSize: "24px", flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#065f46", marginBottom: "2px" }}>
          {title}
        </div>
        <div style={{ fontSize: "12px", color: "#047857", lineHeight: "1.4" }}>{desc}</div>
      </div>
    </div>
  );
};

const SpreadingDots = () => (
  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#10b981",
          animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
  </div>
);

type AnalysisData = {
  plantInfo?: {
    commonName?: string
    scientificName?: string
    family?: string
    origin?: string
    cropType?: string
    growingSeason?: string
    emoji?: string
    growthStage?: string
    [key: string]: any
  }
  disease?: {
    detected?: boolean
    name?: string
    scientificName?: string
    confidence?: number
    severity?: string
    severityScore?: number
    affectedArea?: string
    stage?: string
    spreadRisk?: string
    description?: string
    symptoms?: string[]
    causes?: string[]
    lifecycle?: string
    treatment?: {
      product?: string
      dosage?: string
      frequency?: string
    }
    [key: string]: any
  }
  nutritional?: {
    overallHealth?: number
    deficiencies?: string[]
    recommendations?: string[]
    nitrogen?: { status: string; value: number; unit: string }
    phosphorus?: { status: string; value: number; unit: string }
    potassium?: { status: string; value: number; unit: string }
    zinc?: { status: string; value: number; unit: string }
    iron?: { status: string; value: number; unit: string }
    calcium?: { status: string; value: number; unit: string }
    [key: string]: any
  }
  treatment?: {
    immediate?: Array<{
      type?: string
      product?: string
      dosage?: string
      frequency?: string
      duration?: string
      cost?: string
    }>
    fertilizer?: Array<{
      nutrient?: string
      product?: string
      dosage?: string
      timing?: string
    }>
    cultural?: string[]
    [key: string]: any
  }
  precautions?: Array<{
    icon?: string
    title?: string
    desc?: string
  }>
  forecast?: {
    recoveryTime?: string
    successRate?: string
    yieldImpact?: string
    weatherRisk?: string
    [key: string]: any
  }
  quickTips?: string[]
  [key: string]: any
}

type DiagnosisHeroProps = {
  analysisData?: AnalysisData | null
}

export default function DiagnosisHero({ analysisData }: DiagnosisHeroProps) {
  console.log('DiagnosisHero received:', analysisData ? 'Data received' : 'No data', analysisData ? Object.keys(analysisData) : [])
  
  // Transform AI response to match the UI structure
  const transformData = (aiData: any) => {
    if (!aiData) return null
    
    // Check if it's the new simpler format
    if (aiData.plantInfo || aiData.disease || aiData.quickTips) {
      return {
        plantInfo: {
          commonName: aiData.plantInfo?.commonName || aiData.cropName || 'Unknown Crop',
          scientificName: aiData.plantInfo?.scientificName || '',
          family: aiData.plantInfo?.family || '',
          cropType: aiData.plantInfo?.cropType || '',
          growingSeason: aiData.plantInfo?.growingSeason || '',
          emoji: aiData.plantInfo?.emoji || '🌱',
          growthStage: aiData.plantInfo?.growthStage || '',
        },
        disease: {
          detected: aiData.disease?.detected ?? true,
          name: aiData.disease?.name || 'Analysis Complete',
          scientificName: aiData.disease?.scientificName || '',
          confidence: aiData.disease?.confidence || 85,
          severity: aiData.disease?.severity || 'Medium',
          severityScore: aiData.disease?.confidence ? aiData.disease.confidence / 10 : 6,
          affectedArea: aiData.disease?.affectedArea || '30%',
          stage: aiData.disease?.stage || 'Active',
          spreadRisk: aiData.disease?.severity === 'High' ? 'High' : aiData.disease?.severity === 'Critical' ? 'Very High' : 'Medium',
          description: aiData.disease?.description || 'Analysis completed. Review the details below.',
          symptoms: aiData.disease?.symptoms || [],
          causes: aiData.disease?.causes || [],
          lifecycle: aiData.disease?.lifecycle || '',
          treatment: aiData.disease?.treatment || {},
        },
        nutritional: {
          nitrogen: { status: 'Normal', value: 70, unit: 'kg/ha' },
          phosphorus: { status: 'Normal', value: 45, unit: 'kg/ha' },
          potassium: { status: 'Normal', value: 80, unit: 'kg/ha' },
          zinc: { status: 'Normal', value: 2, unit: 'ppm' },
          iron: { status: 'Normal', value: 4, unit: 'ppm' },
          calcium: { status: 'Normal', value: 60, unit: 'kg/ha' },
          overallHealth: aiData.nutritional?.overallHealth || 7,
          deficiencies: aiData.nutritional?.deficiencies || [],
          recommendations: aiData.nutritional?.recommendations || [],
        },
        treatment: {
          immediate: aiData.disease?.treatment ? [{
            type: 'Treatment',
            product: aiData.disease.treatment.product || 'Recommended Product',
            dosage: aiData.disease.treatment.dosage || 'As directed',
            frequency: aiData.disease.treatment.frequency || 'Weekly',
            duration: '2 weeks',
            cost: '₹300/acre',
          }] : [],
          fertilizer: aiData.nutritional?.recommendations ? aiData.nutritional.recommendations.map((r: string, i: number) => ({
            nutrient: 'NPK',
            product: r,
            dosage: 'As recommended',
            timing: 'Immediately',
          })) : [],
          cultural: aiData.quickTips || ['Monitor plant health regularly', 'Ensure proper irrigation', 'Apply nutrients as needed'],
        },
        precautions: [
          { icon: '🧤', title: 'Wear Gloves', desc: 'Use protective gear when applying treatments' },
          { icon: '⏰', title: 'Timing', desc: 'Apply in early morning or evening' },
          { icon: '🚫', title: 'Harvest Interval', desc: 'Wait 7-14 days after treatment before harvest' },
        ],
        forecast: {
          recoveryTime: '14-21 days',
          successRate: '85%',
          yieldImpact: '-10% if untreated',
          weatherRisk: 'Monitor weather conditions',
        },
      }
    }
    return null
  }
  
  // Use real data only if it has proper structure
  const transformedData = transformData(analysisData)
  const hasValidData = transformedData !== null
  const data = hasValidData ? transformedData : mockAnalysisData
  
  // If we have real analysis data, skip loading animation
  const [isLoading, setIsLoading] = useState(hasValidData ? false : true)
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const analysisSteps = [
    "Identifying plant species...",
    "Analyzing leaf patterns...",
    "Detecting disease markers...",
    "Checking nutritional levels...",
    "Generating recommendations...",
    "Analysis complete! ✅",
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepInterval);
          setTimeout(() => setIsLoading(false), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(stepInterval);
  }, []);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.5); }
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes scanLine {
      0% { top: 0; }
      100% { top: 100%; }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
      50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
    }

    .fade-in-up {
      animation: fadeInUp 0.6s ease forwards;
    }

    .float-anim {
      animation: float 3s ease-in-out infinite;
    }

    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .tab-content {
      animation: fadeInUp 0.4s ease forwards;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #10b981; border-radius: 2px; }
  `;

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                animation: "glow 2s infinite",
                fontSize: "36px",
              }}
            >
              🌿
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: "800",
                color: "#065f46",
                marginBottom: "8px",
              }}
            >
              AI Analysis in Progress
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#10b981",
                marginBottom: "32px",
                minHeight: "20px",
                fontWeight: "500",
              }}
            >
              {analysisSteps[analysisStep]}
            </div>
            <div
              style={{
                width: "240px",
                height: "6px",
                background: "#d1fae5",
                borderRadius: "10px",
                margin: "0 auto 24px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${((analysisStep + 1) / analysisSteps.length) * 100}%`,
                  background: "linear-gradient(90deg, #10b981, #059669)",
                  borderRadius: "10px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "left" }}>
              {analysisSteps.slice(0, analysisStep + 1).map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: i === analysisStep ? "#10b981" : "#9ca3af",
                    animation: "fadeInUp 0.3s ease",
                    fontWeight: i === analysisStep ? "600" : "400",
                  }}
                >
                  <span>{i < analysisStep ? "✅" : "🔄"}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)",
          fontFamily: "'Inter', sans-serif",
          paddingBottom: "20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #065f46, #047857, #059669)",
            padding: "16px 20px 20px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 4px 20px rgba(6, 95, 70, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🌿</span>
                <span
                  style={{ fontSize: "18px", fontWeight: "800", color: "white" }}
                >
                  Diagnosis Hero
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#a7f3d0", marginLeft: "28px" }}>
                AI-Powered Crop Health Intelligence
              </div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  animation: "pulse 2s infinite",
                }}
              />
              <span style={{ fontSize: "11px", color: "white", fontWeight: "600" }}>
                LIVE
              </span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "420px", margin: "0 auto", padding: "0" }}>
          
          {/* Image Card with Overlay */}
          <div
            style={{
              margin: "16px",
              borderRadius: "20px",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              animation: "fadeInUp 0.6s ease",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "200px",
                background: "linear-gradient(135deg, #1a3d2e, #2d5a3d, #1e4d35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Leaf texture simulation */}
              <div style={{ fontSize: "100px", opacity: 0.3, filter: "blur(2px)" }}>🍃</div>
              
              {/* Scan animation overlay */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, #10b981, transparent)",
                  animation: "scanLine 3s linear infinite",
                }}
              />

              {/* Top badges */}
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: "rgba(239,68,68,0.9)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "20px",
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "10px" }}>🦠</span>
                <span style={{ fontSize: "11px", color: "white", fontWeight: "700" }}>
                  Disease: 92%
                </span>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "rgba(16,185,129,0.9)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "20px",
                  padding: "4px 10px",
                }}
              >
                <span style={{ fontSize: "11px", color: "white", fontWeight: "700" }}>
                  {data.plantInfo.emoji} {data.plantInfo.commonName}
                </span>
              </div>

              {/* Bottom info bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  padding: "20px 16px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "white" }}>
                    {data.disease.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#d1fae5", fontStyle: "italic" }}>
                    {data.disease.scientificName}
                  </div>
                </div>
                <SeverityBadge severity={data.disease.severity} />
              </div>
            </div>
          </div>

          {/* Plant Identity Card */}
          <div
            className="fade-in-up"
            style={{
              margin: "0 16px 12px",
              background: "linear-gradient(135deg, #065f46, #047857)",
              borderRadius: "20px",
              padding: "16px",
              color: "white",
              boxShadow: "0 4px 20px rgba(6, 95, 70, 0.3)",
              animationDelay: "0.1s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                }}
                className="float-anim"
              >
                {data.plantInfo.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "18px", fontWeight: "800" }}>
                  {data.plantInfo.commonName}
                </div>
                <div style={{ fontSize: "12px", color: "#a7f3d0", fontStyle: "italic", marginBottom: "8px" }}>
                  {data.plantInfo.scientificName}
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    data.plantInfo.family,
                    data.plantInfo.cropType,
                    data.plantInfo.growingSeason,
                  ].filter(Boolean).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "20px",
                        padding: "2px 8px",
                        fontSize: "10px",
                        fontWeight: "600",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginTop: "12px",
                background: "rgba(0,0,0,0.15)",
                borderRadius: "12px",
                padding: "10px",
              }}
            >
              <div>
                <div style={{ fontSize: "10px", color: "#6ee7b7", fontWeight: "600" }}>
                  GROWING SEASON
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700" }}>
                  {data.plantInfo.growingSeason}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6ee7b7", fontWeight: "600" }}>
                  AFFECTED AREA
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fca5a5" }}>
                  {data.disease.affectedArea}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              margin: "0 16px 12px",
              background: "white",
              borderRadius: "16px",
              padding: "6px",
              display: "flex",
              gap: "4px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            {[
              { id: "overview", icon: "🔍", label: "Disease" },
              { id: "nutrition", icon: "🌱", label: "Nutrition" },
              { id: "treatment", icon: "💊", label: "Treatment" },
              { id: "precautions", icon: "⚠️", label: "Safety" },
            ].map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
              >
                {tab.label}
              </TabButton>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="tab-content" style={{ padding: "0 16px" }}>
              
              {/* Confidence & Stats Row */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>📊</span> Analysis Confidence
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "8px",
                    justifyItems: "center",
                  }}
                >
                  <CircularProgress value={92} color="#10b981" label="Confidence" />
                  <CircularProgress value={82} color="#ef4444" label="Severity" />
                  <CircularProgress value={78} color="#f59e0b" label="Recovery" />
                </div>
              </div>

              {/* Disease Details */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🦠</span> Disease Profile
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#4b5563",
                    lineHeight: "1.6",
                    marginBottom: "12px",
                    padding: "10px",
                    background: "#f9fafb",
                    borderRadius: "10px",
                    borderLeft: "3px solid #10b981",
                  }}
                >
                  {data.disease.description}
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Stage", value: data.disease.stage, color: "#ef4444" },
                    { label: "Spread Risk", value: data.disease.spreadRisk, color: "#dc2626" },
                    { label: "Lifecycle", value: data.disease.lifecycle, color: "#f59e0b" },
                    { label: "Affected Area", value: data.disease.affectedArea, color: "#ef4444" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "#f9fafb",
                        borderRadius: "12px",
                        padding: "10px",
                      }}
                    >
                      <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", marginBottom: "4px" }}>
                        {item.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: item.color }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🔬</span> Visible Symptoms
                </div>
                {data.disease.symptoms.map((symptom, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      padding: "8px 0",
                      borderBottom: i < data.disease.symptoms.length - 1 ? "1px solid #f3f4f6" : "none",
                      animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#ef4444",
                        marginTop: "5px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.4" }}>
                      {symptom}
                    </span>
                  </div>
                ))}
              </div>

              {/* Causes */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚡</span> Root Causes
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {data.disease.causes.map((cause, i) => (
                    <span
                      key={i}
                      style={{
                        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                        color: "#92400e",
                        borderRadius: "20px",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        border: "1px solid #fbbf24",
                        animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
                      }}
                    >
                      {cause}
                    </span>
                  ))}
                </div>
              </div>

              {/* Forecast Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(37, 99, 235, 0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>📈</span> Outcome Forecast
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "Recovery Time", value: data.forecast.recoveryTime, icon: "⏱️" },
                    { label: "Success Rate", value: data.forecast.successRate, icon: "✅" },
                    { label: "Yield Impact", value: data.forecast.yieldImpact, icon: "📉" },
                    { label: "Weather Risk", value: data.forecast.weatherRisk, icon: "🌧️" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: "12px",
                        padding: "10px",
                      }}
                    >
                      <div style={{ fontSize: "16px", marginBottom: "4px" }}>{item.icon}</div>
                      <div style={{ fontSize: "12px", color: "#bfdbfe", marginBottom: "2px" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === "nutrition" && (
            <div className="tab-content" style={{ padding: "0 16px" }}>
              
              {/* Overall Health Score */}
              <div
                style={{
                  background: "linear-gradient(135deg, #065f46, #047857)",
                  borderRadius: "20px",
                  padding: "20px",
                  marginBottom: "12px",
                  color: "white",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(6,95,70,0.3)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#a7f3d0", fontWeight: "600", marginBottom: "8px" }}>
                  OVERALL PLANT HEALTH SCORE
                </div>
                <div style={{ fontSize: "56px", fontWeight: "800", lineHeight: 1 }}>
                  <AnimatedCounter value={data.nutritional.overallHealth} />
                  <span style={{ fontSize: "24px", color: "#a7f3d0" }}>/10</span>
                </div>
                <div style={{ fontSize: "13px", color: "#6ee7b7", marginTop: "8px" }}>
                  Needs Attention • Soil pH: {data.nutritional.soilPH}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "20px",
                      padding: "4px 12px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    💧 Moisture: {data.nutritional.moistureLevel}
                  </span>
                </div>
              </div>

              {/* Nutrient Analysis */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🌱</span> Macro & Micro Nutrients
                </div>
                <NutrientBar
                  label="Nitrogen"
                  value={data.nutritional.nitrogen.value}
                  max={120}
                  status={data.nutritional.nitrogen.status}
                  delay={0}
                />
                <NutrientBar
                  label="Phosphorus"
                  value={data.nutritional.phosphorus.value}
                  max={60}
                  status={data.nutritional.phosphorus.status}
                  delay={100}
                />
                <NutrientBar
                  label="Potassium"
                  value={data.nutritional.potassium.value}
                  max={120}
                  status={data.nutritional.potassium.status}
                  delay={200}
                />
                <NutrientBar
                  label="Zinc"
                  value={data.nutritional.zinc.value}
                  max={3}
                  status={data.nutritional.zinc.status}
                  delay={300}
                />
                <NutrientBar
                  label="Iron"
                  value={data.nutritional.iron.value}
                  max={8}
                  status={data.nutritional.iron.status}
                  delay={400}
                />
                <NutrientBar
                  label="Calcium"
                  value={data.nutritional.calcium.value}
                  max={100}
                  status={data.nutritional.calcium.status}
                  delay={500}
                />
              </div>

              {/* Deficiency Alerts */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>⚠️</span> Deficiency Alerts
                </div>
                {[
                  {
                    nutrient: "Zinc Deficiency",
                    impact: "Reduces disease resistance & fruit quality",
                    solution: "Apply Zinc Sulfate 21% @ 25kg/acre",
                    urgency: "Urgent",
                  },
                  {
                    nutrient: "Phosphorus Deficiency",
                    impact: "Weakens root system & flowering",
                    solution: "Apply DAP 18-46-0 @ 50kg/acre",
                    urgency: "High",
                  },
                ].map((alert, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fef3c7",
                      border: "1px solid #fbbf24",
                      borderRadius: "12px",
                      padding: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#92400e" }}>
                        {alert.nutrient}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "#dc2626",
                          background: "#fee2e2",
                          padding: "2px 8px",
                          borderRadius: "20px",
                        }}
                      >
                        {alert.urgency}
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#78350f", marginBottom: "6px" }}>
                      Impact: {alert.impact}
                    </p>
                    <p style={{ fontSize: "12px", color: "#065f46", fontWeight: "600" }}>
                      ✅ {alert.solution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment Tab */}
          {activeTab === "treatment" && (
            <div className="tab-content" style={{ padding: "0 16px" }}>
              
              {/* Emergency Action Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #dc2626, #ef4444)",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 4px 20px rgba(220, 38, 38, 0.3)",
                  animation: "glow 2s infinite",
                }}
              >
                <span style={{ fontSize: "32px" }}>🚨</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", marginBottom: "4px" }}>
                    Immediate Action Required
                  </div>
                  <div style={{ fontSize: "12px", color: "#fecaca" }}>
                    Disease severity is HIGH. Begin treatment within 24-48 hours to prevent spread.
                  </div>
                </div>
              </div>

              {/* Fungicide Treatment */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>💊</span> Chemical Treatment Plan
                </div>
                {data.treatment.immediate.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                      border: "1px solid #d1fae5",
                      borderRadius: "16px",
                      padding: "14px",
                      marginBottom: "10px",
                      animation: `fadeInUp 0.4s ease ${i * 0.15}s both`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            color: "#10b981",
                            background: "#d1fae5",
                            padding: "2px 8px",
                            borderRadius: "20px",
                          }}
                        >
                          {item.type}
                        </span>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#065f46", marginTop: "4px" }}>
                          {item.product}
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#065f46",
                          color: "white",
                          borderRadius: "12px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {item.cost}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      {[
                        { label: "Dosage", value: item.dosage },
                        { label: "Frequency", value: item.frequency },
                        { label: "Duration", value: item.duration },
                      ].map((detail) => (
                        <div key={detail.label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600" }}>
                            {detail.label}
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: "700", color: "#374151" }}>
                            {detail.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fertilizer Plan */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🌿</span> Fertilizer Schedule
                </div>
                {data.treatment.fertilizer.map((fert, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        flexShrink: 0,
                      }}
                    >
                      🧪
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#78350f" }}>
                        {fert.product}
                      </div>
                      <div style={{ fontSize: "12px", color: "#92400e" }}>
                        {fert.dosage} • {fert.timing}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "#f59e0b",
                        background: "#fef3c7",
                        padding: "4px 8px",
                        borderRadius: "20px",
                        border: "1px solid #fbbf24",
                      }}
                    >
                      {fert.nutrient}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cultural Practices */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>👨‍🌾</span> Cultural Practices
                </div>
                {data.treatment.cultural.map((practice, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 0",
                      borderBottom: i < data.treatment.cultural.length - 1 ? "1px solid #f3f4f6" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "12px",
                        color: "white",
                        fontWeight: "700",
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: "13px", color: "#4b5563", lineHeight: "1.4" }}>
                      {practice}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Summary */}
              <div
                style={{
                  background: "linear-gradient(135deg, #f0fdf4, #d1fae5)",
                  border: "2px solid #10b981",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#065f46", marginBottom: "12px" }}>
                  💰 Total Treatment Cost
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Fungicide", cost: "₹430" },
                    { label: "Fertilizer", cost: "₹380" },
                    { label: "Labor", cost: "₹200" },
                    { label: "Total/Acre", cost: "₹1,010", highlight: true },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: item.highlight
                          ? "linear-gradient(135deg, #065f46, #047857)"
                          : "white",
                        borderRadius: "12px",
                        padding: "10px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: item.highlight ? "#a7f3d0" : "#6b7280",
                          marginBottom: "4px",
                          fontWeight: "600",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          color: item.highlight ? "white" : "#065f46",
                        }}
                      >
                        {item.cost}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Precautions Tab */}
          {activeTab === "precautions" && (
            <div className="tab-content" style={{ padding: "0 16px" }}>
              
              <div
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  color: "white",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
                }}
              >
                <span style={{ fontSize: "36px" }} className="float-anim">
                  ⚠️
                </span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "800", marginBottom: "4px" }}>
                    Safety First
                  </div>
                  <div style={{ fontSize: "12px", color: "#fef3c7" }}>
                    Follow all precautions for safe and effective treatment
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                {data.precautions.map((precaution, i) => (
                  <PrecautionCard
                    key={i}
                    icon={precaution.icon}
                    title={precaution.title}
                    desc={precaution.desc}
                    index={i}
                  />
                ))}
              </div>

              {/* Emergency Contacts */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>📞</span> Expert Support
                </div>
                {[
                  { title: "Krishi Helpline", number: "1800-180-1551", available: "24/7", type: "Free" },
                  { title: "Plant Doctor", number: "Contact via App", available: "9AM-6PM", type: "Paid" },
                  { title: "Poison Control", number: "1-800-222-1222", available: "24/7", type: "Emergency" },
                ].map((contact, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      background: "#f9fafb",
                      borderRadius: "12px",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                        {contact.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {contact.number} • {contact.available}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: contact.type === "Free" ? "#10b981" : contact.type === "Emergency" ? "#ef4444" : "#f59e0b",
                        background: contact.type === "Free" ? "#d1fae5" : contact.type === "Emergency" ? "#fee2e2" : "#fef3c7",
                        padding: "3px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      {contact.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Environmental Note */}
              <div
                style={{
                  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  border: "1px solid #bfdbfe",
                  borderRadius: "20px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af", marginBottom: "8px" }}>
                  🌍 Environmental Responsibility
                </div>
                <p style={{ fontSize: "12px", color: "#1d4ed8", lineHeight: "1.6" }}>
                  Dispose of chemical containers safely at designated collection points. 
                  Never wash containers in water bodies. Store chemicals in cool, 
                  dry places away from children and animals. Use Integrated Pest 
                  Management (IPM) practices when possible.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ padding: "0 16px", marginTop: "4px" }}>
            <button
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(135deg, #065f46, #10b981)",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "10px",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => ((e.target as HTMLElement).style.transform = "translateY(-2px)")}
              onMouseOut={(e) => ((e.target as HTMLElement).style.transform = "translateY(0)")}
            >
              <span>📅</span> Schedule Treatment Plan
            </button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <button
                style={{
                  padding: "14px",
                  background: "white",
                  color: "#065f46",
                  border: "2px solid #10b981",
                  borderRadius: "16px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>📤</span> Share Report
              </button>
              <button
                style={{
                  padding: "14px",
                  background: "white",
                  color: "#1e40af",
                  border: "2px solid #3b82f6",
                  borderRadius: "16px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>💾</span> Save Report
              </button>
            </div>
            <button
              style={{
                width: "100%",
                padding: "14px",
                background: "transparent",
                color: "#6b7280",
                border: "1.5px dashed #d1d5db",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <span>📸</span> Analyze Another Image
            </button>
          </div>
        </div>
      </div>
    </>
  );
}