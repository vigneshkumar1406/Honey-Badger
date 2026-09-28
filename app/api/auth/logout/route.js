import { NextResponse } from "next/server";
import { getAccessToken, supabaseRequest } from "@/lib/supabase/rest";
export async function POST(){
 const token=await getAccessToken();
 if(token){try{await supabaseRequest("/auth/v1/logout",{method:"POST",accessToken:token});}catch{}}
 const res=NextResponse.json({ok:true}); res.cookies.set("hb_access_token","",{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0}); res.cookies.set("hb_refresh_token","",{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0}); return res;
}
