import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/server/catalog";
export async function GET(){return NextResponse.json({ok:true,products:await getAllProducts()});}
