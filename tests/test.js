import { calculateNutrition, calculateBmr, calibrateTdee } from '../js/calculator.js';
import { saveData, loadData } from '../js/storage.js';
const out=document.querySelector('#output');let passed=0,failed=0,lines=[];
function test(name,fn){try{fn();passed++;lines.push(`✅ ${name}`)}catch(e){failed++;lines.push(`❌ ${name}: ${e.message}`)}}
async function testAsync(name,fn){try{await fn();passed++;lines.push(`✅ ${name}`)}catch(e){failed++;lines.push(`❌ ${name}: ${e.message}`)}}
const eq=(a,b,t=.01)=>{if(Math.abs(a-b)>t)throw Error(`${a} != ${b}`)};const ok=(x,m='断言失败')=>{if(!x)throw Error(m)};
const base={age:20,sex:'male',height:170,weight:82,activity:'moderate',goal:'lose',goalRate:'standard',bodyFat:'',targetWeight:'',strength:3,cardio:0,duration:45,steps:7000};
test('20岁男性、中度活动、减脂',()=>{const r=calculateNutrition(base);ok(r.ok);eq(r.bmr,1787.5);eq(r.target,1787.5*1.5*.85)});
test('20岁女性、轻度活动、维持',()=>{const r=calculateNutrition({...base,sex:'female',height:160,weight:55,activity:'light',goal:'maintain',strength:0});ok(r.ok);eq(r.bmr,1289);eq(r.target,1740.15)});
test('70岁男性蛋白质不低于1.2g/kg',()=>{const r=calculateNutrition({...base,age:70,height:165,weight:65,activity:'light',goal:'maintain',strength:0});ok(r.macros.protein.grams>=65*1.2);ok(r.warnings.some(x=>x.includes('老年人')))});
test('体脂率切换Katch公式',()=>{const a=calculateBmr(base),b=calculateBmr({...base,bodyFat:20});ok(a.formula.includes('Mifflin'));ok(b.formula.includes('Katch'));eq(b.lbm,65.6)});
test('高BMI限制蛋白质参考体重',()=>{const r=calculateNutrition({...base,weight:160,height:165,targetWeight:''});ok(r.referenceWeight.label.includes('受限'));ok(r.referenceWeight.value<160)});
test('极低目标热量不产生负碳水',()=>{const r=calculateNutrition({...base,age:100,height:120,weight:300,bodyFat:60,activity:'sedentary',goal:'lose',goalRate:'fast'});ok(r.macros.carbs.grams>=0);if(r.conflict)ok(r.warnings.some(x=>x.includes('目标热量过低')))});
test('身高为空被拒绝',()=>ok(!calculateNutrition({...base,height:''}).ok));
test('体重为0被拒绝',()=>ok(!calculateNutrition({...base,weight:0}).ok));
test('年龄超范围被拒绝',()=>ok(!calculateNutrition({...base,age:101}).ok));
test('体脂率超范围被拒绝',()=>ok(!calculateNutrition({...base,bodyFat:90}).ok));
test('localStorage写入失败被安全处理',()=>{const bad={setItem(){throw Error('denied')},getItem(){throw Error('denied')}};ok(saveData({x:1},bad)===false);ok(loadData(bad)===null)});
test('动态校准：减重提高实测消耗',()=>{const r=calibrateTdee({originalTdee:2000,averageCalories:1800,startWeight:70,endWeight:69.8,days:14});ok(r.ok);ok(r.measured>1800)});
test('动态校准：增重降低实测消耗',()=>{const r=calibrateTdee({originalTdee:2000,averageCalories:2200,startWeight:70,endWeight:70.2,days:14});ok(r.ok);ok(r.measured<2200)});
test('不足7天不允许校准',()=>ok(!calibrateTdee({originalTdee:2000,averageCalories:1800,startWeight:70,endWeight:69.8,days:6}).ok));
test('差异超过25%不采用',()=>{const r=calibrateTdee({originalTdee:2000,averageCalories:1000,startWeight:70,endWeight:65,days:7});ok(!r.ok&&r.abnormal)});
test('宏量热量总和等于目标热量',()=>{const r=calculateNutrition(base),sum=Object.values(r.macros).reduce((s,m)=>s+m.calories,0);eq(sum,r.target,.01)});
test('碳水克数计算结果保持不变',()=>{const r=calculateNutrition(base);eq(r.macros.carbs.grams,258.165625,.000001)});

function waitForApp(frame){return new Promise(function(resolve,reject){const deadline=Date.now()+10000;(function check(){try{if(frame.contentWindow&&frame.contentWindow.__nutritionAppReady){resolve(frame.contentDocument);return}}catch(error){}if(Date.now()>deadline){reject(Error('等待页面加载超时'));return}window.setTimeout(check,50)})()})}
function setField(doc,name,value){const nodes=doc.querySelectorAll(`[name="${name}"]`);ok(nodes.length,`找不到输入项 ${name}`);if(nodes[0].type==='radio'){nodes.forEach(function(node){node.checked=node.value===String(value)})}else{nodes[0].value=value}}
async function runPageTest(){
  const frame=document.querySelector('#appFrame'),doc=await waitForApp(frame),appWindow=frame.contentWindow,form=doc.querySelector('#calculator'),storageKey='nutrition-calculator-v1';
  let saved=null,hadSaved=false;
  try{saved=appWindow.localStorage.getItem(storageKey);hadSaved=saved!==null}catch(error){}
  try{
    Object.keys(base).forEach(function(name){setField(doc,name,base[name])});
    form.dispatchEvent(new appWindow.Event('submit',{bubbles:true,cancelable:true}));
    const result=doc.querySelector('#result'),carbCard=doc.querySelector('#carbReference'),details=doc.querySelector('#carbDetails');
    ok(result&&!result.hidden,'结果区域没有显示');
    ok(carbCard&&carbCard.textContent.includes('碳水参考量'),'未显示“碳水参考量”');
    ok(carbCard.textContent.includes('258克'),'页面碳水克数与算法结果不一致');
    ok(doc.querySelector('#carbPerKg').textContent==='约3.1克/公斤体重','每公斤体重显示不正确');
    ok(doc.querySelector('#carbReferenceNote').textContent==='该碳水量是根据目标总热量，在扣除蛋白质和脂肪后推算出的剩余量，并不是保留肌肉必须达到的最低摄入量。','碳水简短说明不完整');
    ok(result.textContent.includes('所有结果均为初始估算值，不要求每天精确达到。请根据实际体重趋势和身体状态进行调整。'),'缺少初始估算提示');
    ok(details&&!details.open,'碳水说明应默认折叠');
    details.querySelector('summary').click();
    ok(details.open,'碳水说明无法展开');
    ok(doc.querySelector('#carbExplanation').textContent==='碳水主要为日常活动和训练提供能量。适合的摄入量会受到总热量、训练量、运动强度和个人体重变化影响。减脂期间保留肌肉还需要规律力量训练、充足蛋白质、适度热量缺口和良好恢复。建议结合连续两周的平均体重、腰围和训练表现判断当前摄入是否合适。','碳水说明内容不完整');
    ['每日建议碳水','必须吃到','保肌最低量','最低碳水','碳水最低标准'].forEach(function(word){ok(!result.textContent.includes(word),`出现误导性表达：${word}`)});
  }finally{
    try{if(hadSaved)appWindow.localStorage.setItem(storageKey,saved);else appWindow.localStorage.removeItem(storageKey)}catch(error){}
  }
}
function finish(){out.textContent=lines.join('\n')+`\n\n结果：${passed} 通过，${failed} 失败`;document.documentElement.dataset.failed=String(failed);document.title=failed?`FAIL ${failed}`:`PASS ${passed}`}
testAsync('页面显示碳水参考量、每公斤值和完整说明',runPageTest).then(finish);
