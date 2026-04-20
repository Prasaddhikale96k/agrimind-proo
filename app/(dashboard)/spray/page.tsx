"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const STORAGE_KEY = "agrimind_spray_crops";
const SCHEDULE_CACHE_KEY = "agrimind_spray_schedules";

const loadCrops = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveCrops = (crops: any[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(crops));
};

const loadCache = () => {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(SCHEDULE_CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
};

const saveCache = (cache: Record<string, any>) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCHEDULE_CACHE_KEY, JSON.stringify(cache));
};

const cropEmojiMap: Record<string, string> = {
  wheat: "🌾", rice: "🌾", paddy: "🌾", corn: "🌽", maize: "🌽",
  tomato: "🍅", potato: "🥔", onion: "🧅", garlic: "🧄",
  grape: "🍇", grapes: "🍇", mango: "🥭", banana: "🍌",
  apple: "🍎", orange: "🍊", lemon: "🍋", pomegranate: "🍎",
  cotton: "🌿", sugarcane: "🎋", soybean: "🫘", soya: "🫘",
  chickpea: "🫘", tur: "🫘", dal: "🫘", groundnut: "🥜",
  sunflower: "🌻", mustard: "🌿", turmeric: "🌿", ginger: "🌿",
  chilli: "🌶️", pepper: "🌶️", capsicum: "🫑", brinjal: "🍆",
  eggplant: "🍆", cabbage: "🥬", cauliflower: "🥦", spinach: "🥬",
  default: "🌱",
};

const getEmoji = (name: string) => {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(cropEmojiMap)) {
    if (lower.includes(key)) return emoji;
  }
  return cropEmojiMap.default;
};

const cropColorPalette = [
  "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#3b82f6", "#f97316", "#06b6d4", "#84cc16",
  "#ec4899", "#14b8a6", "#a855f7", "#eab308",
];

const randColor = () => cropColorPalette[Math.floor(Math.random() * cropColorPalette.length)];

const ACT: Record<string, { color: string; bg: string; icon: string }> = {
  Fertilizer:         { color: "#10b981", bg: "#d1fae5", icon: "🌱" },
  Fungicide:          { color: "#8b5cf6", bg: "#ede9fe", icon: "🍄" },
  Insecticide:        { color: "#ef4444", bg: "#fee2e2", icon: "🐛" },
  Herbicide:          { color: "#f59e0b", bg: "#fef3c7", icon: "🌿" },
  "Growth Regulator": { color: "#3b82f6", bg: "#dbeafe", icon: "📈" },
  Micronutrient:      { color: "#06b6d4", bg: "#cffafe", icon: "⚗️" },
  Irrigation:        { color: "#0ea5e9", bg: "#e0f2fe", icon: "💧" },
  Monitoring:         { color: "#6b7280", bg: "#f3f4f6", icon: "🔍" },
  "Seed Treatment":   { color: "#84cc16", bg: "#ecfccb", icon: "🌰" },
  Harvest:            { color: "#f97316", bg: "#ffedd5", icon: "🌾" },
};

const ACT_KEYS = Object.keys(ACT);
const getAct = (type: string) => ACT[type] || ACT.Monitoring;

const buildPrompt = (crop: any) => `
You are a senior agricultural scientist with 30+ years of field experience in Indian farming. Generate a COMPLETE, DETAILED, and ACCURATE spray & fertilizer schedule.

CROP DETAILS:
- Crop: ${crop.name}
- Variety: ${crop.variety}
- Area: ${crop.area} ${crop.areaUnit}
- Location: ${crop.location}, ${crop.state}
- Season: ${crop.season}
- Sowing Date: ${crop.sowingDate}
- Total Duration: ${crop.daysToHarvest} days
- Irrigation: ${crop.irrigationType}
- Soil Type: ${crop.soilType}
- Previous Crop: ${crop.previousCrop || "Unknown"}

STRICT JSON RULES:
1. Return ONLY valid JSON - no markdown, no explanation, start with {
2. Every string field must have a real value - NO empty strings, NO "Unknown", NO null
3. Every number field must be a real integer - NO NaN, NO null
4. activity.type MUST be EXACTLY one of: "Fertilizer", "Fungicide", "Insecticide", "Herbicide", "Growth Regulator", "Micronutrient", "Irrigation", "Seed Treatment", "Monitoring", "Harvest"
5. milestone.day MUST be a real integer between 0 and ${crop.daysToHarvest}
6. milestone.milestone MUST be a descriptive name (e.g. "Sowing Day", "First Irrigation", "Flowering Stage")
7. productList items MUST have real product names, real costs, real types
8. Generate 20-35 schedule days with REAL activities spread across full ${crop.daysToHarvest} days
9. No chemical sprays in last 14 days (Days ${crop.daysToHarvest-14} to ${crop.daysToHarvest})
10. All costs in Indian Rupees format like "₹1,200"

REQUIRED JSON STRUCTURE:
{
  "cropInfo": {
    "name": "${crop.name}",
    "variety": "${crop.variety}",
    "emoji": "${getEmoji(crop.name)}",
    "totalDays": ${crop.daysToHarvest},
    "season": "${crop.season}",
    "location": "${crop.location}, ${crop.state}",
    "area": "${crop.area} ${crop.areaUnit}",
    "expectedYield": "write actual realistic yield e.g. 25-30 quintals/acre",
    "expectedIncome": "write actual income e.g. ₹75,000 - ₹90,000 per acre",
    "summary": "Write 2 sentences about spray management strategy for this specific crop in this region",
    "stages": [
      {"name": "Germination", "startDay": 0, "endDay": ${Math.floor(crop.daysToHarvest*0.1)}, "color": "#22c55e", "icon": "🌱", "description": "Seed germination and emergence"},
      {"name": "Seedling", "startDay": ${Math.floor(crop.daysToHarvest*0.1)+1}, "endDay": ${Math.floor(crop.daysToHarvest*0.25)}, "color": "#16a34a", "icon": "🌿", "description": "Early plant establishment"},
      {"name": "Vegetative", "startDay": ${Math.floor(crop.daysToHarvest*0.25)+1}, "endDay": ${Math.floor(crop.daysToHarvest*0.5)}, "color": "#15803d", "icon": "🍃", "description": "Rapid leaf and stem growth"},
      {"name": "Flowering", "startDay": ${Math.floor(crop.daysToHarvest*0.5)+1}, "endDay": ${Math.floor(crop.daysToHarvest*0.7)}, "color": "#f59e0b", "icon": "🌸", "description": "Flower initiation and pollination"},
      {"name": "Fruiting", "startDay": ${Math.floor(crop.daysToHarvest*0.7)+1}, "endDay": ${Math.floor(crop.daysToHarvest*0.88)}, "color": "#ef4444", "icon": "🍎", "description": "Fruit or grain development"},
      {"name": "Maturity", "startDay": ${Math.floor(crop.daysToHarvest*0.88)+1}, "endDay": ${crop.daysToHarvest}, "color": "#8b5cf6", "icon": "✅", "description": "Crop ready for harvest"}
    ],
    "criticalWarnings": ["Write specific disease risk warning for ${crop.name} in ${crop.state}", "Write specific pest risk warning for this crop and season"]
  },
  "schedule": [
    {
      "day": 0,
      "stage": "Germination",
      "stageColor": "#22c55e",
      "stageIcon": "🌱",
      "hasActivity": true,
      "isRestDay": false,
      "isMilestone": true,
      "milestoneLabel": "Sowing Day",
      "estimatedDayCost": "₹2,800",
      "activities": [
        {
          "id": "d0_a1",
          "type": "Seed Treatment",
          "productName": "Thiram 75% WP",
          "brandName": "Bayer Thiram 75 WP",
          "chemicalName": "Thiram (Tetramethylthiuram disulfide) 75%",
          "category": "Fungicide seed treatment",
          "dosage": "3 grams per kg of seed",
          "waterVolume": "Mix in minimal water for seed coating",
          "applicationMethod": "Seed coating / slurry method before sowing",
          "sprayPressure": "Not applicable - seed treatment",
          "targetProblem": "Seed-borne fungal diseases, damping off, seed rot",
          "purpose": "Protects seeds from fungal pathogens during germination phase",
          "whenToApply": "1 day before or on sowing day morning",
          "weatherCondition": "Any weather, apply in shade",
          "waitAfterSpray": "Sow immediately after seed dries",
          "costPerUnit": "₹180 per 100g packet",
          "costPerAcre": "₹200",
          "totalCostForArea": "₹${Math.round(200 * crop.area)}",
          "availableAt": "IFFCO Kisan Seva Kendra, local agri shop",
          "preharvest": "Not applicable - seed treatment",
          "safetyClass": "WHO Class III - Slightly Hazardous",
          "ppe": "Wear gloves and avoid skin contact",
          "organicAlternative": "Trichoderma viride 4g/kg seed + Pseudomonas fluorescens 10g/kg seed",
          "expertNote": "Shade dry treated seeds for 30 minutes before sowing. Do not expose to direct sunlight",
          "warningFlags": ["Avoid contact with eyes", "Keep away from children"]
        },
        {
          "id": "d0_a2",
          "type": "Fertilizer",
          "productName": "DAP (Di-Ammonium Phosphate)",
          "brandName": "IFFCO DAP",
          "chemicalName": "Di-Ammonium Phosphate 18-46-0",
          "category": "Basal Phosphatic Fertilizer",
          "dosage": "50 kg per acre",
          "waterVolume": "No water needed - dry application",
          "applicationMethod": "Broadcast uniformly and incorporate 15cm deep by ploughing",
          "sprayPressure": "Not applicable - granular fertilizer",
          "targetProblem": "Phosphorus and nitrogen deficiency for root development",
          "purpose": "Provides phosphorus for strong root establishment and early plant vigor",
          "whenToApply": "Before sowing, mix into soil at ploughing time",
          "weatherCondition": "Dry weather. Avoid applying before heavy rain",
          "waitAfterSpray": "Sow 24 hours after incorporation",
          "costPerUnit": "₹1,350 per 50 kg bag",
          "costPerAcre": "₹1,350",
          "totalCostForArea": "₹${Math.round(1350 * crop.area)}",
          "availableAt": "IFFCO outlet, Krishak Bharati, district agriculture cooperative",
          "preharvest": "Not applicable - basal application",
          "safetyClass": "WHO Class IV - Practically Non-toxic",
          "ppe": "Dust mask recommended during application",
          "organicAlternative": "Rock phosphate 100 kg/acre + bone meal 50 kg/acre",
          "expertNote": "Band placement near seed rows increases phosphorus use efficiency by 20%",
          "warningFlags": []
        }
      ],
      "monitoringTasks": ["Check soil moisture - should be at field capacity before sowing", "Verify seed germination rate by performing germination test", "Ensure proper field drainage to avoid waterlogging"],
      "expertTip": "Sow when soil temperature is between 20-28°C for optimal germination of ${crop.name}"
    }
  ],
  "summary": {
    "totalActivityDays": 22,
    "totalRestDays": ${crop.daysToHarvest - 22},
    "totalFertilizerApplications": 4,
    "totalFungicideApplications": 3,
    "totalInsecticideApplications": 2,
    "totalHerbicideApplications": 2,
    "totalMicronutrientApplications": 2,
    "totalIrrigations": 6,
    "estimatedTotalCost": "₹18,500",
    "fertilizerCost": "₹8,200",
    "pesticideCost": "₹6,800",
    "laborCost": "₹3,500",
    "totalExpectedROI": "₹65,000 - ₹80,000 per acre after all expenses",
    "profitabilityAnalysis": "Write actual profitability analysis for ${crop.name} in ${crop.state} with current market rates",
    "importantMilestones": [
      {"day": 0, "milestone": "Sowing Day", "icon": "🌱", "description": "Crop establishment with seed treatment and basal fertilizer"},
      {"day": ${Math.floor(crop.daysToHarvest*0.15)}, "milestone": "First Irrigation", "icon": "💧", "description": "Critical irrigation for seedling establishment"},
      {"day": ${Math.floor(crop.daysToHarvest*0.3)}, "milestone": "Vegetative Stage", "icon": "🌿", "description": "Top dressing fertilizer and first pest monitoring"},
      {"day": ${Math.floor(crop.daysToHarvest*0.5)}, "milestone": "Flowering Begins", "icon": "🌸", "description": "Critical stage - apply potassium and monitor for flower drop"},
      {"day": ${Math.floor(crop.daysToHarvest*0.75)}, "milestone": "Fruit Development", "icon": "🍎", "description": "Fruit filling stage - ensure adequate nutrition"},
      {"day": ${crop.daysToHarvest}, "milestone": "Harvest Day", "icon": "🌾", "description": "Crop ready for harvest - check maturity indicators"}
    ],
    "productList": [
      {"productName": "DAP (Di-Ammonium Phosphate)", "brandName": "IFFCO DAP", "type": "Fertilizer", "chemicalName": "18-46-0 NPK", "totalQuantityNeeded": "50 kg", "numberOfApplications": 1, "usageDays": [0], "pricePerUnit": "₹1,350 per bag", "estimatedTotalCost": "₹1,350"},
      {"productName": "Thiram 75% WP", "brandName": "Bayer Thiram", "type": "Seed Treatment", "chemicalName": "Thiram 75%", "totalQuantityNeeded": "100g per 33 kg seed", "numberOfApplications": 1, "usageDays": [0], "pricePerUnit": "₹180 per 100g", "estimatedTotalCost": "₹200"}
    ],
    "weeklyBudget": [{"weekNumber": 1, "weekLabel": "Week 1 (Day 0-7)", "estimatedCost": "₹2,800", "numberOfActivities": 2, "keyActivities": "Seed treatment, Basal fertilizer application"}]
  }
}

NOW GENERATE THE COMPLETE SCHEDULE with 20-35 activity days spread realistically from Day 0 to Day ${crop.daysToHarvest} for ${crop.name} in ${crop.state}.

CRITICAL: Every activity MUST have ALL fields filled with REAL data. No empty strings. No "Unknown". No ₹0 costs.
`;

const callGroq = async (prompt: string, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "Return ONLY valid JSON. No markdown. No code blocks. Start with { character directly." },
            { role: "user", content: prompt },
          ],
          max_tokens: 8000,
          temperature: 0.1,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data.choices[0].message.content.trim();
      const s = raw.indexOf("{");
      const e = raw.lastIndexOf("}") + 1;
      if (s < 0) throw new Error("No JSON in response");
      return JSON.parse(raw.slice(s, e));
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
};

const normalizeSchedule = (raw: any, crop: any) => {
  if (!raw || typeof raw !== "object") return null;
  const totalDays = parseInt(crop.daysToHarvest) || 120;

  const safeStr = (v: string | undefined, def = "") => v && v.trim() ? v.trim() : def;
  const safeInt = (v: any, def = 0) => { const n = parseInt(v); return isNaN(n) ? def : n; };
  const safeArr = (v: any) => Array.isArray(v) ? v : [];

  const cropInfo = {
    name: safeStr(raw.cropInfo?.name, crop.name),
    variety: safeStr(raw.cropInfo?.variety, crop.variety),
    emoji: safeStr(raw.cropInfo?.emoji, getEmoji(crop.name)),
    totalDays,
    season: safeStr(raw.cropInfo?.season, crop.season),
    location: safeStr(raw.cropInfo?.location, `${crop.location}, ${crop.state}`),
    area: safeStr(raw.cropInfo?.area, `${crop.area} ${crop.areaUnit}`),
    expectedYield: safeStr(raw.cropInfo?.expectedYield, "Data being calculated"),
    expectedIncome: safeStr(raw.cropInfo?.expectedIncome, "Data being calculated"),
    summary: safeStr(raw.cropInfo?.summary, `Complete spray schedule for ${crop.name}.`),
    criticalWarnings: safeArr(raw.cropInfo?.criticalWarnings).filter(Boolean),
    stages: safeArr(raw.cropInfo?.stages).map((s: any) => ({
      name: safeStr(s.name, "Stage"),
      startDay: safeInt(s.startDay, 0),
      endDay: safeInt(s.endDay, totalDays),
      color: safeStr(s.color, "#10b981"),
      icon: safeStr(s.icon, "🌱"),
      description: safeStr(s.description, ""),
    })).filter((s: any) => !isNaN(s.startDay) && !isNaN(s.endDay)),
  };

  const normalizeType = (t: string) => {
    if (!t) return "Monitoring";
    const exact = ACT_KEYS.find(k => k.toLowerCase() === t.toLowerCase());
    if (exact) return exact;
    const partial = ACT_KEYS.find(k => k.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(k.toLowerCase()));
    return partial || "Monitoring";
  };

  const schedule = safeArr(raw.schedule).map((d: any) => {
    const dayNum = safeInt(d.day, -1);
    if (dayNum < 0) return null;

    const activities = safeArr(d.activities).map((a: any, ai: number) => ({
      id: safeStr(a.id, `d${dayNum}_a${ai}`),
      type: normalizeType(a.type),
      productName: safeStr(a.productName, "Product"),
      brandName: safeStr(a.brandName, safeStr(a.productName, "Brand")),
      chemicalName: safeStr(a.chemicalName, ""),
      category: safeStr(a.category, ""),
      dosage: safeStr(a.dosage, "As per label"),
      waterVolume: safeStr(a.waterVolume, "200 litres per acre"),
      applicationMethod: safeStr(a.applicationMethod, "Foliar spray"),
      sprayPressure: safeStr(a.sprayPressure, ""),
      targetProblem: safeStr(a.targetProblem, safeStr(a.targetProblem, "")),
      purpose: safeStr(a.purpose, ""),
      whenToApply: safeStr(a.whenToApply, safeStr(a.timing, "Early morning")),
      weatherCondition: safeStr(a.weatherCondition, ""),
      waitAfterSpray: safeStr(a.waitAfterSpray, ""),
      costPerUnit: safeStr(a.costPerUnit, ""),
      costPerAcre: safeStr(a.costPerAcre, "₹0"),
      totalCostForArea: safeStr(a.totalCostForArea, ""),
      availableAt: safeStr(a.availableAt, "Local agri input shop"),
      preharvest: safeStr(a.preharvest, ""),
      safetyClass: safeStr(a.safetyClass, ""),
      ppe: safeStr(a.ppe, ""),
      organicAlternative: safeStr(a.organicAlternative, ""),
      expertNote: safeStr(a.expertNote, safeStr(a.notes, "")),
      warningFlags: safeArr(a.warningFlags).filter(Boolean),
    })).filter((a: any) => a.productName !== "Product");

    const monTasks = safeArr(d.monitoringTasks).filter(Boolean);

    return {
      day: dayNum,
      stage: safeStr(d.stage, "Growing"),
      stageColor: safeStr(d.stageColor, "#10b981"),
      stageIcon: safeStr(d.stageIcon, "🌱"),
      hasActivity: activities.length > 0,
      isRestDay: activities.length === 0 && monTasks.length === 0,
      isMilestone: d.isMilestone === true,
      milestoneLabel: safeStr(d.milestoneLabel, ""),
      estimatedDayCost: safeStr(d.estimatedDayCost, ""),
      activities,
      monitoringTasks: monTasks,
      expertTip: safeStr(d.expertTip, ""),
    };
  }).filter(Boolean).sort((a: any, b: any) => a.day - b.day);

  const sumRaw = raw.summary || {};

  const milestones = safeArr(sumRaw.importantMilestones).map((m: any) => {
    const day = safeInt(m.day, -1);
    const milestone = safeStr(m.milestone, "");
    if (day < 0 || !milestone || milestone === "Milestone") return null;
    return { day, milestone, icon: safeStr(m.icon, "📌"), description: safeStr(m.description, "") };
  }).filter(Boolean);

  const finalMilestones = milestones.length >= 2 ? milestones : [
    { day: 0, milestone: "Sowing Day", icon: "🌱", description: "Crop establishment begins" },
    { day: Math.round(totalDays * 0.25), milestone: "Seedling Stage", icon: "🌿", description: "Active growth phase" },
    { day: Math.round(totalDays * 0.5), milestone: "Flowering", icon: "🌸", description: "Critical reproductive stage" },
    { day: Math.round(totalDays * 0.75), milestone: "Fruit Development", icon: "🍎", description: "Fruit filling stage" },
    { day: totalDays, milestone: "Harvest Day", icon: "🌾", description: "Ready for harvest" },
  ];

  const scheduleProducts: any[] = [];
  schedule.forEach((d: any) => {
    d.activities.forEach((a: any) => {
      const existing = scheduleProducts.find(p => p.productName === a.productName);
      if (existing) {
        existing.numberOfApplications++;
        if (!existing.usageDays.includes(d.day)) existing.usageDays.push(d.day);
      } else {
        scheduleProducts.push({
          productName: a.productName,
          brandName: a.brandName,
          type: a.type,
          chemicalName: a.chemicalName,
          totalQuantityNeeded: a.dosage,
          numberOfApplications: 1,
          usageDays: [d.day],
          pricePerUnit: a.costPerUnit || "",
          estimatedTotalCost: a.costPerAcre || "₹0",
          whereToUse: a.applicationMethod,
          howToUse: a.applicationMethod,
          storageInstructions: "",
          targetProblem: a.targetProblem,
          purpose: a.purpose,
        });
      }
    });
  });

  const rawProducts = safeArr(sumRaw.productList);
  const productMap = new Map();
  scheduleProducts.forEach(p => productMap.set(p.productName, p));
  rawProducts.forEach((p: any) => {
    const name = safeStr(p.productName, "");
    if (!name || name === "Unknown") return;
    const type = ACT_KEYS.find(k => k.toLowerCase() === safeStr(p.type, "").toLowerCase()) || "Monitoring";
    productMap.set(name, {
      productName: name,
      brandName: safeStr(p.brandName, name),
      type,
      chemicalName: safeStr(p.chemicalName, ""),
      totalQuantityNeeded: safeStr(p.totalQuantityNeeded, "As needed"),
      numberOfApplications: safeInt(p.numberOfApplications, 1),
      usageDays: safeArr(p.usageDays).map(Number).filter((n: number) => !isNaN(n)),
      pricePerUnit: safeStr(p.pricePerUnit, ""),
      estimatedTotalCost: safeStr(p.estimatedTotalCost, "₹0"),
      whereToUse: safeStr(p.whereToUse, ""),
      howToUse: safeStr(p.howToUse, ""),
      storageInstructions: safeStr(p.storageInstructions, "Store in cool dry place"),
      targetProblem: safeStr(p.targetProblem, ""),
      purpose: safeStr(p.purpose, ""),
    });
  });
  const productList = Array.from(productMap.values());

  const typeCounts: Record<string, number> = {};
  schedule.forEach((d: any) => d.activities.forEach((a: any) => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1; }));

  const summary = {
    totalActivityDays: schedule.filter((d: any) => d.hasActivity).length,
    totalRestDays: schedule.filter((d: any) => d.isRestDay).length,
    totalFertilizerApplications: typeCounts["Fertilizer"] || safeInt(sumRaw.totalFertilizerApplications, 0),
    totalFungicideApplications: typeCounts["Fungicide"] || safeInt(sumRaw.totalFungicideApplications, 0),
    totalInsecticideApplications: typeCounts["Insecticide"] || safeInt(sumRaw.totalInsecticideApplications, 0),
    totalHerbicideApplications: typeCounts["Herbicide"] || safeInt(sumRaw.totalHerbicideApplications, 0),
    totalMicronutrientApplications: typeCounts["Micronutrient"] || safeInt(sumRaw.totalMicronutrientApplications, 0),
    totalIrrigations: typeCounts["Irrigation"] || safeInt(sumRaw.totalIrrigations, 0),
    estimatedTotalCost: safeStr(sumRaw.estimatedTotalCost, "Calculating..."),
    fertilizerCost: safeStr(sumRaw.fertilizerCost, ""),
    pesticideCost: safeStr(sumRaw.pesticideCost, ""),
    laborCost: safeStr(sumRaw.laborCost, ""),
    totalExpectedROI: safeStr(sumRaw.totalExpectedROI, ""),
    profitabilityAnalysis: safeStr(sumRaw.profitabilityAnalysis, ""),
    importantMilestones: finalMilestones,
    productList,
    weeklyBudget: safeArr(sumRaw.weeklyBudget).map((w: any, i: number) => ({
      weekNumber: safeInt(w.weekNumber, i + 1),
      weekLabel: safeStr(w.weekLabel, `Week ${i + 1}`),
      estimatedCost: safeStr(w.estimatedCost, "₹0"),
      numberOfActivities: safeInt(w.numberOfActivities, 0),
      keyActivities: safeStr(w.keyActivities, ""),
    })),
  };

  return { cropInfo, schedule, summary };
};

const Particles = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div key={i}
        style={{ position: "absolute", width: Math.random() * 6 + 2, height: Math.random() * 6 + 2, borderRadius: "50%", background: `rgba(16,185,129,${Math.random() * 0.2 + 0.05})`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: Math.random() * 4 + 3, repeat: Infinity, delay: Math.random() * 3 }}
      />
    ))}
  </div>
);

const AILoader = ({ cropName }: { cropName: string }) => {
  const steps = [
    { icon: "🧬", t: `Analyzing ${cropName} agronomy...` },
    { icon: "🗓️", t: "Building season calendar..." },
    { icon: "🦠", t: "Mapping disease windows..." },
    { icon: "🐛", t: "Calculating pest timing..." },
    { icon: "💊", t: "Selecting Indian products..." },
    { icon: "💰", t: "Calculating costs & ROI..." },
    { icon: "📋", t: "Finalizing schedule..." },
    { icon: "✅", t: "Schedule ready!" },
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(p => Math.min(p + 1, steps.length - 1)), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ background: "white", borderRadius: "24px", padding: "40px 32px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
      <Particles />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ width: "90px", height: "90px", margin: "0 auto 24px", position: "relative" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTop: "3px solid #10b981", borderRight: "3px solid #059669" }} />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            style={{ position: "absolute", inset: "12px", borderRadius: "50%", border: "3px solid transparent", borderTop: "3px solid #34d399", borderLeft: "3px solid #6ee7b7" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>🤖</div>
        </div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "#065f46", marginBottom: "6px" }}>AI Generating Schedule</div>
        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "28px" }}>Creating complete plan for <strong>{cropName}</strong></div>
        <div style={{ width: "100%", height: "6px", background: "#d1fae5", borderRadius: "10px", marginBottom: "24px", overflow: "hidden" }}>
          <motion.div style={{ height: "100%", background: "linear-gradient(90deg,#10b981,#059669)", borderRadius: "10px" }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div style={{ textAlign: "left", maxWidth: "320px", margin: "0 auto" }}>
          {steps.slice(0, step + 1).map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 12px", marginBottom: "4px", background: i === step ? "#ecfdf5" : "transparent", borderRadius: "10px" }}>
              <span style={{ fontSize: "16px" }}>{s.icon}</span>
              <span style={{ fontSize: "12px", color: i === step ? "#065f46" : "#9ca3af", fontWeight: i === step ? "600" : "400" }}>{s.t}</span>
              {i < step && <span style={{ marginLeft: "auto", color: "#10b981", fontSize: "12px" }}>✓</span>}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SprayDetailModal = ({ dayData, crop, onClose }: { dayData: any; crop: any; onClose: () => void }) => {
  const [activeAct, setActiveAct] = useState(0);
  if (!dayData) return null;
  const act = dayData.activities[activeAct];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ background: "white", borderRadius: "28px 28px 0 0", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" as const }}>
          <div style={{ background: `linear-gradient(135deg,${dayData.stageColor}dd,${dayData.stageColor}99)`, padding: "20px 24px 16px", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.2)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{dayData.stageIcon}</div>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>Day {dayData.day} Schedule</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>{dayData.stage} Stage {dayData.milestoneLabel ? `• 🎯 ${dayData.milestoneLabel}` : ""}</div>
                  </div>
                </div>
                {dayData.estimatedDayCost && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "4px 12px", marginTop: "8px" }}>
                    <span style={{ fontSize: "12px", color: "white" }}>💰</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "white" }}>Total: {dayData.estimatedDayCost}</span>
                  </div>
                )}
              </div>
              <button onClick={onClose} style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", border: "none", color: "white", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            {dayData.activities.length > 1 && (
              <div style={{ display: "flex", gap: "6px", marginTop: "12px", overflowX: "auto" }}>
                {dayData.activities.map((a: any, i: number) => {
                  const cfg = getAct(a.type);
                  return (
                    <button key={i} onClick={() => setActiveAct(i)}
                      style={{ padding: "6px 12px", borderRadius: "20px", border: "none", background: activeAct === i ? "white" : "rgba(255,255,255,0.2)", color: activeAct === i ? cfg.color : "white", fontSize: "11px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 }}>
                      {cfg.icon} {a.type}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ overflowY: "auto" as const, flex: 1, padding: "20px 24px" }}>
            {act && (
              <AnimatePresence mode="wait">
                <motion.div key={activeAct} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {(() => {
                    const cfg = getAct(act.type);
                    return (
                      <div style={{ background: `linear-gradient(135deg,${cfg.bg},white)`, borderRadius: "20px", padding: "20px", marginBottom: "16px", border: `1.5px solid ${cfg.color}30` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                          <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                            style={{ width: "56px", height: "56px", background: cfg.bg, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", border: `2px solid ${cfg.color}30`, flexShrink: 0 }}>{cfg.icon}</motion.div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "10px", fontWeight: "700", color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: "20px", display: "inline-block", marginBottom: "4px" }}>{act.type.toUpperCase()}</div>
                            <div style={{ fontSize: "17px", fontWeight: "800", color: "#1f2937", marginBottom: "2px" }}>{act.productName}</div>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>{act.brandName}</div>
                          </div>
                          <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                            <div style={{ fontSize: "18px", fontWeight: "800", color: "#10b981" }}>{act.costPerAcre}</div>
                            <div style={{ fontSize: "10px", color: "#6b7280" }}>per acre</div>
                          </div>
                        </div>
                        {act.chemicalName && (
                          <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: "10px", padding: "8px 12px", fontSize: "12px", color: "#374151" }}>🧪 <strong>Chemical:</strong> {act.chemicalName}</div>
                        )}
                      </div>
                    );
                  })()}
                  <div style={{ background: "white", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1.5px solid #d1fae5" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#065f46", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "18px" }}>💉</span> How to Apply</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {[
                        { icon: "⚖️", label: "Dosage", value: act.dosage, highlight: true },
                        { icon: "💧", label: "Water Volume", value: act.waterVolume, highlight: true },
                        { icon: "🚿", label: "Application Method", value: act.applicationMethod },
                        { icon: "⏰", label: "When to Apply", value: act.whenToApply },
                        { icon: "🌤️", label: "Weather", value: act.weatherCondition },
                        { icon: "⏳", label: "Wait After Spray", value: act.waitAfterSpray },
                      ].filter(i => i.value).map((item, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          style={{ background: item.highlight ? "#ecfdf5" : "#f9fafb", borderRadius: "12px", padding: "10px 12px", border: item.highlight ? "1.5px solid #6ee7b7" : "1.5px solid transparent" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}><span style={{ fontSize: "14px" }}>{item.icon}</span><span style={{ fontSize: "10px", color: "#6b7280", fontWeight: "600" }}>{item.label.toUpperCase()}</span></div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: item.highlight ? "#065f46" : "#374151" }}>{item.value}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  {(act.targetProblem || act.purpose) && (
                    <div style={{ background: "white", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1.5px solid #e5e7eb" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><span>🎯</span> Target & Purpose</div>
                      {act.targetProblem && (
                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: "10px", fontWeight: "700", color: "#ef4444", marginBottom: "4px" }}>TARGET PROBLEM</div>
                          <div style={{ fontSize: "13px", color: "#374151", padding: "10px", background: "#fef2f2", borderRadius: "10px", border: "1px solid #fecaca" }}>{act.targetProblem}</div>
                        </div>
                      )}
                      {act.purpose && (
                        <div>
                          <div style={{ fontSize: "10px", fontWeight: "700", color: "#10b981", marginBottom: "4px" }}>PURPOSE</div>
                          <div style={{ fontSize: "13px", color: "#374151", padding: "10px", background: "#ecfdf5", borderRadius: "10px", border: "1px solid #6ee7b7" }}>{act.purpose}</div>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ background: "white", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1.5px solid #e5e7eb" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><span>💰</span> Cost & Availability</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                      {[
                        { label: "Per Unit", value: act.costPerUnit },
                        { label: "Per Acre", value: act.costPerAcre },
                        { label: "Your Farm", value: act.totalCostForArea || act.costPerAcre },
                      ].map((c, i) => (
                        <div key={i} style={{ background: i === 2 ? "#ecfdf5" : "#f9fafb", borderRadius: "12px", padding: "10px", textAlign: "center" as const, border: i === 2 ? "1.5px solid #6ee7b7" : "none" }}>
                          <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: "600", marginBottom: "4px" }}>{c.label.toUpperCase()}</div>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: i === 2 ? "#065f46" : "#374151" }}>{c.value || "—"}</div>
                        </div>
                      ))}
                    </div>
                    {act.availableAt && (
                      <div style={{ padding: "10px 12px", background: "#f0fdf4", borderRadius: "10px", border: "1px solid #d1fae5", fontSize: "12px", color: "#065f46", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>🏪</span><span><strong>Buy from:</strong> {act.availableAt}</span>
                      </div>
                    )}
                  </div>
                  {(act.safetyClass || act.ppe || act.warningFlags?.length > 0) && (
                    <div style={{ background: "#fef9f0", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1.5px solid #fde68a" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#92400e", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}><span>⚠️</span> Safety Information</div>
                      {act.safetyClass && <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "18px" }}>🏷️</span><span style={{ fontSize: "13px", color: "#374151" }}><strong>Safety Class:</strong> {act.safetyClass}</span></div>}
                      {act.ppe && <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "18px" }}>🧤</span><span style={{ fontSize: "13px", color: "#374151" }}><strong>Protection:</strong> {act.ppe}</span></div>}
                      {act.warningFlags?.filter(Boolean).map((w: string, i: number) => (
                        <div key={i} style={{ padding: "6px 10px", background: "#fef2f2", borderRadius: "8px", marginTop: "6px", fontSize: "12px", color: "#dc2626", display: "flex", alignItems: "center", gap: "6px" }}>🚨 {w}</div>
                      ))}
                    </div>
                  )}
                  {act.expertNote && (
                    <div style={{ background: "#fffbeb", borderRadius: "14px", padding: "14px", marginBottom: "12px", border: "1px solid #fde68a", display: "flex", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>💡</span>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400e", marginBottom: "4px" }}>EXPERT NOTE</div>
                        <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.6" }}>{act.expertNote}</div>
                      </div>
                    </div>
                  )}
                  {act.organicAlternative && (
                    <div style={{ background: "#f0fdf4", borderRadius: "14px", padding: "14px", marginBottom: "12px", border: "1px solid #bbf7d0", display: "flex", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>🌿</span>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#065f46", marginBottom: "4px" }}>ORGANIC ALTERNATIVE</div>
                        <div style={{ fontSize: "13px", color: "#047857", lineHeight: "1.6" }}>{act.organicAlternative}</div>
                      </div>
                    </div>
                  )}
                  {dayData.monitoringTasks?.length > 0 && activeAct === 0 && (
                    <div style={{ background: "#f8faff", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "1.5px solid #dbeafe" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e40af", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}><span>🔍</span> Monitoring Checklist</div>
                      {dayData.monitoringTasks.map((t: string, i: number) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px", background: "white", borderRadius: "8px", marginBottom: "6px" }}>
                          <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: "2px solid #3b82f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "10px", color: "#3b82f6" }}>{i + 1}</span></div>
                          <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>{t}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {dayData.expertTip && activeAct === 0 && (
                    <div style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", borderRadius: "14px", padding: "14px", border: "1px solid #fde68a", display: "flex", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>🌟</span>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", color: "#92400e", marginBottom: "4px" }}>TODAY'S EXPERT TIP</div>
                        <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.6" }}>{dayData.expertTip}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          <div style={{ padding: "14px 24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: "10px", flexShrink: 0 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Close</button>
            <button style={{ flex: 2, padding: "13px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>✅ Mark as Done</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const indianStates = ["Maharashtra", "Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Rajasthan", "Gujarat", "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Kerala", "West Bengal", "Bihar", "Odisha", "Assam", "Jharkhand", "Chhattisgarh", "Himachal Pradesh", "Uttarakhand"];

const AddModal = ({ onClose, onAdd }: { onClose: () => void; onAdd: (crop: any) => void }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", variety: "", area: "1", areaUnit: "Acre",
    location: "", state: "Maharashtra", season: "Kharif (June-Oct)",
    sowingDate: new Date().toISOString().split("T")[0],
    daysToHarvest: "", irrigationType: "Drip",
    soilType: "Black Cotton", previousCrop: "", notes: "",
  });
  const [errs, setErrs] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrs(e => ({ ...e, [k]: "" })); };

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.variety.trim()) e.variety = "Required";
    if (!form.area || +form.area <= 0) e.area = "Must be > 0";
    if (!form.daysToHarvest || +form.daysToHarvest < 20) e.daysToHarvest = "Min 20 days";
    return e;
  };
  const validate2 = () => {
    const e: Record<string, string> = {};
    if (!form.location.trim()) e.location = "Required";
    return e;
  };

  const next = () => {
    if (step === 1) { const e = validate1(); if (Object.keys(e).length) { setErrs(e); return; } }
    if (step === 2) { const e = validate2(); if (Object.keys(e).length) { setErrs(e); return; } }
    setStep(s => s + 1);
  };

  const submit = () => {
    onAdd({
      id: `crop_${Date.now()}`,
      ...form,
      area: +form.area,
      daysToHarvest: +form.daysToHarvest,
      emoji: getEmoji(form.name),
      color: randColor(),
      addedAt: new Date().toISOString(),
      hasSchedule: false,
    });
    onClose();
  };

  const inp = (err: boolean) => ({ width: "100%", padding: "11px 14px", borderRadius: "12px", border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`, fontSize: "13px", outline: "none", background: err ? "#fef2f2" : "white", boxSizing: "border-box" as const, color: "#1f2937", fontFamily: "inherit" });
  const lbl = { fontSize: "12px", fontWeight: "700" as const, color: "#374151", marginBottom: "6px", display: "block" };
  const chip = (val: string, cur: string) => ({ padding: "9px 12px", borderRadius: "10px", cursor: "pointer" as const, border: `1.5px solid ${val === cur ? "#10b981" : "#e5e7eb"}`, background: val === cur ? "#ecfdf5" : "white", color: val === cur ? "#065f46" : "#6b7280", fontSize: "11px", fontWeight: "600" as const });

  const harvestDate = form.sowingDate && form.daysToHarvest ? new Date(new Date(form.sowingDate).getTime() + +form.daysToHarvest * 86400000).toLocaleDateString("en-IN") : "—";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ background: "white", borderRadius: "28px 28px 0 0", width: "100%", maxWidth: "560px", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" as const }}>
          <div style={{ padding: "20px 24px 16px", background: "linear-gradient(135deg,#065f46,#047857)", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>➕ Add Crop</div>
                <div style={{ fontSize: "11px", color: "#a7f3d0", marginTop: "2px" }}>Step {step} of 3 — {["Basic Info", "Farm Details", "Confirm"][step - 1]}</div>
              </div>
              <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: "16px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
              {[1, 2, 3].map(s => (
                <motion.div key={s} animate={{ background: s <= step ? "white" : "rgba(255,255,255,0.3)" }}
                  style={{ flex: 1, height: "4px", borderRadius: "4px" }} />
              ))}
            </div>
          </div>
          <div style={{ overflowY: "auto" as const, flex: 1, padding: "20px 24px" }}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>🌱 Crop Name *</label>
                    <input style={inp(!!errs.name)} placeholder="e.g. Wheat, Tomato, Grapes..." value={form.name} onChange={e => set("name", e.target.value)} />
                    {errs.name && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>{errs.name}</div>}
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>🔬 Variety *</label>
                    <input style={inp(!!errs.variety)} placeholder="e.g. HD-2967, Hybrid F1..." value={form.variety} onChange={e => set("variety", e.target.value)} />
                    {errs.variety && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>{errs.variety}</div>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={lbl}>📐 Area *</label>
                      <input type="number" min="0.1" step="0.1" style={inp(!!errs.area)} value={form.area} onChange={e => set("area", e.target.value)} />
                      {errs.area && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>{errs.area}</div>}
                    </div>
                    <div>
                      <label style={lbl}>📏 Unit</label>
                      <select style={{ ...inp(false), cursor: "pointer" }} value={form.areaUnit} onChange={e => set("areaUnit", e.target.value)}>
                        {["Acre", "Hectare", "Guntha", "Bigha"].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>📅 Days to Harvest *</label>
                    <input type="number" min="20" max="730" style={inp(!!errs.daysToHarvest)} placeholder="e.g. 120" value={form.daysToHarvest} onChange={e => set("daysToHarvest", e.target.value)} />
                    {errs.daysToHarvest && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>{errs.daysToHarvest}</div>}
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>💡 Wheat~120d • Tomato~80d • Grapes~150d • Rice~115d • Cotton~180d</div>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <label style={lbl}>🌦️ Season</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {["Kharif (June-Oct)", "Rabi (Oct-Mar)", "Zaid (Mar-Jun)", "Annual", "Perennial"].map(s => (
                        <button key={s} style={chip(s, form.season)} onClick={() => set("season", s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>📍 Village / Town *</label>
                    <input style={inp(!!errs.location)} placeholder="e.g. Nashik, Pune..." value={form.location} onChange={e => set("location", e.target.value)} />
                    {errs.location && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>{errs.location}</div>}
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>🗺️ State</label>
                    <select style={{ ...inp(false), cursor: "pointer" }} value={form.state} onChange={e => set("state", e.target.value)}>
                      {indianStates.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>💧 Irrigation Type</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {[{ v: "Drip", i: "💧" }, { v: "Sprinkler", i: "🌧️" }, { v: "Flood/Furrow", i: "🌊" }, { v: "Rainfed", i: "🌦️" }, { v: "Canal", i: "🏞️" }].map(({ v, i }) => (
                        <button key={v} style={{ ...chip(v, form.irrigationType), display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "3px" }} onClick={() => set("irrigationType", v)}>
                          <span>{i}</span><span>{v}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>🪨 Soil Type</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {["Black Cotton", "Red Loamy", "Sandy Loam", "Clay Loam", "Alluvial", "Laterite"].map(s => (
                        <button key={s} style={chip(s, form.soilType)} onClick={() => set("soilType", s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  <div style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", borderRadius: "20px", padding: "20px", marginBottom: "16px", border: "1.5px solid #6ee7b7", textAlign: "center" as const }}>
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: "52px", marginBottom: "10px" }}>{getEmoji(form.name)}</motion.div>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "#065f46" }}>{form.name}</div>
                    <div style={{ fontSize: "13px", color: "#047857", marginBottom: "16px" }}>{form.variety}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", textAlign: "left" }}>
                      {[{ l: "Area", v: `${form.area} ${form.areaUnit}` }, { l: "Days", v: `${form.daysToHarvest} days` }, { l: "Season", v: form.season.split(" ")[0] }, { l: "Location", v: `${form.location}, ${form.state}` }, { l: "Irrigation", v: form.irrigationType }, { l: "Soil", v: form.soilType }, { l: "Sowing", v: new Date(form.sowingDate).toLocaleDateString("en-IN") }, { l: "Harvest By", v: harvestDate }].map(({ l, v }) => (
                        <div key={l} style={{ background: "white", borderRadius: "10px", padding: "10px" }}>
                          <div style={{ fontSize: "9px", color: "#6b7280", fontWeight: "600", marginBottom: "3px" }}>{l.toUpperCase()}</div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color: "#1f2937" }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "14px", padding: "14px", display: "flex", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>🤖</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#92400e", marginBottom: "4px" }}>AI will generate:</div>
                      <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.6" }}>
                        • Complete {form.daysToHarvest}-day spray schedule<br />• Real Indian products with dosages & costs<br />• Click any day to see full spray details<br />• Disease & pest calendar for {form.state}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ padding: "14px 24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: "10px", flexShrink: 0 }}>
            {step > 1 && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(s => s - 1)}
                style={{ flex: 1, padding: "13px", borderRadius: "14px", border: "1.5px solid #e5e7eb", background: "white", color: "#6b7280", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                ← Back
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }} onClick={step < 3 ? next : submit}
              style={{ flex: 2, padding: "13px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.35)" }}>
              {step < 3 ? "Next →" : "✅ Add & Generate Schedule"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const DayCard = ({ d, idx, onDayClick }: { d: any; idx: number; onDayClick: (day: any) => void }) => {
  const color = d.stageColor || "#10b981";
  const isClickable = d.hasActivity || d.monitoringTasks?.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.5), type: "spring", stiffness: 300, damping: 25 }}
      style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
        <motion.button whileHover={isClickable ? { scale: 1.15 } : {}} whileTap={isClickable ? { scale: 0.9 } : {}}
          onClick={() => isClickable && onDayClick(d)}
          style={{ width: d.hasActivity ? "38px" : "24px", height: d.hasActivity ? "38px" : "24px", borderRadius: "50%", background: d.isRestDay ? "#f3f4f6" : `linear-gradient(135deg,${color},${color}bb)`, border: `2px solid ${d.isRestDay ? "#e5e7eb" : color}`, display: "flex", alignItems: "center", justifyContent: "center", color: d.isRestDay ? "#9ca3af" : "white", fontSize: d.hasActivity ? "13px" : "9px", fontWeight: "800", boxShadow: d.hasActivity ? `0 0 14px ${color}30` : "none", cursor: isClickable ? "pointer" : "default" as const, padding: 0 }}>
          {d.hasActivity ? (d.stageIcon || "📅") : d.day}
        </motion.button>
        <div style={{ width: "2px", flex: 1, minHeight: "16px", background: d.isRestDay ? "#f3f4f6" : `${color}20` }} />
      </div>
      <motion.div whileHover={isClickable ? { scale: 1.005, y: -1 } : {}} whileTap={isClickable ? { scale: 0.998 } : {}}
        onClick={() => isClickable && onDayClick(d)}
        style={{ flex: 1, background: d.isRestDay ? "#f9fafb" : "white", borderRadius: "14px", padding: "11px 14px", border: d.isRestDay ? "1px dashed #e5e7eb" : `1.5px solid ${color}25`, cursor: isClickable ? "pointer" : "default" as const, boxShadow: d.hasActivity ? "0 2px 10px rgba(0,0,0,0.05)" : "none", marginBottom: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px", flexWrap: "wrap" as const }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: d.isRestDay ? "#9ca3af" : "#1f2937" }}>Day {d.day}</span>
              {d.isMilestone && d.milestoneLabel && (
                <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: "10px", fontWeight: "700", color: "#f59e0b", background: "#fef3c7", padding: "1px 7px", borderRadius: "20px", border: "1px solid #fde68a" }}>
                  🎯 {d.milestoneLabel}
                </motion.span>
              )}
              <span style={{ fontSize: "10px", fontWeight: "600", color, background: `${color}15`, padding: "1px 7px", borderRadius: "20px" }}>{d.stage}</span>
            </div>
            {d.isRestDay && !d.monitoringTasks?.length ? (
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>🌙 Rest day</div>
            ) : (
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" as const }}>
                {d.activities?.map((a: any, i: number) => {
                  const c = getAct(a.type);
                  return <span key={i} style={{ fontSize: "10px", fontWeight: "600", color: c.color, background: c.bg, padding: "1px 7px", borderRadius: "20px" }}>{c.icon} {a.type}</span>;
                })}
                {d.monitoringTasks?.length > 0 && !d.hasActivity && (
                  <span style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280", background: "#f3f4f6", padding: "1px 7px", borderRadius: "20px" }}>🔍 Monitor</span>
                )}
              </div>
            )}
            {d.hasActivity && (
              <div style={{ marginTop: "5px", fontSize: "11px", color: "#6b7280" }}>{d.activities.map((a: any) => a.productName).join(" • ")}</div>
            )}
            {d.monitoringTasks?.length > 0 && (
              <div style={{ marginTop: "4px", fontSize: "11px", color: "#6b7280" }}>🔍 {d.monitoringTasks[0]}{d.monitoringTasks.length > 1 ? ` +${d.monitoringTasks.length - 1}` : ""}</div>
            )}
          </div>
          {isClickable && (
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: "3px", flexShrink: 0, marginLeft: "8px" }}>
              {d.estimatedDayCost && d.hasActivity && <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981" }}>{d.estimatedDayCost}</span>}
              <motion.div animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: "10px", color, fontWeight: "700", background: `${color}15`, padding: "3px 8px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "3px" }}>
                View Details →
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const CropCard = ({ crop, isSelected, isGenerating, onGenerate, onDelete }: any) => (
  <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.005, y: -1 }}
    style={{ background: "white", borderRadius: "18px", border: `2px solid ${isSelected ? crop.color : "#e5e7eb"}`, overflow: "hidden", boxShadow: isSelected ? `0 4px 20px ${crop.color}20` : "0 2px 8px rgba(0,0,0,0.05)", transition: "border-color 0.2s,box-shadow 0.2s", position: "relative" as const }}>
    {isSelected && <motion.div layoutId="sel" style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg,${crop.color},${crop.color}aa)` }} />}
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <motion.div animate={isSelected ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}
          style={{ width: "52px", height: "52px", background: `${crop.color}15`, borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0, border: `1.5px solid ${crop.color}25` }}>
          {crop.emoji}
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#1f2937", marginBottom: "2px" }}>{crop.name}</div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{crop.variety} • {crop.area} {crop.areaUnit} • {crop.location}</div>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" as const }}>
            <span style={{ fontSize: "10px", fontWeight: "600", color: "#10b981", background: "#d1fae5", padding: "1px 7px", borderRadius: "20px" }}>{crop.daysToHarvest}d to harvest</span>
            {crop.hasSchedule && <span style={{ fontSize: "10px", fontWeight: "600", color: "#8b5cf6", background: "#ede9fe", padding: "1px 7px", borderRadius: "20px" }}>✓ Scheduled</span>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: "6px", flexShrink: 0 }}>
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => onGenerate(crop)} disabled={isGenerating}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "none", background: isGenerating ? "#d1d5db" : `linear-gradient(135deg,${crop.color},${crop.color}cc)`, color: "white", fontSize: "11px", fontWeight: "700", cursor: isGenerating ? "not-allowed" : "pointer", whiteSpace: "nowrap", boxShadow: isGenerating ? "none" : `0 3px 10px ${crop.color}35` }}>
            {isGenerating ? "⏳ Generating..." : (crop.hasSchedule ? "🔄 Re-gen" : "Generate →")}
          </motion.button>
          <motion.button whileTap={{ scale: 0.93 }} onClick={() => onDelete(crop.id)}
            style={{ padding: "6px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fef2f2", color: "#ef4444", fontSize: "11px", cursor: "pointer" }}>
            🗑️ Delete
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
);

const Stat = ({ icon, label, value, color, delay = 0 }: { icon: string; label: string; value: string | number; color: string; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay, type: "spring", stiffness: 300 }}
    whileHover={{ scale: 1.04, y: -2 }}
    style={{ background: "white", borderRadius: "16px", padding: "14px", textAlign: "center" as const, border: `1.5px solid ${color}20`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
    <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: delay + 1 }} style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</motion.div>
    <div style={{ fontSize: "17px", fontWeight: "800", color, marginBottom: "3px" }}>{value}</div>
    <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: "600" }}>{label}</div>
  </motion.div>
);

export default function SprayPage() {
  const [crops, setCrops] = useState<any[]>([]);
  const [cache, setCache] = useState<Record<string, any>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeView, setActiveView] = useState("timeline");
  const [filterType, setFilterType] = useState("All");
  const [searchDay, setSearchDay] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [selectedDayModal, setSelectedDayModal] = useState<any>(null);
  const schedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = loadCrops();
    const ch = loadCache();
    if (c.length) setCrops(c);
    if (Object.keys(ch).length) setCache(ch);
  }, []);

  const selected = crops.find(c => c.id === selectedId) || null;
  const rawData = selectedId ? cache[selectedId] : null;
  const data = rawData && selected ? normalizeSchedule(rawData, selected) : null;
  const isLoading = !!generatingId;

  const addCrop = useCallback((crop: any) => {
    const updated = [...crops, crop];
    setCrops(updated);
    saveCrops(updated);
    generate(crop, updated);
  }, [crops]);

  const deleteCrop = useCallback((id: string) => {
    const updated = crops.filter(c => c.id !== id);
    setCrops(updated);
    saveCrops(updated);
    const newCache = { ...cache };
    delete newCache[id];
    setCache(newCache);
    saveCache(newCache);
    if (selectedId === id) setSelectedId(null);
  }, [crops, cache, selectedId]);

  const generate = useCallback(async (crop: any, currentCrops: any[] = crops) => {
    if (generatingId) return;
    setGeneratingId(crop.id);
    setSelectedId(crop.id);
    setErr(null);
    setActiveView("timeline");
    setFilterType("All");

    try {
      const prompt = buildPrompt(crop);
      const raw = await callGroq(prompt);
      const cropsNow = currentCrops || crops;
      const updated = cropsNow.map(c => c.id === crop.id ? { ...c, hasSchedule: true } : c);
      setCrops(updated);
      saveCrops(updated);
      const newCache = { ...cache, [crop.id]: raw };
      setCache(newCache);
      saveCache(newCache);
      setTimeout(() => schedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
    } catch (e: any) {
      console.error(e);
      setErr(`Generation failed: ${e.message}. Please try again.`);
    } finally {
      setGeneratingId(null);
    }
  }, [generatingId, crops, cache]);

  const allActivityDays = data?.schedule?.filter((d: any) => d.hasActivity || d.monitoringTasks?.length > 0) || [];

  const filteredDays = allActivityDays.filter((d: any) => {
    if (filterType !== "All" && !d.activities?.some((a: any) => a.type === filterType)) return false;
    if (searchDay.trim() && !d.day.toString().includes(searchDay.trim())) return false;
    return true;
  });

  const filterCounts: Record<string, number> = {};
  allActivityDays.forEach((d: any) => { d.activities?.forEach((a: any) => { filterCounts[a.type] = (filterCounts[a.type] || 0) + 1; }); });

  const views = [{ id: "timeline", icon: "📅", label: "Timeline" }, { id: "products", icon: "📦", label: "Products" }, { id: "milestones", icon: "🎯", label: "Milestones" }, { id: "budget", icon: "💰", label: "Budget" }];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 40%,#f0f9ff 100%)", fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: "linear-gradient(135deg,#065f46,#047857,#059669)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 4px 24px rgba(6,95,70,0.3)" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <motion.span animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ fontSize: "22px" }}>🌿</motion.span>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>Spray Schedule</div>
              <div style={{ fontSize: "11px", color: "#a7f3d0" }}>AI-Powered Season Planning</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
              <span style={{ fontSize: "11px", color: "white", fontWeight: "600" }}>AI Active</span>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)}
              style={{ padding: "9px 18px", borderRadius: "12px", border: "none", background: "white", color: "#065f46", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
              ➕ Add Crop
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "20px 16px 40px" }}>
        <AnimatePresence>
          {err && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "14px", padding: "12px 16px", marginBottom: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span>⚠️</span>
              <span style={{ flex: 1, fontSize: "12px", color: "#dc2626" }}>{err}</span>
              <button onClick={() => setErr(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#1f2937" }}>Your Crops ({crops.length})</div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>Tap "Generate" then click any day for spray details</div>
            </div>
          </div>

          {crops.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "white", borderRadius: "24px", padding: "48px 32px", textAlign: "center" as const, border: "2px dashed #d1fae5", position: "relative" as const, overflow: "hidden" }}>
              <Particles />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: "60px", marginBottom: "16px" }}>🌾</motion.div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#1f2937", marginBottom: "8px" }}>No crops yet</div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px", lineHeight: "1.6" }}>Add your crops to generate AI-powered<br />complete day-by-day spray schedules</div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(true)}
                style={{ padding: "14px 28px", borderRadius: "16px", border: "none", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(16,185,129,0.35)" }}>
                ➕ Add Your First Crop
              </motion.button>
            </motion.div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
              <AnimatePresence>
                {crops.map(crop => (
                  <CropCard key={crop.id} crop={crop} isSelected={selectedId === crop.id} isGenerating={generatingId === crop.id}
                    onGenerate={generate} onDelete={deleteCrop} />
                ))}
              </AnimatePresence>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)}
                style={{ padding: "14px", borderRadius: "18px", border: "2px dashed #d1fae5", background: "rgba(255,255,255,0.6)", color: "#10b981", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2, repeat: Infinity }}>➕</motion.span>
                Add Another Crop
              </motion.button>
            </div>
          )}
        </div>

        <div ref={schedRef}>
          <AnimatePresence mode="wait">
            {isLoading && selected && (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AILoader cropName={selected.name} />
              </motion.div>
            )}

            {!isLoading && data && selected && (
              <motion.div key="sched" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: `linear-gradient(135deg,${selected.color}dd,${selected.color}99)`, borderRadius: "24px", padding: "20px", marginBottom: "14px", color: "white", position: "relative" as const, overflow: "hidden" }}>
                  <Particles />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
                        style={{ width: "60px", height: "60px", background: "rgba(255,255,255,0.2)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>{data.cropInfo.emoji}</motion.div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "19px", fontWeight: "800", marginBottom: "3px" }}>{data.cropInfo.name}</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "10px" }}>{data.cropInfo.variety} • {data.cropInfo.totalDays} days • {data.cropInfo.area}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                          {[{ l: "Activity Days", v: data.summary.totalActivityDays }, { l: "Total Cost", v: data.summary.estimatedTotalCost }, { l: "Expected Yield", v: data.cropInfo.expectedYield }].map(s => (
                            <div key={s.l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px", textAlign: "center" as const }}>
                              <div style={{ fontSize: "13px", fontWeight: "800" }}>{s.v || "—"}</div>
                              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", fontWeight: "600" }}>{s.l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {data.cropInfo.summary && (
                      <div style={{ marginTop: "12px", padding: "10px 12px", background: "rgba(0,0,0,0.12)", borderRadius: "10px", fontSize: "12px", lineHeight: "1.5", color: "rgba(255,255,255,0.92)" }}>💡 {data.cropInfo.summary}</div>
                    )}
                  </div>
                </motion.div>

                {data.cropInfo.stages.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ background: "white", borderRadius: "20px", padding: "16px", marginBottom: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "12px" }}>📊 Growth Stage Timeline</div>
                    <div style={{ display: "flex", gap: "2px", borderRadius: "10px", overflow: "hidden", height: "12px", marginBottom: "10px" }}>
                      {data.cropInfo.stages.map((s: any, i: number) => {
                        const w = Math.max(((s.endDay - s.startDay) / data.cropInfo.totalDays) * 100, 0);
                        return <motion.div key={i} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.08, duration: 0.5 }}
                          style={{ width: `${w}%`, background: s.color, transformOrigin: "left" }} />;
                      })}
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const }}>
                      {data.cropInfo.stages.map((s: any, i: number) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color }} />
                          <span style={{ fontSize: "10px", color: "#6b7280" }}>{s.name} (D{s.startDay}-{s.endDay})</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  <Stat icon="🌱" label="Fertilizer" value={data.summary.totalFertilizerApplications} color="#10b981" delay={0} />
                  <Stat icon="🍄" label="Fungicide" value={data.summary.totalFungicideApplications} color="#8b5cf6" delay={0.07} />
                  <Stat icon="🐛" label="Insecticide" value={data.summary.totalInsecticideApplications} color="#ef4444" delay={0.14} />
                  <Stat icon="💰" label="Total Cost" value={data.summary.estimatedTotalCost} color="#f59e0b" delay={0.21} />
                </div>

                <div style={{ display: "flex", gap: "4px", background: "white", borderRadius: "14px", padding: "5px", marginBottom: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  {views.map(v => (
                    <motion.button key={v.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveView(v.id)}
                      style={{ flex: 1, padding: "9px 4px", border: "none", background: activeView === v.id ? "linear-gradient(135deg,#10b981,#059669)" : "transparent", color: activeView === v.id ? "white" : "#6b7280", borderRadius: "10px", fontSize: "11px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", transition: "all 0.25s" }}>
                      <span>{v.icon}</span><span>{v.label}</span>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeView === "timeline" && (
                    <motion.div key="tl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", borderRadius: "12px", padding: "10px 14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #6ee7b7" }}>
                        <span style={{ fontSize: "18px" }}>👆</span>
                        <span style={{ fontSize: "12px", color: "#065f46", fontWeight: "600" }}>Click any day card to see full spray details, dosage, cost & safety info</span>
                      </motion.div>
                      <div style={{ overflowX: "auto", paddingBottom: "10px", marginBottom: "10px" }}>
                        <div style={{ display: "flex", gap: "6px", minWidth: "max-content" }}>
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setFilterType("All")}
                            style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${filterType === "All" ? "#10b981" : "#e5e7eb"}`, background: filterType === "All" ? "#ecfdf5" : "white", color: filterType === "All" ? "#065f46" : "#6b7280", fontSize: "11px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" as const }}>
                            All ({allActivityDays.length})
                          </motion.button>
                          {ACT_KEYS.filter(k => filterCounts[k] > 0).map(type => {
                            const c = getAct(type);
                            return (
                              <motion.button key={type} whileTap={{ scale: 0.95 }} onClick={() => setFilterType(type)}
                                style={{ padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${filterType === type ? c.color : "#e5e7eb"}`, background: filterType === type ? c.bg : "white", color: filterType === type ? c.color : "#6b7280", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap", transition: "all 0.2s" }}>
                                <span>{c.icon}</span><span>{type}</span>
                                <span style={{ background: filterType === type ? c.color : "#e5e7eb", color: filterType === type ? "white" : "#6b7280", borderRadius: "10px", padding: "0 5px", fontSize: "10px", fontWeight: "700" }}>{filterCounts[type]}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ position: "relative", marginBottom: "12px" }}>
                        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", color: "#9ca3af" }}>🔍</span>
                        <input type="number" placeholder="Jump to day number..." value={searchDay}
                          onChange={e => { setSearchDay(e.target.value); setFilterType("All"); }}
                          style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "12px", border: "1.5px solid #e5e7eb", fontSize: "13px", outline: "none", background: "white", boxSizing: "border-box", color: "#1f2937" }} />
                      </div>
                      {(filterType !== "All" || searchDay) && (
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                          <span>Showing {filteredDays.length}/{allActivityDays.length} days</span>
                          <button onClick={() => { setFilterType("All"); setSearchDay(""); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981", fontSize: "12px", fontWeight: "600" }}>Clear ✕</button>
                        </div>
                      )}
                      <div style={{ paddingLeft: "4px" }}>
                        {filteredDays.length > 0 ? (
                          filteredDays.filter(Boolean).map((d, i) => d && <DayCard key={`${d.day}_${i}`} d={d} idx={i} onDayClick={setSelectedDayModal} />)
                        ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ textAlign: "center", padding: "48px", background: "white", borderRadius: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                            <div style={{ fontSize: "36px", marginBottom: "12px" }}>{filterType !== "All" ? getAct(filterType).icon : "🔍"}</div>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937", marginBottom: "6px" }}>{filterType !== "All" ? `No ${filterType} applications` : "No activities found"}</div>
                            {filterType !== "All" && <button onClick={() => setFilterType("All")} style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "10px", border: "none", background: "#10b981", color: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Show All</button>}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeView === "products" && (
                    <motion.div key="prod" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" }}>📦 Complete Product List</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>All inputs required for the season</div>
                      {data.summary.productList.length > 0 ? (
                        data.summary.productList.map((p: any, i: number) => {
                          const cfg = getAct(p.type);
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.01, x: 3 }}
                              style={{ background: "#f9fafb", borderRadius: "14px", padding: "14px", marginBottom: "10px", display: "flex", alignItems: "flex-start", gap: "12px", border: `1.5px solid ${cfg.color}15` }}>
                              <div style={{ width: "46px", height: "46px", background: cfg.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>{cfg.icon}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>{p.brandName || p.productName}</div>
                                  <div style={{ fontSize: "15px", fontWeight: "800", color: "#065f46", flexShrink: 0, marginLeft: "8px" }}>{p.estimatedTotalCost}</div>
                                </div>
                                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>{p.productName}</div>
                                {p.chemicalName && <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "6px" }}>🧪 {p.chemicalName}</div>}
                                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" as const, marginBottom: "6px" }}>
                                  <span style={{ fontSize: "10px", fontWeight: "600", color: cfg.color, background: cfg.bg, padding: "1px 7px", borderRadius: "20px" }}>{p.type}</span>
                                  <span style={{ fontSize: "10px", color: "#6b7280", background: "#f3f4f6", padding: "1px 7px", borderRadius: "20px" }}>{p.totalQuantityNeeded}</span>
                                  <span style={{ fontSize: "10px", color: "#6b7280", background: "#f3f4f6", padding: "1px 7px", borderRadius: "20px" }}>{p.numberOfApplications}x</span>
                                  {p.usageDays?.slice(0, 4).map((d: number) => (
                                    <span key={d} style={{ fontSize: "10px", color: "#6b7280", background: "#f3f4f6", padding: "1px 6px", borderRadius: "20px" }}>D{d}</span>
                                  ))}
                                  {p.usageDays?.length > 4 && <span style={{ fontSize: "10px", color: "#9ca3af" }}>+{p.usageDays.length - 4}</span>}
                                </div>
                                {p.howToUse && <div style={{ fontSize: "11px", color: "#374151", lineHeight: "1.4" }}>📋 {p.howToUse}</div>}
                                {p.pricePerUnit && <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>🏷️ {p.pricePerUnit}</div>}
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📦</div>
                          <div style={{ fontSize: "14px", fontWeight: "600" }}>No product data available</div>
                          <div style={{ fontSize: "12px", marginTop: "6px" }}>Regenerate the schedule to get product details</div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeView === "milestones" && (
                    <motion.div key="mile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      <div style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" }}>🎯 Key Milestones</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "20px" }}>Critical checkpoints in your crop cycle</div>
                      {data.summary.importantMilestones.map((m: any, i: number, arr: any[]) => {
                        const dayNum = typeof m.day === "number" && !isNaN(m.day) ? m.day : 0;
                        const total = data.cropInfo.totalDays || 1;
                        const pct = Math.round((dayNum / total) * 100);
                        const mileName = m.milestone || "Milestone";
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            style={{ display: "flex", gap: "14px", marginBottom: i < arr.length - 1 ? "20px" : "0" }}>
                            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", flexShrink: 0 }}>
                              <motion.div whileHover={{ scale: 1.2, rotate: 10 }}
                                style={{ width: "48px", height: "48px", background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", boxShadow: "0 4px 12px rgba(16,185,129,0.3)", flexShrink: 0 }}>{m.icon}</motion.div>
                              {i < arr.length - 1 && <div style={{ width: "2px", height: "28px", background: "linear-gradient(to bottom,#10b981,#d1fae5)", marginTop: "4px" }} />}
                            </div>
                            <div style={{ flex: 1, paddingTop: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937" }}>{mileName}</div>
                                <div style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", background: "#d1fae5", padding: "2px 8px", borderRadius: "20px", flexShrink: 0, marginLeft: "8px" }}>Day {dayNum}</div>
                              </div>
                              {m.description && <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px", lineHeight: "1.4" }}>{m.description}</div>}
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ flex: 1, height: "6px", background: "#f3f4f6", borderRadius: "4px", overflow: "hidden" }}>
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                                    style={{ height: "100%", background: "linear-gradient(90deg,#10b981,#059669)", borderRadius: "4px" }} />
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", flexShrink: 0 }}>{pct}%</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                  {activeView === "budget" && (
                    <motion.div key="bud" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                        {[
                          { icon: "🌱", label: "Fertilizers", value: data.summary.fertilizerCost, color: "#10b981" },
                          { icon: "💊", label: "Pesticides", value: data.summary.pesticideCost, color: "#8b5cf6" },
                          { icon: "👨‍🌾", label: "Labor", value: data.summary.laborCost, color: "#f59e0b" },
                          { icon: "💰", label: "Total", value: data.summary.estimatedTotalCost, color: "#065f46" },
                        ].map((item, i) => (
                          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.03 }}
                            style={{ background: "white", borderRadius: "16px", padding: "16px", border: `1.5px solid ${item.color}20`, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", textAlign: "center" as const }}>
                            <div style={{ fontSize: "26px", marginBottom: "8px" }}>{item.icon}</div>
                            <div style={{ fontSize: "18px", fontWeight: "800", color: item.color, marginBottom: "4px" }}>{item.value || "—"}</div>
                            <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "600" }}>{item.label}</div>
                          </motion.div>
                        ))}
                      </div>
                      {data.summary.totalExpectedROI && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                          style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", borderRadius: "20px", padding: "16px", marginBottom: "12px", border: "1.5px solid #6ee7b7" }}>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "#065f46", marginBottom: "8px" }}>📈 Expected ROI</div>
                          <div style={{ fontSize: "20px", fontWeight: "800", color: "#047857", marginBottom: "8px" }}>{data.summary.totalExpectedROI}</div>
                          {data.summary.profitabilityAnalysis && <div style={{ fontSize: "12px", color: "#065f46", lineHeight: "1.6" }}>{data.summary.profitabilityAnalysis}</div>}
                        </motion.div>
                      )}
                      {data.summary.weeklyBudget?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                          style={{ background: "white", borderRadius: "20px", padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937", marginBottom: "12px" }}>📅 Weekly Budget</div>
                          {data.summary.weeklyBudget.map((w: any, i: number) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#f9fafb", borderRadius: "10px", marginBottom: "6px" }}>
                              <div>
                                <div style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{w.weekLabel}</div>
                                <div style={{ fontSize: "10px", color: "#6b7280" }}>{w.keyActivities}</div>
                              </div>
                              <div style={{ fontSize: "14px", fontWeight: "800", color: "#10b981" }}>{w.estimatedCost}</div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {!isLoading && !data && crops.length > 0 && (
              <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ background: "white", borderRadius: "24px", padding: "36px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1.5px dashed #d1fae5", position: "relative" as const, overflow: "hidden" }}>
                <Particles />
                <motion.div animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: "48px", marginBottom: "12px" }}>🤖</motion.div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "6px" }}>Click "Generate →" on any crop above</div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>AI creates complete day-by-day schedule</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={addCrop} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDayModal && <SprayDetailModal dayData={selectedDayModal} crop={selected} onClose={() => setSelectedDayModal(null)} />}
      </AnimatePresence>
    </div>
  );
}