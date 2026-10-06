import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAccessToken, getAuthUser, supabaseRequest } from "@/lib/supabase/rest";

function id(){ return randomBytes(13).toString("hex"); }

export async function GET(req){
  try{
    const productId=new URL(req.url).searchParams.get("product_id");
    if(!productId) return NextResponse.json({ok:false,error:"product_id is required"},{status:400});
    const rows=await supabaseRequest("/rest/v1/product_reviews?product_id=eq."+encodeURIComponent(productId)+"&status=eq.published&select=id,rating,title,body,reviewer_name,created_at&order=created_at.desc");
    return NextResponse.json({ok:true,reviews:rows||[]});
  }catch(e){ return NextResponse.json({ok:false,error:e.message},{status:400}); }
}

export async function POST(req){
  try{
    const token=await getAccessToken();
    const user=await getAuthUser(token);
    if(!user?.id) return NextResponse.json({ok:false,error:"Please sign in to write a review."},{status:401});
    const b=await req.json();
    const productId=String(b.productId||"");
    const rating=Number(b.rating);
    const title=String(b.title||"").trim().slice(0,120);
    const body=String(b.body||"").trim().slice(0,2000);
    if(!productId || !Number.isInteger(rating) || rating<1 || rating>5 || !body) return NextResponse.json({ok:false,error:"Product, rating and review text are required."},{status:400});
    const existing=await supabaseRequest("/rest/v1/product_reviews?product_id=eq."+encodeURIComponent(productId)+"&user_id=eq."+encodeURIComponent(user.id)+"&select=id&limit=1",{accessToken:token});
    if(existing?.length) return NextResponse.json({ok:false,error:"You have already reviewed this product."},{status:409});
    const profiles=await supabaseRequest("/rest/v1/profiles?id=eq."+encodeURIComponent(user.id)+"&select=full_name,email&limit=1",{accessToken:token});
    const reviewerName=profiles?.[0]?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "Verified customer";
    const [review]=await supabaseRequest("/rest/v1/product_reviews",{method:"POST",accessToken:token,headers:{Prefer:"return=representation"},body:{id:id(),product_id:productId,user_id:user.id,rating,title:title||null,body,reviewer_name:reviewerName,status:"published"}});
    return NextResponse.json({ok:true,review});
  }catch(e){ return NextResponse.json({ok:false,error:e.message},{status:e.status===409?409:400}); }
}