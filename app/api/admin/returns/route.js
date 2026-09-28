import { NextResponse } from "next/server";
import { requireAdmin, supabaseRequest } from "@/lib/supabase/rest";
export async function GET(){try{const {accessToken}=await requireAdmin();const rows=await supabaseRequest('/rest/v1/return_requests?select=*,orders(order_number,customer_name,customer_phone),return_images(*)&order=created_at.desc',{accessToken});return NextResponse.json({ok:true,returns:rows});}catch(e){return NextResponse.json({ok:false,error:e.message},{status:400});}}
