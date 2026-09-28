import { NextResponse } from "next/server";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export async function middleware(request){
  let response=NextResponse.next();
  const access=request.cookies.get('hb_access_token')?.value;
  const refresh=request.cookies.get('hb_refresh_token')?.value;
  if(url&&key&&refresh){
    try{
      const check=await fetch(`${url}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${access||''}`}});
      if(!check.ok){
        const rr=await fetch(`${url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})});
        if(rr.ok){const data=await rr.json(); response.cookies.set('hb_access_token',data.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:data.expires_in||3600}); response.cookies.set('hb_refresh_token',data.refresh_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30});}
      }
    }catch{}
  }
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']};
