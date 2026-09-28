import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const pincode = new URL(req.url).searchParams.get("pincode")?.trim();
    if (!/^\d{6}$/.test(pincode || "")) {
      return NextResponse.json({ ok: false, error: "Enter a valid 6-digit pincode." }, { status: 400 });
    }

    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "Could not look up this pincode right now." }, { status: 502 });
    }

    const data = await response.json();
    const record = Array.isArray(data) ? data[0] : null;
    const offices = Array.isArray(record?.PostOffice) ? record.PostOffice : [];

    if (!offices.length || String(record?.Status || "").toLowerCase() !== "success") {
      return NextResponse.json({ ok: false, error: "Pincode not found. Please check the 6-digit pincode." }, { status: 404 });
    }

    const office = offices[0];
    return NextResponse.json({
      ok: true,
      pincode,
      city: office.District || office.Block || office.Division || "",
      state: office.State || "",
      postOffice: office.Name || "",
      district: office.District || "",
      division: office.Division || "",
      region: office.Region || ""
    });
  } catch (error) {
    console.error("[pincode]", error);
    return NextResponse.json({ ok: false, error: "Could not look up this pincode right now." }, { status: 502 });
  }
}
