'use client';
import {useEffect,useState} from 'react';
import {validCnpj} from '@/lib/validation';
import {apiFetch} from '@/lib/api-client';
import {lookupCompany,type Company} from '@/lib/company';
export function CompanyLookup({cnpj}:{cnpj:string}){
 const[state,setState]=useState<{loading?:boolean;company?:Company;error?:string}>({});
 useEffect(()=>{if(!validCnpj(cnpj)){setState({});return}let live=true;setState({loading:true});const t=setTimeout(()=>{apiFetch('/api/company?cnpj='+encodeURIComponent(cnpj)).then(async r=>{const d=await r.json() as Company&{error?:string};if(!r.ok)throw Error(d.error);if(live)setState({company:d})}).catch(()=>lookupCompany(cnpj).then(c=>{if(live)setState({company:c})}).catch(()=>{if(live)setState({error:'Consulta indisponível agora. Você pode continuar com seu CNPJ e telefone.'})}))},500);return()=>{live=false;clearTimeout(t)}},[cnpj]);
 if(!state.loading&&!state.company&&!state.error)return null;
 return <div className="company-lookup" role="status" aria-live="polite">{state.loading?'Consultando cadastro da empresa…':state.company?<><strong>{state.company.tradeName||state.company.legalName}</strong><span>{state.company.legalName}</span><small>{state.company.city} / {state.company.state} · {state.company.status}</small><small>Razão social, nome fantasia e nomes de sócios/administradores disponíveis acompanharão a cotação. Fonte: OpenCNPJ.</small></>:state.error}</div>;
}
