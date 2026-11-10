import { list, del } from "@vercel/blob";
import { isAdmin } from "./_auth.js";
function guessType(path,type) {
  if(type && type!=="application/octet-stream") return type;
  const ext=String(path||"").split(".").pop().toLowerCase();
  const types={jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",gif:"image/gif",mp4:"video/mp4",webm:"video/webm",mov:"video/quicktime",ogg:"video/ogg",pdf:"application/pdf",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",ppt:"application/vnd.ms-powerpoint",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation"};
  return types[ext] || type || "application/octet-stream";
}
export default async function handler(req,res) {
  if(req.method==="GET") {
    try {
      const result=await list({limit:1000});
      const files=result.blobs
        .map(({url,pathname,size,uploadedAt,contentType})=>({url,pathname,size,uploadedAt,contentType:guessType(pathname,contentType)}));
      return res.status(200).json({files});
    } catch(e) {
      console.error("Blob list error:",e);
      return res.status(500).json({error:"No se pudo consultar Vercel Blob. Revisa BLOB_READ_WRITE_TOKEN."});
    }
  }
  if(req.method==="DELETE") {
    if(!isAdmin(req)) return res.status(401).json({error:"No autorizado"});
    const url=String(req.body?.url||"");
    try {
      const parsed=new URL(url);
      if(!parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return res.status(400).json({error:"Archivo no válido"});
      const stored=await list({limit:1000});
      if(!stored.blobs.some(blob=>blob.url===url)) return res.status(404).json({error:"El archivo no existe en este almacenamiento"});
      await del(url);
      return res.status(200).json({ok:true});
    } catch(e) {
      console.error("Blob delete error:",e);
      return res.status(400).json({error:"No se pudo eliminar el archivo"});
    }
  }
  return res.status(405).json({error:"Método no permitido"});
}
