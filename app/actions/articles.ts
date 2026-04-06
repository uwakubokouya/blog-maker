"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const googleCustom = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const ArticleDraftSchema = z.object({
  seo_title: z.string().describe("検索エンジン向けのタイトル。32文字程度。対策キーワードを自然に含める。"),
  ctr_title: z.string().describe("女性の応募率を高めるSNSやトップページ向けの煽り・魅力的なタイトル。"),
  content_draft: z.string().describe("ブログの本文全体のドラフト（800〜1500文字程度）。「##」などのマークダウン記号は絶対に使用せず、改行と絵文字で読みやすく構成すること。"),
  line_default_text: z.string().describe("この記事の読者にLINEへ促す際に設定すべき、LINE自動入力テキストのオススメ案（例：【記事タイトルを見た】面接のご相談です）")
});

export async function generateArticleDraft(keyword: string, primaryInfo: string) {
  if (!keyword) {
    throw new Error("対策キーワードが指定されていません");
  }

  const prompt = `あなたは「夜職（キャバクラ・コンカフェ・ソープなど）」の女性求人を圧倒的に成功させる凄腕の求人コピーライターです。
以下の情報を元に、女性が「このお店なら安心できそう」「応募してみよう」と思えるブログ記事の本文を作成してください。

■ SEO対策ターゲットキーワード
「${keyword}」

■ 店長から提供された店舗のリアルなエピソード・強み（一次情報）
${primaryInfo}

ルール（※必ず守ること）:
1. 検索意図を満たし、一次情報の内容を読者（求職者）が共感するストーリーに変換すること。
2. 対象となる求職者は「女の子」とは呼ばず、必ず「女性」と表記すること。
3. トーン＆マナー：女性が安心できるよう、「優しくて可愛らしい口調」かつ**必ず「丁寧語・敬語（です・ます調）」**で記述すること。語尾が「〜だよ」「〜なの」といった「タメ口」になるのは絶対にNG。
4. 以下の例文のように、「✨🌈🎀🏠🫧🌸💎」などの絵文字を使い、親しみやすさを出すこと。（※ただし「🥺」「💖」「💕」の絵文字は絶対に使用しないこと）
   【良い文体（敬語＋可愛い）の例】
   「✨🌈時間や日数の強制なし🌈✨
   出勤ペースはぜんぶあなた次第ですよ✨
   無理せず自分の気分や予定を優先してOKです🎀
   プライベートも大切にしながら
   のびのび楽しくお仕事できますよね🫧🌸」
5. 本文中に「##」や「H3」などのマークダウン記号・見出し記号は**一切含めない**こと。文章の区切りは改行と絵文字で表現すること。
6. 単なる高収入アピールなどの堅苦しい言葉は避け、とにかく「安心感」「透明性」「ゆるふわ感」を重視しつつ、お店のスタッフからのメッセージとして誠実（敬語）に書くこと。
`;

  try {
    const { object } = await generateObject({
      model: googleCustom("gemini-2.5-pro"),
      schema: ArticleDraftSchema,
      prompt: prompt,
    });

    return object;
  } catch (error) {
    console.error("記事ドラフト生成エラー:", error);
    throw new Error("記事ドラフトの生成に失敗しました");
  }
}

export async function saveArticle(data: { title: string, content: string, line_default_text: string, keyword?: string }) {
  const supabase = await createClient();
  
  const { data: insertedData, error } = await supabase
    .from("blogmaker_articles")
    .insert([{
      title: data.title,
      content: data.content,
      line_default_text: data.line_default_text
    }])
    .select("id")
    .single();

  if (error) {
    console.error("DB保存エラー:", error);
    throw new Error("記事の保存に失敗しました");
  }

  // もしキーワードが渡されていれば、キーワード一覧でのステータスを「作成済」にする
  if (data.keyword) {
    const { error: kwError } = await supabase
      .from("blogmaker_keywords")
      .update({ status: "created" })
      .eq("keyword", data.keyword);
      
    if (kwError) console.error("キーワードステータス更新エラー:", kwError);
  }

  return { success: true, id: insertedData.id };
}
