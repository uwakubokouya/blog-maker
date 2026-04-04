"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// .env.local に入れた GEMINI_API_KEY を明示的に読み込む設定
const googleCustom = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const KeywordSchema = z.object({
  keywords: z.array(
    z.object({
      keyword: z.string().describe("SEO対策・応募向けに提案する検索キーワード"),
      search_intent: z.enum(["不安解消", "比較検討", "応募直前", "情報収集"]).describe("このキーワードで検索する人の意図"),
      mock_volume: z.number().describe("推測される月間検索ボリューム（おおよその傾向値でOK）"),
      priority_score: z.enum(["SS", "S", "A", "B"]).describe("店舗の求人応募に近い（確度が高い）ほど高いスコアをつける"),
    })
  )
});

export async function generateAndSaveKeywords(seed: string, area: string) {
  if (!seed || !area) {
    throw new Error("種キーワードとエリアは必須です");
  }

  // 1. Gemini にキーワード拡張と分析を依頼
  const prompt = `あなたは「${area}」の「${seed}」専門の凄腕求人マーケターです。
女性従業員を募集するための店舗ブログ用の対策キーワードを10個提案してください。
応募につながりやすい（面接や体験入店に直結する）意図を持つキーワードを中心に選定し、それぞれの検索意図、推測されるボリューム、優先度スコア（SSが最高）をJSONで返してください。`;

  try {
    const { object } = await generateObject({
      model: googleCustom("gemini-2.5-pro"),
      schema: KeywordSchema,
      prompt: prompt,
    });

    const supabase = await createClient();

    // 2. 取得したキーワードをデータベースに保存
    const recordsToInsert = object.keywords.map((kw) => ({
      seed: seed,
      area: area,
      keyword: kw.keyword,
      search_intent: kw.search_intent,
      mock_volume: kw.mock_volume,
      priority_score: kw.priority_score,
    }));

    const { error } = await supabase
      .from("blogmaker_keywords")
      .insert(recordsToInsert);

    if (error) {
      console.error("DB保存エラー:", error);
      throw new Error("キーワードの保存に失敗しました");
    }

    return { success: true, count: recordsToInsert.length };
  } catch (error) {
    console.error("AI生成エラー:", error);
    throw new Error("キーワードの生成に失敗しました");
  }
}
