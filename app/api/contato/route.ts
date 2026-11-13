import {getDb} from '@/db';
import {leads} from '@/db/schema';
import {eq,and,gt,sql} from 'drizzle-orm';
import {validCnpj,normalizedPhone} from '@/lib/validation';
import {products,shortName} from '@/lib/catalog';
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origem inválida.'},{status:403});
 try{
  const input=await request.json() as {id:string;cnpj:string;phone:string;name?:string;message?:string;source?:string;website?:string;items?:{id:number;variant:string;qty:number}[]};const phone=normalizedPhone(String(input.phone||''));
  if(!validCnpj(String(input.cnpj||''))||!phone)return Response.json({error:'Confira o CNPJ e o telefone com DDD.'},{status:400});
  if(input.website||!/^[-a-f0-9]{36}$/i.test(input.id||''))return Response.json({error:'Solicitação inválida.'},{status:400});
  const cnpj=String(input.cnpj).replace(/[^a-z0-9]/ig,'').toUpperCase();
  const name=String(input.name||'').slice(0,100),message=String(input.message||'').slice(0,2000),source=String(input.source||'Contato geral').slice(0,350);
  const items=(Array.isArray(input.items)?input.items:[]).slice(0,100).flatMap((item:{id:number;variant:string;qty:number})=>{const p=products.find(p=>p.id===item.id);if(!p)return[];const variant=String(item.variant||'');if(p.variations.length&&!p.variations.some(v=>v.label===variant))return[];return[{id:p.id,name:shortName(p),variant,qty:Math.max(1,Math.min(9999,Math.floor(Number(item.qty)||1)))}]});
  const db=getDb();const previous=await db.select().from(leads).where(eq(leads.id,input.id)).get();
  if(!previous){const recent=await db.select({count:sql<number>`count(*)`}).from(leads).where(and(gt(leads.createdAt,Date.now()-60000),sql`json_extract(${leads.payload}, '$.phone') = ${phone}`)).get();if((recent?.count||0)>=5)return Response.json({error:'Aguarde um minuto antes de tentar novamente.'},{status:429});
   await db.insert(leads).values({id:input.id,payload:JSON.stringify({cnpj,phone,name,message,source,items,recipient:'ramonpmendesx@gmail.com',mode:'demo'}),createdAt:Date.now(),simulated:1});
  }
  // Sem dados do cliente (CNPJ/telefone/nome) no texto do WhatsApp: ficam so no registro interno.
  const text=['Olá! Gostaria de uma cotação com a Carol Componentes — Joinville.',`Interesse: ${source}`,...items.map((i:{name:string;variant:string;qty:number})=>`${i.qty} × ${i.name}${i.variant?' | '+i.variant:''}`),message?`Mensagem: ${message}`:''].filter(Boolean).join('\n');
  return Response.json({id:input.id,simulated:true,whatsappUrl:`https://api.whatsapp.com/send?phone=5547996180088&text=${encodeURIComponent(text)}`});
 }catch{return Response.json({error:'Não foi possível registrar seu contato. Tente novamente.'},{status:503});}
}

