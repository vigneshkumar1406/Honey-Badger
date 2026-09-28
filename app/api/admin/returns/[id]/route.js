import { NextResponse } from "next/server";
import { requireAdmin, supabaseRequest } from "@/lib/supabase/rest";
export async function PATCH(req,{params}){try{const {accessToken}=await requireAdmin();const {status}=await req.json();await supabaseRequest(`/rest/v1/return_requests?id=eq.${params.id}`,{method:'PATCH',accessToken,body:{status}});return NextResponse.json({ok:true});}catch(e){return NextResponse.json({ok:false,error:e.message},{status:400});}}
