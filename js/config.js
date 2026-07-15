export const CONFIG = Object.freeze({
  age: [18, 100], height: [120, 230], weight: [30, 300],
  bodyFat: { male: [3, 60], female: [10, 70] },
  activity: {
    sedentary: { factor: 1.2, title: '久坐少动', example: '大部分时间坐着、很少运动，通常少于5000步' },
    light: { factor: 1.35, title: '轻度活动', example: '偶尔散步，每周运动1至3次' },
    moderate: { factor: 1.5, title: '中度活动', example: '每周运动3至5次，经常走路' },
    high: { factor: 1.7, title: '高度活动', example: '每周运动6至7次，工作走动较多' },
    extreme: { factor: 1.85, title: '极高活动', example: '重体力劳动、每天高强度训练' }
  },
  goalRates: { lose: { mild: -0.10, standard: -0.15, fast: -0.20 }, maintain: { standard: 0 }, gain: { mild: 0.05, standard: 0.075, fast: 0.10 } },
  fat: { gramsPerKg: 0.8, minShare: 0.20, preferredShare: 0.25, maxShare: 0.35 },
  caloriesPerGram: { protein: 4, fat: 9, carbs: 4 },
  calibration: { kcalPerKg: 7700, minDays: 7, recommendedDays: 14, blend: 0.5, maxDifference: 0.25 }
});

export const DEFAULTS = Object.freeze({ age: 45, sex: 'female', height: 165, weight: 65, activity: 'light', goal: 'maintain', goalRate: 'standard', strength: 0, cardio: 0, duration: 30, steps: 4000, workType: 'sitting', mealCount: 3 });
