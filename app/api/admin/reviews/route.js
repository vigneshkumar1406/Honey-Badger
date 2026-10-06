import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdminRequest } from "@/lib/supabase/rest";

export async function GET(req){
  try{
    await requireAdmin();
    const status=new URL(req.url).searchParams.get("status");
    let path="/rest/v1/product_reviews?select=*&order=created_at.desc";
    if(status && ["published","pending","hidden"].includes(status)) path+=`&status=eq.${status}`;
    const rows=await supabaseAdminRequest(path);
    const productIds=[...new Set((rows||[]).map(r=>r.product_id).filter(Boolean))];
    let products=[];
    if(productIds.length) products=await supabaseAdminRequest("/rest/v1/products?id=in.("+productIds.map(encodeURIComponent).join(",")+")&select=id,name,slug");
    const map=Object.fromEntries((products||[]).map(p=>[p.id,p]));
    return NextResponse.json({ok:true,reviews:(rows||[]).map(r=>({...r,product:map[r.product_id]||null}))});
  }catch(e){return NextResponse.json({ok:false,error:e.message},{status:e.code==="AUTH_REQUIRED"?401:400});}
}