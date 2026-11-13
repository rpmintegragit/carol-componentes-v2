import {lazy,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {GET as shipping} from '../app/api/frete/route';
import '../app/globals.css';
import '../app/movement.css';
import '../app/harvest.css';

// GitHub Pages has no Worker/D1. Keep this preview adapter out of server builds.
const base=import.meta.env.BASE_URL;
const originalFetch=window.fetch.bind(window);
window.fetch=async(input,init)=>{
 const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,location.href);
 if(url.origin===location.origin&&url.pathname==='/api/frete')return shipping(new Request(url));
 return originalFetch(input,init);
};
// Code-split: o catálogo (dados + experiência) carrega como chunk separado,
// permitindo primeira pintura imediata do shell.
const Experience=lazy(()=>import('../app/experience'));
const pathname=decodeURIComponent(location.pathname.slice(base.length));
const slug=pathname.startsWith('produto/')?pathname.slice(8).replace(/\/$/,''):undefined;
const boot=<div className="boot-splash" aria-live="polite"><p>Carol Componentes</p></div>;
if(pathname.replace(/\/$/,'')==='admin'){import('../app/admin-client').then(({default:Admin})=>createRoot(document.getElementById('root')!).render(<Admin/>))}else createRoot(document.getElementById('root')!).render(<Suspense fallback={boot}><Experience initialProduct={slug}/></Suspense>);
