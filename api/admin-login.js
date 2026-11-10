import crypto from "node:crypto";
export default async function handler(req,res) {
  if(req.method!=="POST") return res.status(405).json({error:"Método no permitido"});
  const expected=process.env.ADMIN_PASSWORD;
  if(!expected) return res.status(500).json({error:"Falta ADMIN_PASSWORD en Vercel"});
  const supplied=String(req.body?.password||"");
  const a=Buffer.from(supplied),b=Buffer.from(expected);
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b)) return res.status(401).json({error:"Contraseña incorrecta"});
  const issued=String(Date.now());
  const sig=crypto.createHmac("sha256",expected).update(issued).digest("base64url");
  res.setHeader("Set-Cookie",`admin_session=${issued}.${sig}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);
  return res.status(200).json({ok:true});
}
