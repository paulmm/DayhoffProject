import { NextResponse } from "next/server";
import { MODULE_CATALOG } from "@/data/modules-catalog";

export async function GET() {
  return NextResponse.json(MODULE_CATALOG);
}
