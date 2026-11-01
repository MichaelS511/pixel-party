(()=>{
const POINTS_KEY='pixelPartyPoints',PURCHASES_KEY='pixelPartyPurchases';
function points(){return Math.max(0,Number(localStorage.getItem(POINTS_KEY)||0)||0)}
function purchases(){try{return JSON.parse(localStorage.getItem(PURCHASES_KEY)||'{}')}catch{return {}}}
function refresh(){document.querySelectorAll('[data-wallet-points]').forEach(el=>el.textContent=points())}
function announce(){refresh();window.dispatchEvent(new Event('pixelparty:wallet'))}
window.PixelEconomy={
 points,
 owns(id){const saved=purchases();return Boolean(saved[id]||(id==='survivor_medkit'&&saved.coin_magnet))},
 award(amount){const n=Math.max(0,Math.floor(Number(amount)||0));if(!n)return points();localStorage.setItem(POINTS_KEY,String(points()+n));announce();return points()},
 progress(key,amount,threshold){const k='pixelPartyProgress_'+key,old=Math.max(0,Number(localStorage.getItem(k)||0)||0),next=old+Math.max(0,Number(amount)||0),step=Math.max(1,Number(threshold)||1),reward=Math.floor(next/step)-Math.floor(old/step);localStorage.setItem(k,String(next));if(reward>0)this.award(reward);return reward},
 buy(id,cost){if(this.owns(id))return {ok:false,reason:'owned'};const price=Math.max(0,Math.floor(Number(cost)||0));if(points()<price)return {ok:false,reason:'points'};localStorage.setItem(POINTS_KEY,String(points()-price));const next=purchases();next[id]=true;localStorage.setItem(PURCHASES_KEY,JSON.stringify(next));announce();return {ok:true,points:points()}},
 refresh
};
refresh();window.addEventListener('storage',refresh);window.addEventListener('pixelparty:wallet',refresh);
})();
