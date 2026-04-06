import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // `params.id` represents the article ID we want to track
  const resolvedParams = await params;
  const articleId = resolvedParams.id;
  
  if (!articleId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createClient();

  // 1. Fetch the default LINE text for this article
  const { data: article } = await supabase
    .from("blogmaker_articles")
    .select("line_default_text")
    .eq("id", articleId)
    .single();

  // If article not found, redirect to home or a default LINE
  if (!article) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Record the click (Server-side tracking!)
  const userAgent = request.headers.get("user-agent") || "unknown";
  await supabase
    .from("blogmaker_article_clicks")
    .insert([{ article_id: articleId, user_agent: userAgent }]);

  // 3. Construct the official LINE URL with the auto-fill text
  const lineText = article.line_default_text || "ブログからのお問い合わせです。";
  const encodeText = encodeURIComponent(lineText);
  // Official LINE URL scheme for targeting a specific Official Account
  const lineUrl = `https://line.me/R/oaMessage/@238dianm/?${encodeText}`;

  // 4. Hard redirect user to LINE
  return NextResponse.redirect(lineUrl);
}
