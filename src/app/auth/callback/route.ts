import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedNext = requestUrl.searchParams.get("next") ?? "/inicio";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/inicio";
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
