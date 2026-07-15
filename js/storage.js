const KEY='nutrition-calculator-v1';
export function loadData(storage=localStorage){try{return JSON.parse(storage.getItem(KEY)||'null')}catch{return null}}
export function saveData(data,storage=localStorage){try{storage.setItem(KEY,JSON.stringify(data));return true}catch{return false}}
export function clearData(storage=localStorage){try{storage.removeItem(KEY);return true}catch{return false}}
export { KEY };
