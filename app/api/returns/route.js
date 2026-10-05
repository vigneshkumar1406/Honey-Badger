import { NextResponse } from "next/server";
import { getAccessToken, requireUser, supabaseRequest, SUPABASE_URL, SUPABASE_KEY } from "@/lib/supabase/rest";

export async function GET(req){
  try{
    const token=await getAccessToken();
    const user=await requireUser();
    const url=new URL(req.url);
    const orderNumber=url.searchParams.get("order")||"";
    const itemId=url.searchParams.get("item")||"";
    if(!orderNumber||!itemId) throw new Error("Choose a product from a delivered order.");
    const orders=await supabaseRequest(`/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}&user_id=eq.${encodeURIComponent(user.id)}&order_status=eq.delivered&select=id,order_number,order_status&limit=1`,{accessToken:token});
    if(!orders?.[0]) throw new Error("This delivered order is not available in your account.");
    const items=await supabaseRequest(`/rest/v1/order_items?id=eq.${encodeURIComponent(itemId)}&order_id=eq.${encodeURIComponent(orders[0].id)}&select=id,product_name,variant_label,quantity,line_total&limit=1`,{accessToken:token});
    if(!items?.[0]) throw new Error("That product is not part of the selected order.");
    return NextResponse.json({ok:true,item:items[0]});
  }catch(e){return NextResponse.json({ok:false,error:e.message||"Could not load return options."},{status:400});}
}

export async function POST(req){
 try{
  const token=await getAccessToken();
  const user=await requireUser();
  const form=await req.formData();
  const orderNumber=String(form.get("orderNumber")||"").trim();
  const itemId=String(form.get("itemId")||"").trim();
  const reason="damaged";
  const description=String(form.get("description")||"").trim();
  if(!orderNumber||!itemId) throw new Error("Choose a product from your delivered order.");
  if(description.length<10) throw new Error("Please describe the damage.");
  const orders=await supabaseRequest(`/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}&user_id=eq.${encodeURIComponent(user.id)}&select=id,order_status&limit=1`,{accessToken:token});
  if(!orders?.[0]) throw new Error("Order not found in your account.");
  if(orders[0].order_status!=="delivered") throw new Error("A damage request can be submitted after delivery.");
  const items=await supabaseRequest(`/rest/v1/order_items?id=eq.${encodeURIComponent(itemId)}&order_id=eq.${encodeURIComponent(orders[0].id)}&select=id&limit=1`,{accessToken:token});
  if(!items?.[0]) throw new Error("Selected product does not belong to this order.");
  const delivered=await supabaseRequest(`/rest/v1/order_status_history?order_id=eq.${encodeURIComponent(orders[0].id)}&status=eq.delivered&select=created_at&order=created_at.desc&limit=1`,{accessToken:token});
  if(!delivered?.[0]?.created_at) throw new Error("We could not confirm the delivery time for this order. Please contact support.");
  const deliveredAt=new Date(delivered[0].created_at).getTime();
  if(Date.now()-deliveredAt>48*60*60*1000) throw new Error("We’re sorry, damage requests must be submitted within 48 hours of delivery. Please contact support if you need assistance.");
  const [ret]=await supabaseRequest("/rest/v1/return_requests",{method:"POST",accessToken:token,headers:{Prefer:"return=representation"},body:{order_id:orders[0].id,order_item_id:itemId,user_id:user.id,reason,description,status:"REQUESTED"}});
  const files=form.getAll("images").filter(f=>f&&typeof f.arrayBuffer==="function");
  for(const file of files.slice(0,5)){
    if(file.size>8*1024*1024)continue;
    const ext=(file.name.split(".").pop()||"jpg").replace(/[^a-z0-9]/gi,"");
    const path=`${user.id}/${ret.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const upload=await fetch(`${SUPABASE_URL}/storage/v1/object/return-evidence/${path}`,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,"Content-Type":file.type||"application/octet-stream"},body:await file.arrayBuffer()});
    if(upload.ok) await supabaseRequest("/rest/v1/return_images",{method:"POST",accessToken:token,body:{return_id:ret.id,url:path}});
  }
  return NextResponse.json({ok:true,id:ret.id});
 }catch(e){return NextResponse.json({ok:false,error:e.message||"Could not submit your request."},{status:400});}
}
