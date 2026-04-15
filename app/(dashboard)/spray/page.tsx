"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const generateSpraySchedulePrompt = (crop) => `
You are an expert agricultural scientist and crop protection specialist with 30+ years of experience in Indian agriculture. Generate a COMPLETE day-by-day spray and fertilizer schedule for the following crop.

Crop Details:
- Crop Name: ${crop.name}
- Variety: ${crop.variety || "Standard"}
- Current Growth Stage: ${crop.growthStage || "Vegetative"}
- Current Stage Progress: ${crop.stageProgress || 40}%
- Area: ${crop.area || "1 acre"}
- Location: ${crop.location || "Maharashtra, India"}
- Sowing Date: ${crop.sowingDate || "Today"}
- Days to Harvest: ${crop.daysToHarvest || 120}
- Season: ${crop.season || "Kharif"}

Generate a COMPLETE schedule from Day 0 (sowing) to Day ${crop.daysToHarvest || 120} (harvest).

IMPORTANT RULES:
1. NOT every day needs an activity - most days will be rest/monitoring days
2. Activities should follow real agronomic practices for this specific crop
3. Include these activity types: Fertilizer, Fungicide, Insecticide, Herbicide, Growth Regulator, Micronutrient, Irrigation Note, Monitoring, Harvest
4. Space activities realistically (some every 7 days, some every 14-21 days)
5. Include pre-harvest interval (PHI) - no sprays 14-21 days before harvest
6. Be extremely specific with product names available in India

Return ONLY a valid JSON object with NO markdown formatting:

{
  "cropInfo": {
    "name": "${crop.name}",
    "variety": "specific variety name",
    "emoji": "crop emoji",
    "totalDays": ${crop.daysToHarvest || 120},
    "stages": [
      {"name": "Germination", "startDay": 0, "endDay": 10, "color": "#22c55e", "description": "seed germination phase"},
      {"name": "Seedling", "startDay": 11, "endDay": 25, "color": "#16a34a", "description": "early growth phase"},
      {"name": "Vegetative", "startDay": 26, "endDay": 60, "color": "#15803d", "description": "leaf and stem development"},
      {"name": "Flowering", "startDay": 61, "endDay": 80, "color": "#f59e0b", "description": "flower initiation"},
      {"name": "Fruiting", "startDay": 81, "endDay": 110, "color": "#ef4444", "description": "fruit development"},
      {"name": "Maturity", "startDay": 111, "endDay": 120, "color": "#8b5cf6", "description": "harvest ready"}
    ],
    "totalActivities": 0,
    "totalCost": "₹0",
    "expectedYield": "X tonnes/acre",
    "summary": "Brief expert overview of this schedule"
  },
  "schedule": [
    {
      "day": 0,
      "date": "Day 0 - Sowing",
      "stage": "Germination",
      "stageColor": "#22c55e",
      "hasActivity": true,
      "isRestDay": false,
      "activities": [
        {
          "id": "act_0_1",
          "type": "Fertilizer",
          "typeIcon": "🌱",
          "typeColor": "#10b981",
          "priority": "High",
          "productName": "DAP (Di-Ammonium Phosphate)",
          "brandName": "IFFCO DAP",
          "chemicalName": "18-46-00 NPK",
          "category": "Base Fertilizer",
          "dosage": "50 kg/acre",
          "dilution": "Apply dry / broadcast",
          "applicationMethod": "Broadcasting before sowing",
          "targetPest": "N/A - Soil nutrient enrichment",
          "purpose": "Provides phosphorus for strong root development",
          "timing": "Early morning",
          "weatherCondition": "Dry weather, incorporate into soil",
          "cost": "₹1,400/bag",
          "costPerAcre": "₹1,400",
          "preharvest": "N/A",
          "safetyClass": "III - Slightly Hazardous",
          "organicAlternative": "Bone meal @ 100 kg/acre",
          "notes": "Mix thoroughly into top 15cm soil before sowing",
          "warningFlags": []
        }
      ],
      "monitoringTasks": ["Check soil moisture before sowing", "Verify seed quality and germination rate", "Check field leveling and drainage"],
      "weatherAlert": null,
      "expertTip": "Ensure field has good drainage to prevent seed rot"
    },
    {
      "day": 5,
      "date": "Day 5",
      "stage": "Germination",
      "stageColor": "#22c55e",
      "hasActivity": false,
      "isRestDay": true,
      "activities": [],
      "monitoringTasks": ["Check germination percentage (should be 70-80%)", "Look for any gaps in germination"],
      "weatherAlert": null,
      "expertTip": "Maintain soil moisture but avoid waterlogging"
    }
  ],
  "summary": {
    "totalSprayDays": 0,
    "totalRestDays": 0,
    "totalFertilizerApplications": 0,
    "totalFungicideApplications": 0,
    "totalInsecticideApplications": 0,
    "totalHerbicideApplications": 0,
    "estimatedTotalCost": "₹0",
    "criticalDays": [0, 21, 45],
    "importantMilestones": [
      {"day": 0, "milestone": "Sowing", "icon": "🌱"},
      {"day": 30, "milestone": "First Fertilizer Dose", "icon": "💊"},
      {"day": 120, "milestone": "Harvest", "icon": "🌾"}
    ],
    "productList": [
      {"productName": "DAP", "brandName": "IFFCO DAP", "type": "Fertilizer", "totalQuantity": "50 kg", "estimatedCost": "₹1,400", "usageDays": [0]}
    ],
    "weeklyBudget": [
      {"week": 1, "cost": "₹1,400", "activities": 2},
      {"week": 2, "cost": "₹500", "activities": 1}
    ]
  }
}

CRITICAL: 
- Generate ALL days from 0 to ${crop.daysToHarvest || 120}
- Include ONLY days that have activities OR important monitoring tasks
- Skip completely idle days (no entry needed for days with zero activity and no monitoring)
- Use REAL Indian market product names and prices
- Follow actual agronomic calendar for ${crop.name}
- Every activity must have complete details
- Total activities should realistically be 25-45 for a full season crop
- Include at least one activity per growth stage
- Last 14-21 days should have NO chemical sprays (pre-harvest interval)
`;

const callGroqAPI = async (prompt) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: "You are an expert agricultural scientist. Return ONLY valid JSON with no markdown, no code blocks, no extra text. Your response must start with { and end with }",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API Error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}") + 1;
  return JSON.parse(content.slice(jsonStart, jsonEnd));
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

const mockCrops = [
  {
    id: "CL-ODL",
    name: "HD-2967 Wheat",
    variety: "HD-2967",
    emoji: "🌾",
    growthStage: "Vegetative",
    stageProgress: 40,
    area: "500m²",
    daysToHarvest: 120,
    location: "Nashik, Maharashtra",
    season: "Rabi",
    sowingDate: "2024-11-01",
    waterUsage: "80L",
    yield: "400kg",
    projectedIncome: "₹10,000",
    status: "growing",
    color: "#f59e0b",
  },
  {
    id: "PL-ODL",
    name: "Cherry Tomato",
    variety: "Hybrid Cherry",
    emoji: "🍅",
    growthStage: "Fruiting",
    stageProgress: 80,
    area: "200m²",
    daysToHarvest: 45,
    location: "Nashik, Maharashtra",
    season: "Kharif",
    sowingDate: "2024-09-01",
    waterUsage: "50L",
    yield: "150kg",
    projectedIncome: "₹12,000",
    status: "growing",
    color: "#ef4444",
  },
  {
    id: "PL-NEW",
    name: "Grapes",
    variety: "Crimson Seedless",
    emoji: "🍇",
    growthStage: "Vegetative",
    stageProgress: 40,
    area: "1 acre",
    daysToHarvest: 121,
    location: "Nashik, Maharashtra",
    season: "Annual",
    sowingDate: "2024-10-01",
    waterUsage: "0L",
    yield: "0kg",
    projectedIncome: "₹0",
    status: "growing",
    color: "#8b5cf6",
  },
];

const activityConfig = {
  Fertilizer: { color: "#10b981", bg: "#d1fae5", icon: "🌱", darkColor: "#065f46" },
  Fungicide: { color: "#8b5cf6", bg: "#ede9fe", icon: "🍄", darkColor: "#4c1d95" },
  Insecticide: { color: "#ef4444", bg: "#fee2e2", icon: "🐛", darkColor: "#7f1d1d" },
  Herbicide: { color: "#f59e0b", bg: "#fef3c7", icon: "🌿", darkColor: "#78350f" },
  "Growth Regulator": { color: "#3b82f6", bg: "#dbeafe", icon: "📈", darkColor: "#1e3a8a" },
  Micronutrient: { color: "#06b6d4", bg: "#cffafe", icon: "⚗️", darkColor: "#164e63" },
  Irrigation: { color: "#0ea5e9", bg: "#e0f2fe", icon: "💧", darkColor: "#0c4a6e" },
  Monitoring: { color: "#6b7280", bg: "#f3f4f6", icon: "🔍", darkColor: "#374151" },
  Harvest: { color: "#f97316", bg: "#ffedd5", icon: "🌾", darkColor: "#7c2d12" },
};

const ParticleBackground = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            borderRadius: "50%",
            background: `rgba(16, 185, 129, ${Math.random() * 0.3 + 0.1})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const AILoadingScreen = ({ cropName }) => {
  const steps = [
    { icon: "🌱", text: `Identifying ${cropName} growth patterns...` },
    { icon: "📊", text: "Analyzing soil nutrient requirements..." },
    { icon: "🦠", text: "Mapping disease pressure calendar..." },
    { icon: "🐛", text: "Calculating pest lifecycle timing..." },
    { icon: "💊", text: "Selecting optimal products & dosages..." },
    { icon: "📅", text: "Building day-by-day schedule..." },
    { icon: "✅", text: "Schedule ready!" },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "500px", padding: "40px", position: "relative" }}
    >
      <ParticleBackground />

      <div style={{ position: "relative", marginBottom: "32px" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ width: "100px", height: "100px", borderRadius: "50%", border: "3px solid transparent", borderTop: "3px solid #10b981", borderRight: "3px solid #059669" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: "10px", borderRadius: "50%", border: "3px solid transparent", borderTop: "3px solid #34d399", borderLeft: "3px solid #6ee7b7" }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
          🌿
        </div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: "20px", fontWeight: "800", color: "#065f46", marginBottom: "8px", textAlign: "center" }}
      >
        AI Generating Schedule
      </motion.h3>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "32px", textAlign: "center" }}>
        Creating complete season plan for {cropName}
      </p>

      <div style={{ width: "100%", maxWidth: "400px", height: "6px", background: "#d1fae5", borderRadius: "10px", marginBottom: "24px", overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", background: "linear-gradient(90deg, #10b981, #059669)", borderRadius: "10px" }}
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        <AnimatePresence>
          {steps.slice(0, currentStep + 1).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", marginBottom: "6px", background: i === currentStep ? "#d1fae5" : "transparent", borderRadius: "10px", transition: "background 0.3s ease" }}
            >
              <span style={{ fontSize: "18px" }}>{step.icon}</span>
              <span style={{ fontSize: "13px", color: i === currentStep ? "#065f46" : "#9ca3af", fontWeight: i === currentStep ? "600" : "400" }}>
                {step.text}
              </span>
              {i < currentStep && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginLeft: "auto", color: "#10b981", fontSize: "14px" }}>
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const CropSelectorCard = ({ crop, isSelected, onClick, hasSchedule }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{ padding: "16px", borderRadius: "16px", border: isSelected ? `2px solid ${crop.color}` : "2px solid #e5e7eb", background: isSelected ? `linear-gradient(135deg, ${crop.color}15, ${crop.color}08)` : "white", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.3s ease" }}
  >
    {isSelected && (
      <motion.div
        layoutId="selectedCrop"
        style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${crop.color}10, transparent)`, borderRadius: "14px" }}
      />
    )}

    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <motion.div
        animate={isSelected ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
        style={{ width: "48px", height: "48px", background: isSelected ? `${crop.color}20` : "#f9fafb", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}
      >
        {crop.emoji}
      </motion.div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: isSelected ? crop.color : "#1f2937", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {crop.name}
        </div>
        <div style={{ fontSize: "11px", color: "#6b7280" }}>{crop.variety}</div>
        <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", fontWeight: "600", color: "#10b981", background: "#d1fae5", padding: "2px 6px", borderRadius: "20px" }}>
            {crop.growthStage}
          </span>
          <span style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280", background: "#f3f4f6", padding: "2px 6px", borderRadius: "20px" }}>
            {crop.daysToHarvest}d left
          </span>
          {hasSchedule && (
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#8b5cf6", background: "#ede9fe", padding: "2px 6px", borderRadius: "20px" }}>
              ✓ Scheduled
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const StageTimeline = ({ stages, totalDays, currentDay }) => (
  <div style={{ padding: "0 0 8px" }}>
    <div style={{ display: "flex", gap: "2px", borderRadius: "10px", overflow: "hidden", height: "12px" }}>
      {stages.map((stage, i) => {
        const width = ((stage.endDay - stage.startDay) / totalDays) * 100;
        return (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            style={{ width: `${width}%`, background: stage.color, transformOrigin: "left", position: "relative" }}
            title={stage.name}
          />
        );
      })}
    </div>
    <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
      {stages.map((stage, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: stage.color }} />
          <span style={{ fontSize: "10px", color: "#6b7280" }}>{stage.name} ({stage.startDay}-{stage.endDay}d)</span>
        </div>
      ))}
    </div>
  </div>
);

const ActivityCard = ({ activity, index }) => {
  const [expanded, setExpanded] = useState(false);
  const config = activityConfig[activity.type] || activityConfig.Monitoring;

  return (
    <motion.div
      variants={itemVariants}
      layout
      style={{ background: "white", borderRadius: "14px", border: `1.5px solid ${config.color}30`, overflow: "hidden", marginBottom: "8px" }}
    >
      <motion.div
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.99 }}
        style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
      >
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          style={{ width: "38px", height: "38px", background: config.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}
        >
          {config.icon}
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937", marginBottom: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activity.productName}
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: config.color, background: config.bg, padding: "1px 6px", borderRadius: "20px" }}>
              {activity.type}
            </span>
            <span style={{ fontSize: "10px", color: "#6b7280" }}>{activity.dosage}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", background: "#d1fae5", padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
            {activity.costPerAcre}
          </span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} style={{ fontSize: "12px", color: "#9ca3af" }}>▼</motion.span>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${config.color}20`, paddingTop: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { label: "Brand", value: activity.brandName || "-" },
                  { label: "Chemical", value: activity.chemicalName || "-" },
                  { label: "Method", value: activity.applicationMethod || "-" },
                  { label: "Timing", value: activity.timing || "Early Morning" },
                  { label: "Weather", value: activity.weatherCondition || "-" },
                  { label: "Safety", value: activity.safetyClass || "-" },
                  { label: "Pre-Harvest", value: activity.preharvest || "-" },
                  { label: "Target", value: activity.targetPest || "-" },
                ].map((item) => (
                  <div key={item.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "8px" }}>
                    <div style={{ fontSize: "9px", color: "#9ca3af", fontWeight: "600", marginBottom: "2px" }}>{item.label.toUpperCase()}</div>
                    <div style={{ fontSize: "11px", fontWeight: "600", color: "#374151", lineHeight: "1.3" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {activity.purpose && (
                <div style={{ marginTop: "10px", padding: "10px", background: `${config.color}10`, borderRadius: "10px", borderLeft: `3px solid ${config.color}` }}>
                  <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: "600", marginBottom: "4px" }}>PURPOSE</div>
                  <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>{activity.purpose}</div>
                </div>
              )}

              {activity.notes && (
                <div style={{ marginTop: "8px", padding: "8px 10px", background: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "11px", color: "#92400e" }}>
                  💡 {activity.notes}
                </div>
              )}

              {activity.organicAlternative && (
                <div style={{ marginTop: "8px", padding: "8px 10px", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0", fontSize: "11px", color: "#065f46" }}>
                  🌿 Organic Alt: {activity.organicAlternative}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DayCard = ({ dayData, index, isToday }) => {
  const [expanded, setExpanded] = useState(false);
  const stageColor = dayData.stageColor || "#10b981";

  return (
    <motion.div
      variants={itemVariants}
      layout
      style={{ display: "flex", gap: "12px", marginBottom: "12px", position: "relative" }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.03, type: "spring", stiffness: 400 }}
          style={{
            width: dayData.hasActivity ? "36px" : "24px",
            height: dayData.hasActivity ? "36px" : "24px",
            borderRadius: "50%",
            background: dayData.isRestDay ? "#f3f4f6" : `linear-gradient(135deg, ${stageColor}, ${stageColor}cc)`,
            border: isToday ? "3px solid #f59e0b" : `2px solid ${dayData.isRestDay ? "#e5e7eb" : stageColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: dayData.isRestDay ? "#9ca3af" : "white",
            fontSize: dayData.hasActivity ? "11px" : "9px",
            fontWeight: "800",
            zIndex: 2,
            boxShadow: dayData.hasActivity ? `0 0 12px ${stageColor}40` : "none",
            flexShrink: 0,
          }}
        >
          {isToday ? "📍" : dayData.day}
        </motion.div>
        <div style={{ width: "2px", flex: 1, minHeight: "20px", background: dayData.isRestDay ? "#f3f4f6" : `${stageColor}30` }} />
      </div>

      <div style={{ flex: 1, paddingBottom: "8px" }}>
        <motion.div
          onClick={() => !dayData.isRestDay && setExpanded(!expanded)}
          whileHover={!dayData.isRestDay ? { scale: 1.01 } : {}}
          whileTap={!dayData.isRestDay ? { scale: 0.99 } : {}}
          style={{
            background: dayData.isRestDay ? "#f9fafb" : "white",
            borderRadius: "14px",
            padding: "12px 14px",
            border: dayData.isRestDay ? "1px dashed #e5e7eb" : `1.5px solid ${stageColor}30`,
            cursor: dayData.isRestDay ? "default" : "pointer",
            boxShadow: dayData.hasActivity ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: dayData.isRestDay ? "#9ca3af" : "#1f2937" }}>Day {dayData.day}</span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: stageColor, background: `${stageColor}15`, padding: "1px 6px", borderRadius: "20px" }}>{dayData.stage}</span>
                {isToday && (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: "10px", fontWeight: "700", color: "#f59e0b", background: "#fef3c7", padding: "1px 6px", borderRadius: "20px" }}
                  >
                    TODAY
                  </motion.span>
                )}
              </div>

              {dayData.isRestDay ? (
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>🌙 Rest day — Monitor crop health</div>
              ) : (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {dayData.activities?.map((act, i) => {
                    const cfg = activityConfig[act.type] || activityConfig.Monitoring;
                    return (
                      <span key={i} style={{ fontSize: "10px", fontWeight: "600", color: cfg.color, background: cfg.bg, padding: "2px 7px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "3px" }}>
                        {cfg.icon} {act.type}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {!dayData.isRestDay && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                  {dayData.activities?.length || 0} task{(dayData.activities?.length || 0) !== 1 ? "s" : ""}
                </span>
                <motion.span animate={{ rotate: expanded ? 180 : 0 }} style={{ fontSize: "12px", color: "#9ca3af" }}>▼</motion.span>
              </div>
            )}
          </div>

          {!expanded && dayData.monitoringTasks?.length > 0 && !dayData.isRestDay && (
            <div style={{ marginTop: "8px", fontSize: "11px", color: "#6b7280" }}>
              🔍 {dayData.monitoringTasks[0]}
              {dayData.monitoringTasks.length > 1 && ` +${dayData.monitoringTasks.length - 1} more`}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {expanded && !dayData.isRestDay && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "10px 0 0" }}>
                {dayData.activities?.map((activity, i) => (
                  <ActivityCard key={i} activity={activity} index={i} />
                ))}

                {dayData.monitoringTasks?.length > 0 && (
                  <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "10px 12px", border: "1px solid #d1fae5", marginBottom: "8px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#065f46", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>🔍 Monitoring Tasks</div>
                    {dayData.monitoringTasks.map((task, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ color: "#10b981", fontSize: "10px", marginTop: "2px" }}>•</span>
                        <span style={{ fontSize: "11px", color: "#374151", lineHeight: "1.4" }}>{task}</span>
                      </div>
                    ))}
                  </div>
                )}

                {dayData.expertTip && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ background: "linear-gradient(135deg, #fffbeb, #fef3c7)", borderRadius: "10px", padding: "10px 12px", border: "1px solid #fde68a", display: "flex", gap: "8px" }}
                  >
                    <span style={{ fontSize: "16px" }}>💡</span>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "#92400e", marginBottom: "2px" }}>EXPERT TIP</div>
                      <div style={{ fontSize: "11px", color: "#78350f", lineHeight: "1.5" }}>{dayData.expertTip}</div>
                    </div>
                  </motion.div>
                )}

                {dayData.weatherAlert && (
                  <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "8px 12px", border: "1px solid #fecaca", marginTop: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <span>⚠️</span>
                    <span style={{ fontSize: "11px", color: "#dc2626" }}>{dayData.weatherAlert}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const SummaryCard = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 300 }}
    whileHover={{ scale: 1.03, y: -2 }}
    style={{ background: "white", borderRadius: "16px", padding: "16px", border: `1.5px solid ${color}20`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center" }}
  >
    <motion.div
      animate={{ rotate: [0, -5, 5, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: delay + 1 }}
      style={{ fontSize: "24px", marginBottom: "8px" }}
    >
      {icon}
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.3 }}
      style={{ fontSize: "20px", fontWeight: "800", color, marginBottom: "4px" }}
    >
      {value}
    </motion.div>
    <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: "600" }}>{label}</div>
  </motion.div>
);

const ProductListView = ({ products }) => (
  <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ padding: "0" }}>
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" }}>📦 Complete Product List</div>
      <div style={{ fontSize: "12px", color: "#6b7280" }}>All products needed for the season</div>
    </div>
    {products?.map((product, i) => {
      const config = activityConfig[product.type] || activityConfig.Monitoring;
      return (
        <motion.div
          key={i}
          variants={itemVariants}
          whileHover={{ scale: 1.01, x: 4 }}
          style={{ background: "white", borderRadius: "14px", padding: "14px", marginBottom: "10px", border: `1.5px solid ${config.color}20`, display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div style={{ width: "44px", height: "44px", background: config.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{config.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937", marginBottom: "2px" }}>{product.brandName || product.productName}</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{product.productName}</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "10px", fontWeight: "600", color: config.color, background: config.bg, padding: "1px 6px", borderRadius: "20px" }}>{product.type}</span>
              <span style={{ fontSize: "10px", color: "#6b7280", background: "#f3f4f6", padding: "1px 6px", borderRadius: "20px" }}>{product.totalQuantity}</span>
              {product.usageDays?.length > 0 && <span style={{ fontSize: "10px", color: "#6b7280", background: "#f3f4f6", padding: "1px 6px", borderRadius: "20px" }}>Day {product.usageDays.join(", ")}</span>}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#065f46" }}>{product.estimatedCost}</div>
            <div style={{ fontSize: "10px", color: "#6b7280" }}>total cost</div>
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);

const MilestoneView = ({ milestones, totalDays }) => (
  <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ padding: "0" }}>
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" }}>🎯 Key Milestones</div>
      <div style={{ fontSize: "12px", color: "#6b7280" }}>Critical points in your crop cycle</div>
    </div>
    {milestones?.map((milestone, i) => (
      <motion.div
        key={i}
        variants={slideInLeft}
        style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "flex-start" }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
          >
            {milestone.icon}
          </motion.div>
          {i < milestones.length - 1 && <div style={{ width: "2px", height: "30px", background: "linear-gradient(to bottom, #10b981, #d1fae5)", marginTop: "4px" }} />}
        </div>
        <div style={{ flex: 1, paddingTop: "8px" }}>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937", marginBottom: "2px" }}>{milestone.milestone}</div>
          <div style={{ fontSize: "11px", color: "#6b7280" }}>Day {milestone.day} • {Math.round((milestone.day / totalDays) * 100)}% complete</div>
          <motion.div style={{ marginTop: "6px", height: "4px", background: "#f3f4f6", borderRadius: "4px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(milestone.day / totalDays) * 100}%` }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #10b981, #059669)", borderRadius: "4px" }}
            />
          </motion.div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const EmptyState = ({ onGenerateForCrop, crops }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{ textAlign: "center", padding: "40px 24px", position: "relative" }}
  >
    <ParticleBackground />
    <motion.div
      animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ fontSize: "72px", marginBottom: "20px" }}
    >
      🌾
    </motion.div>
    <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#1f2937", marginBottom: "8px" }}>AI Spray Scheduler</h3>
    <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "32px", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto 32px" }}>
      Select a crop below to automatically generate a complete day-by-day spray and fertilizer schedule
    </p>

    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {crops.map((crop, i) => (
        <motion.button
          key={crop.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onGenerateForCrop(crop)}
          style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "white", border: `2px solid ${crop.color}30`, borderRadius: "14px", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <span style={{ fontSize: "28px" }}>{crop.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>{crop.name}</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>{crop.variety} • {crop.daysToHarvest} days to harvest</div>
          </div>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white", borderRadius: "10px", padding: "6px 12px", fontSize: "11px", fontWeight: "700" }}
          >
            Generate →
          </motion.div>
        </motion.button>
      ))}
    </div>
  </motion.div>
);

export default function SprayScheduleTab() {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("timeline");
  const [filterType, setFilterType] = useState("All");
  const [cachedSchedules, setCachedSchedules] = useState({});
  const [searchDay, setSearchDay] = useState("");
  const scheduleRef = useRef(null);

  const filterTypes = ["All", "Fertilizer", "Fungicide", "Insecticide", "Herbicide", "Micronutrient"];

  const generateSchedule = async (crop) => {
    if (cachedSchedules[crop.id]) {
      setSelectedCrop(crop);
      setScheduleData(cachedSchedules[crop.id]);
      return;
    }

    setSelectedCrop(crop);
    setIsLoading(true);
    setError(null);
    setScheduleData(null);

    try {
      const prompt = generateSpraySchedulePrompt(crop);
      const data = await callGroqAPI(prompt);
      setScheduleData(data);
      setCachedSchedules((prev) => ({ ...prev, [crop.id]: data }));
    } catch (err) {
      console.error("Schedule generation error:", err);
      setError(err.message);
      setScheduleData(generateMockSchedule(crop));
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSchedule = (crop) => ({
    cropInfo: {
      name: crop.name,
      variety: crop.variety,
      emoji: crop.emoji,
      totalDays: crop.daysToHarvest,
      stages: [
        { name: "Germination", startDay: 0, endDay: 10, color: "#22c55e" },
        { name: "Vegetative", startDay: 11, endDay: 50, color: "#16a34a" },
        { name: "Flowering", startDay: 51, endDay: 70, color: "#f59e0b" },
        { name: "Fruiting", startDay: 71, endDay: 100, color: "#ef4444" },
        { name: "Maturity", startDay: 101, endDay: crop.daysToHarvest, color: "#8b5cf6" },
      ],
      totalActivities: 8,
      totalCost: "₹8,500",
      expectedYield: "25-30 q/acre",
      summary: `Complete spray schedule for ${crop.name} from sowing to harvest.`,
    },
    schedule: [
      {
        day: 0,
        stage: "Germination",
        stageColor: "#22c55e",
        hasActivity: true,
        isRestDay: false,
        activities: [{
          id: "act_0_1",
          type: "Fertilizer",
          typeIcon: "🌱",
          typeColor: "#10b981",
          priority: "High",
          productName: "DAP 18-46-0",
          brandName: "IFFCO DAP",
          chemicalName: "Di-Ammonium Phosphate",
          dosage: "50 kg/acre",
          applicationMethod: "Broadcasting",
          targetPest: "Soil nutrition",
          purpose: "Basal dose for strong root establishment",
          timing: "Before sowing",
          weatherCondition: "Dry",
          cost: "₹1,200/bag",
          costPerAcre: "₹1,200",
          preharvest: "N/A",
          safetyClass: "III",
          organicAlternative: "Bone meal 100 kg/acre",
          notes: "Incorporate well into soil",
          warningFlags: [],
        }],
        monitoringTasks: ["Check soil moisture", "Verify seed quality"],
        expertTip: "Treat seeds with fungicide before sowing",
      },
      {
        day: 15,
        stage: "Vegetative",
        stageColor: "#16a34a",
        hasActivity: true,
        isRestDay: false,
        activities: [{
          type: "Fertilizer",
          productName: "Urea 46% N",
          brandName: "IFFCO Urea",
          chemicalName: "Urea 46-0-0",
          dosage: "30 kg/acre",
          applicationMethod: "Top dressing",
          targetPest: "Nitrogen supply",
          purpose: "Boost vegetative growth",
          timing: "Morning",
          weatherCondition: "Before light irrigation",
          cost: "₹600",
          costPerAcre: "₹600",
          preharvest: "N/A",
          safetyClass: "IV",
          organicAlternative: "Vermicompost 500 kg/acre",
          notes: "Apply after first weeding",
        }],
        monitoringTasks: ["Check plant height", "Monitor for early pests"],
        expertTip: "Maintain field hygiene to prevent early infections",
      },
    ],
    summary: {
      totalSprayDays: 8,
      totalRestDays: crop.daysToHarvest - 8,
      totalFertilizerApplications: 4,
      totalFungicideApplications: 3,
      totalInsecticideApplications: 2,
      estimatedTotalCost: "₹8,500",
      criticalDays: [0, 15, 30],
      importantMilestones: [
        { day: 0, milestone: "Sowing", icon: "🌱" },
        { day: 15, milestone: "First Spray", icon: "💊" },
        { day: crop.daysToHarvest, milestone: "Harvest", icon: "🌾" },
      ],
      productList: [
        { productName: "DAP", brandName: "IFFCO DAP", type: "Fertilizer", totalQuantity: "50 kg", estimatedCost: "₹1,200", usageDays: [0] },
      ],
    },
  });

  const getFilteredSchedule = () => {
    if (!scheduleData?.schedule) return [];
    let filtered = scheduleData.schedule.filter((day) => !day.isRestDay);
    if (filterType !== "All") {
      filtered = filtered.filter((day) => day.activities?.some((act) => act.type === filterType));
    }
    if (searchDay) {
      filtered = filtered.filter((day) => day.day.toString().includes(searchDay));
    }
    return filtered;
  };

  const allScheduleDays = scheduleData?.schedule || [];
  const filteredDays = getFilteredSchedule();
  const activityDays = allScheduleDays.filter((d) => !d.isRestDay);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg, #065f46, #047857, #059669)", padding: "20px 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(6, 95, 70, 0.35)" }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: "24px" }}>🌿</motion.span>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "white" }}>Spray Schedule</span>
            </div>
            <div style={{ fontSize: "12px", color: "#a7f3d0", marginLeft: "34px" }}>AI-Powered Season Planning</div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: "11px", color: "white", fontWeight: "600" }}>AI Active</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px 16px" }}>
        {!selectedCrop && <EmptyState onGenerateForCrop={generateSchedule} crops={mockCrops} />}

        {selectedCrop && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px", marginBottom: "20px" }}
            >
              {mockCrops.map((crop) => (
                <CropSelectorCard
                  key={crop.id}
                  crop={crop}
                  isSelected={selectedCrop?.id === crop.id}
                  onClick={() => generateSchedule(crop)}
                  hasSchedule={!!cachedSchedules[crop.id]}
                />
              ))}
            </motion.div>

            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{ background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                >
                  <AILoadingScreen cropName={selectedCrop?.name} />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "16px", padding: "16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}
              >
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626" }}>Using fallback data</div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>{error}</div>
                </div>
              </motion.div>
            )}

            {scheduleData && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: `linear-gradient(135deg, ${selectedCrop.color}ee, ${selectedCrop.color}aa)`, borderRadius: "24px", padding: "20px", marginBottom: "16px", color: "white", position: "relative", overflow: "hidden" }}
                >
                  <ParticleBackground />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      style={{ width: "64px", height: "64px", background: "rgba(255,255,255,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", flexShrink: 0 }}
                    >
                      {scheduleData.cropInfo?.emoji || selectedCrop.emoji}
                    </motion.div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}>{scheduleData.cropInfo?.name}</div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "12px" }}>
                        {scheduleData.cropInfo?.variety} • {scheduleData.cropInfo?.totalDays} Day Schedule
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        {[
                          { label: "Total Tasks", value: scheduleData.summary?.totalSprayDays || activityDays.length },
                          { label: "Total Cost", value: scheduleData.summary?.estimatedTotalCost || "₹8,500" },
                          { label: "Expected Yield", value: scheduleData.cropInfo?.expectedYield || "25-30 q/ac" },
                        ].map((stat) => (
                          <div key={stat.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: "800" }}>{stat.value}</div>
                            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {scheduleData.cropInfo?.summary && (
                    <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(0,0,0,0.15)", borderRadius: "10px", fontSize: "12px", color: "rgba(255,255,255,0.9)", lineHeight: "1.5" }}>
                      💡 {scheduleData.cropInfo.summary}
                    </div>
                  )}
                </motion.div>

                {scheduleData.cropInfo?.stages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ background: "white", borderRadius: "20px", padding: "16px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>📊 Growth Stage Timeline</div>
                    <StageTimeline stages={scheduleData.cropInfo.stages} totalDays={scheduleData.cropInfo.totalDays} />
                  </motion.div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
                  <SummaryCard icon="💊" label="Fungicide" value={scheduleData.summary?.totalFungicideApplications || 0} color="#8b5cf6" delay={0} />
                  <SummaryCard icon="🌱" label="Fertilizer" value={scheduleData.summary?.totalFertilizerApplications || 0} color="#10b981" delay={0.1} />
                  <SummaryCard icon="🐛" label="Insecticide" value={scheduleData.summary?.totalInsecticideApplications || 0} color="#ef4444" delay={0.2} />
                  <SummaryCard icon="💰" label="Total Cost" value={scheduleData.summary?.estimatedTotalCost || "₹0"} color="#f59e0b" delay={0.3} />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", gap: "4px", background: "white", borderRadius: "14px", padding: "5px", marginBottom: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  {[
                    { id: "timeline", icon: "📅", label: "Timeline" },
                    { id: "products", icon: "📦", label: "Products" },
                    { id: "milestones", icon: "🎯", label: "Milestones" },
                  ].map((view) => (
                    <motion.button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      whileTap={{ scale: 0.96 }}
                      style={{ flex: 1, padding: "10px 8px", border: "none", background: activeView === view.id ? "linear-gradient(135deg, #10b981, #059669)" : "transparent", color: activeView === view.id ? "white" : "#6b7280", borderRadius: "10px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.3s ease", boxShadow: activeView === view.id ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none" }}
                    >
                      <span>{view.icon}</span>{view.label}
                    </motion.button>
                  ))}
                </motion.div>

                <AnimatePresence mode="wait">
                  {activeView === "timeline" && (
                    <motion.div key="timeline" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "12px" }}>
                        {filterTypes.map((type) => {
                          const cfg = activityConfig[type] || { color: "#6b7280", bg: "#f3f4f6", icon: "📋" };
                          return (
                            <motion.button
                              key={type}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setFilterType(type)}
                              style={{ padding: "6px 12px", borderRadius: "20px", border: `1.5px solid ${filterType === type ? cfg.color : "#e5e7eb"}`, background: filterType === type ? cfg.bg : "white", color: filterType === type ? cfg.color : "#6b7280", fontSize: "11px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s ease" }}
                            >
                              {type !== "All" && cfg.icon} {type}
                            </motion.button>
                          );
                        })}
                      </div>

                      <div style={{ position: "relative", marginBottom: "16px" }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#9ca3af" }}>🔍</span>
                        <input
                          type="number"
                          placeholder="Jump to day number..."
                          value={searchDay}
                          onChange={(e) => setSearchDay(e.target.value)}
                          style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "12px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", background: "white", boxSizing: "border-box" }}
                        />
                      </div>

                      <motion.div
                        ref={scheduleRef}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ paddingLeft: "8px" }}
                      >
                        {filteredDays.length > 0 ? (
                          filteredDays.map((dayData, index) => (
                            <DayCard key={dayData.day} dayData={dayData} index={index} isToday={false} />
                          ))
                        ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "40px", color: "#6b7280", fontSize: "14px" }}>
                            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
                            No activities found for this filter
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}

                  {activeView === "products" && (
                    <motion.div
                      key="products"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ background: "white", borderRadius: "20px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                      <ProductListView products={scheduleData.summary?.productList || []} />
                    </motion.div>
                  )}

                  {activeView === "milestones" && (
                    <motion.div
                      key="milestones"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{ background: "white", borderRadius: "20px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    >
                      <MilestoneView milestones={scheduleData.summary?.importantMilestones || []} totalDays={scheduleData.cropInfo?.totalDays || 120} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedCrop(null); setScheduleData(null); }}
                  style={{ width: "100%", padding: "14px", marginTop: "16px", background: "transparent", border: "1.5px dashed #d1d5db", borderRadius: "14px", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <span>🔄</span> Select Different Crop
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}