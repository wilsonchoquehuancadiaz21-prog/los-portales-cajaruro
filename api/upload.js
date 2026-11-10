import { handleUpload } from "@vercel/blob/client";
import { isAdmin } from "./_auth.js";
const allowed=["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"];
export default async function handler(req,res) {
  if(req.method!=="POST") return res.status(405).json({error:"Método no permitido"});
  if(!isAdmin(req)) return res.status(401).json({error:"Inicia sesión como administrador"});
  try {
    const result=await handleUpload({body:req.body,request:req,onBeforeGenerateToken:async(pathname)=>{
      const name=String(pathname||"archivo").split("/").pop().replace(/[^a-zA-Z0-9._-]/g,"-").slice(-100)||"archivo";
      return {pathname:`uploads/${Date.now()}-${name}`,allowedContentTypes:allowed,addRandomSuffix:true};
    },onUploadCompleted:async({blob})=>{console.log("Archivo cargado",blob.pathname)}});
    return res.status(200).json(result);
  } catch(e) { return res.status(400).json({error:e instanceof Error?e.message:"No se pudo preparar la subida"}); }
}
