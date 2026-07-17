const KEY='nutrition-calculator-v1';

// Safari 的隐私模式或部分内置浏览器可能在访问 localStorage 属性时直接抛错。
// 必须把属性读取也放进 try/catch，且保持原 KEY 不变，避免丢失已保存数据。
function getStorage(storage){return storage || window.localStorage}
export function loadData(storage){try{const target=getStorage(storage);return JSON.parse(target.getItem(KEY)||'null')}catch(error){return null}}
export function saveData(data,storage){try{getStorage(storage).setItem(KEY,JSON.stringify(data));return true}catch(error){return false}}
export function clearData(storage){try{getStorage(storage).removeItem(KEY);return true}catch(error){return false}}
export { KEY };
