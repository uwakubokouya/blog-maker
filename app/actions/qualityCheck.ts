"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const googleCustom = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const QualityCheckSchema = z.object({
  score: z.number().describe("記事全体の評価スコア（0〜100点）"),
  abstract_words: z.object({
    title: z.literal("抽象語の多用チェック"),
    status: z.enum(["success", "warning", "error"]),
    message: z.string().describe("「稼げる」「アットホーム」などが根拠なしに使われていないかの判定結果"),
  }),
  transparency: z.object({
    title: z.literal("透明性（罰金等への言及）チェック"),
    status: z.enum(["success", "warning", "error"]),
    message: z.string().describe("罰金やノルマなど女の子の不安を払拭する記載があるかの判定結果"),
  }),
  cta: z.object({
    title: z.literal("導線の配置チェック"),
    status: z.enum(["success", "warning", "error"]),
    message: z.string().describe("LINEへの誘導が適切かどうかの判定結果"),
  }),
  tone: z.object({
    title: z.literal("トーン＆マナーのチェック"),
    status: z.enum(["success", "warning", "error"]),
    message: z.string().describe("タメ口ではなく丁寧な敬語で安心感があるかの判定結果"),
  }),
  images: z.object({
    title: z.literal("画像の推奨（ビジュアル提案）"),
    status: z.enum(["success", "warning", "error"]),
    message: z.string().describe("フリー素材ではなく本文の箇所に合った店舗のリアルな写真（スタッフや待機室など）の撮影・掲載指示"),
  }),
});

export async function checkArticleQuality(title: string, content: string) {
  if (!content) {
    throw new Error("本文がないため診断できません");
  }

  const prompt = `あなたは夜職（キャバクラ等）の求人ブログを添削する凄腕コンサルタントです。
以下の「ブログ記事（タイトル・本文）」を審査し、応募率（CVR）の観点から100点満点で採点し、5つの固定されたアドバイス枠にそれぞれ回答を返してください。

■ 審査対象の記事
タイトル: ${title}
本文:
${content}
`;

  try {
    const { object } = await generateObject({
      model: googleCustom("gemini-2.5-pro"),
      schema: QualityCheckSchema,
      prompt: prompt,
    });

    // フロントエンド用（配列）に変換して返す
    return {
      score: object.score,
      checks: [
        object.abstract_words,
        object.transparency,
        object.cta,
        object.tone,
        object.images
      ]
    };
  } catch (error) {
    console.error("品質チェックエラー:", error);
    throw new Error("品質診断に失敗しました");
  }
}
