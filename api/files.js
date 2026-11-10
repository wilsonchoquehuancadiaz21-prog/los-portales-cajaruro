import { list, del } from "@vercel/blob";
import { isAdmin } from "./_auth.js";
export default async function handler(req,res) {
  if(req.method==="GET") {
    try {
      const result=await list({prefix:"uploads/",limit:1000});
      return res.status(200).json({files:result.blobs.map(({url,pathname,size,uploadedAt,contentType})=>({url,pathname,size,uploadedAt,contentType}))});
    } catch(e) { console.error(e); return res.status(500).json({error:"No se pudo consultar Vercel Blob. Revisa BLOB_READ_WRITE_TOKEN."}); }
  }
  if(req.method==="DELETE") {
    if(!isAdmin(req)) return res.status(401).json({error:"No autorizado"});
    const url=String(req.body?.url||"");
    try {
      const parsed=new URL(url);
      if(!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return res.status(400).json({error:"Archivo no válido"});
      const path=decodeURIComponent(parsed.pathname).replace(/^\\//,"");
      if(!path.startsWith("uploads/")) return res.status(400).json({error:"Ruta no permitida"});
      await del(url);
      return res.status(200).json({ok:true});
    } catch(e) { console.error(e); return res.status(400).json({error:"No se pudo eliminar el archivo"}); }
  }
  return res.status(405).json({error:"Método no permitido"});
}
