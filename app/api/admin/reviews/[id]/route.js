import { NextResponse } from "next/server";
import { requireAdmin, supabaseAdminRequest } from "@/lib/supabase/rest";

export async function PATCH(req,{params}){
  try{
    await requireAdmin();
    const body=await req.json();
    const status=String(body.status||"");
    if(!["published","pending","hidden"].includes(status)) return NextResponse.json({ok:false,error:"Invalid review status."},{status:400});
    const rows=await supabaseAdminRequest(`/rest/v1/product_reviews?id=eq.${encodeURIComponent(params.id)}`,{method:"PATCH",headers:{Prefer:"return=representation"},body:{status}});
    return NextResponse.json({ok:true,review:rows?.[0]||null});
  }catch(e){return NextResponse.json({ok:false,error:e.message},{status:e.code==="AUTH_REQUIRED"?401:400});}
}