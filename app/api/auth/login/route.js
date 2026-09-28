import { NextResponse } from "next/server";
import { authTokenRequest, authCookieOptions } from "@/lib/supabase/rest";
export async function POST(req){
 try{const {email,password}=await req.json(); if(!email||!password) throw new Error("Email and password are required."); const data=await authTokenRequest("password",{email,password}); const res=NextResponse.json({ok:true}); res.cookies.set("hb_access_token",data.access_token,authCookieOptions(data.expires_in||3600)); res.cookies.set("hb_refresh_token",data.refresh_token,authCookieOptions(60*60*24*30)); return res;}catch(e){return NextResponse.json({ok:false,error:e.message||"Login failed."},{status:400});}}
