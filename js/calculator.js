import { CONFIG } from './config.js';

const n = value => value === '' || value == null ? NaN : Number(value);
export function validateInput(input) {
  const errors = [];
  const ranged = (key, label, range) => { const v=n(input[key]); if (!Number.isFinite(v) || v<range[0] || v>range[1]) errors.push(`${label}输入可能有误，请填写${range[0]}至${range[1]}`); };
  ranged('age','年龄',CONFIG.age); ranged('height','身高',CONFIG.height); ranged('weight','体重',CONFIG.weight);
  if (!['male','female'].includes(input.sex)) errors.push('请选择用于代谢公式计算的生理性别');
  if (!CONFIG.activity[input.activity]) errors.push('请选择日常活动水平');
  if (!['lose','maintain','gain'].includes(input.goal)) errors.push('请选择当前目标');
  if (input.bodyFat !== '' && input.bodyFat != null) ranged('bodyFat','体脂率',CONFIG.bodyFat[input.sex] || [3,70]);
  [['steps','每日步数',0,100000],['strength','力量训练次数',0,14],['cardio','有氧训练次数',0,14],['duration','训练时长',0,600]].forEach(([k,l,a,b])=>{ if(input[k]!==''&&input[k]!=null){const v=n(input[k]);if(!Number.isFinite(v)||v<a||v>b)errors.push(`${l}输入可能有误，请填写${a}至${b}`)}});
  if (input.targetWeight !== '' && input.targetWeight != null) ranged('targetWeight','目标体重',CONFIG.weight);
  return errors;
}

export function calculateBmr(input) {
  const weight=n(input.weight), bodyFat=n(input.bodyFat);
  if (Number.isFinite(bodyFat)) { const lbm=weight*(1-bodyFat/100); return { value:370+21.6*lbm, formula:'Katch–McArdle（依据去脂体重）', lbm }; }
  const value=10*weight+6.25*n(input.height)-5*n(input.age)+(input.sex==='male'?5:-161);
  return { value, formula:'Mifflin–St Jeor（依据身高、体重和年龄）', lbm:null };
}

function referenceWeight(input, lbm) {
  const bmi=n(input.weight)/((n(input.height)/100)**2);
  if (lbm) return { value:lbm, label:'去脂体重' };
  if (bmi>30 && Number.isFinite(n(input.targetWeight))) return { value:n(input.targetWeight), label:'目标体重' };
  if (bmi>30) { const cap=30*((n(input.height)/100)**2); return { value:cap, label:'受限参考体重（BMI 30对应体重，仅用于避免蛋白质过高）' }; }
  return { value:n(input.weight), label:'实际体重' };
}

function proteinRule(input) {
  const exercises=n(input.strength)>0||n(input.cardio)>0||input.activity!=='sedentary';
  if (input.goal==='lose'&&exercises) return { min:1.8,max:2.2,def:2.0,label:'减脂并有运动' };
  if (input.goal==='gain'&&n(input.strength)>0) return { min:1.6,max:2.0,def:1.8,label:'增肌并有力量训练' };
  if (input.goal==='maintain'&&exercises) return { min:1.6,max:2.0,def:1.7,label:'有规律活动并维持' };
  return { min:1.2,max:1.4,def:1.3,label:'久坐或无规律运动' };
}

export function calculateNutrition(input) {
  const errors=validateInput(input); if(errors.length) return { ok:false,errors };
  const bmr=calculateBmr(input), factor=CONFIG.activity[input.activity].factor, tdee=bmr.value*factor;
  const rates=CONFIG.goalRates[input.goal], rate=rates[input.goalRate]??rates.standard, target=tdee*(1+rate);
  const ref=referenceWeight(input,bmr.lbm), rule=proteinRule(input); if(n(input.age)>=65) rule.def=Math.max(rule.def,1.2);
  const protein=ref.value*rule.def, proteinCalories=protein*4;
  const fatByWeight=ref.value*CONFIG.fat.gramsPerKg;
  const fatCalories=Math.min(target*CONFIG.fat.maxShare,Math.max(target*CONFIG.fat.minShare,fatByWeight*9,target*CONFIG.fat.preferredShare));
  const fat=fatCalories/9, carbCalories=target-proteinCalories-fatCalories, conflict=carbCalories<0;
  const carbs=Math.max(0,carbCalories)/4, bmi=n(input.weight)/((n(input.height)/100)**2);
  const warnings=[];
  if(target<bmr.value) warnings.push('⚠️ 目标热量低于基础代谢，这不是绝对安全的饮食方案；请降低减脂速度并咨询专业人士。');
  if(conflict) warnings.push('⚠️ 当前目标热量过低或营养素设置冲突。请降低蛋白质到建议下限、降低脂肪到合理下限，或提高总热量。');
  if(n(input.age)>=65) warnings.push('ℹ️ 老年人的蛋白质需要结合消化能力、慢性疾病情况和医生建议判断。');
  if(bmi<18.5||bmi>=40) warnings.push('⚠️ 当前体重指数处于需要特别谨慎的范围，请先咨询医生或注册营养师；这不是疾病诊断。');
  if(input.pregnant||input.breastfeeding||input.kidney||input.liver||input.diabetes||input.eatingDisorder||input.medicalGuidance) warnings.push('⚠️ 您填写了需要专业评估的健康情况，请遵循医生或注册营养师的个别指导。');
  const macros={protein:{grams:protein,calories:proteinCalories},fat:{grams:fat,calories:fatCalories},carbs:{grams:carbs,calories:Math.max(0,carbCalories)}};
  for(const m of Object.values(macros)) m.share=target>0?m.calories/target:0;
  return {ok:true,bmr:bmr.value,formula:bmr.formula,lbm:bmr.lbm,tdee,tdeeRange:[tdee*.9,tdee*1.1],target,rate,factor,referenceWeight:ref,proteinRule:rule,macros,bmi,conflict,warnings};
}

export function calibrateTdee({originalTdee,averageCalories,startWeight,endWeight,days}) {
  const values=[originalTdee,averageCalories,startWeight,endWeight,days].map(n);
  if(values.some(v=>!Number.isFinite(v)||v<=0)) return {ok:false,error:'记录中有空值、零值或无效数字，请检查后再试'};
  if(values[4]<CONFIG.calibration.minDays) return {ok:false,error:'至少记录7天后才能校准，推荐使用14天平均数据'};
  const measured=values[1]-CONFIG.calibration.kcalPerKg*(values[3]-values[2])/values[4];
  const difference=Math.abs(measured-values[0])/values[0];
  if(difference>CONFIG.calibration.maxDifference) return {ok:false,abnormal:true,measured,error:'估算差异超过25%，请检查体重平均值、天数和摄入记录；本次未采用'};
  return {ok:true,measured,adjusted:values[0]*(1-CONFIG.calibration.blend)+measured*CONFIG.calibration.blend,difference};
}

export function mealDistribution(result,count=3){const ratios=count===4?[.25,.3,.25,.2]:[.3,.4,.3];return ratios.map((ratio,i)=>({name:(count===4?['早餐','午餐','晚餐','加餐']:['早餐','午餐','晚餐'])[i],ratio,calories:result.target*ratio,protein:result.macros.protein.grams*ratio,fat:result.macros.fat.grams*ratio,carbs:result.macros.carbs.grams*ratio}));}
