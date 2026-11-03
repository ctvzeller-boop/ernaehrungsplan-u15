/* Offline-Cache für CZ Nutrition: Seite immer zuerst frisch aus dem Netz, sonst aus dem Cache.
   Der Trainingsplaner im Ordner training/ hat seinen eigenen Service Worker und wird hier nicht angefasst. */
const C="nutrition-v1";
const CORE=["./","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png","./icons/favicon-32.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("nutrition-")&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  const base=new URL("./",self.registration.scope).pathname;
  if(u.origin===location.origin&&u.pathname.startsWith(base+"training"))return;
  if(r.mode==="navigate"&&u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put("./",cp));return res}).catch(()=>caches.match("./")));return}
  if(u.origin===location.origin||/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(u.host)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})))}
});
