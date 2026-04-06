"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import QualityCheckList, { QualityResult } from "@/components/QualityCheckList";
import { generateArticleDraft, saveArticle } from "@/app/actions/articles";
import { checkArticleQuality } from "@/app/actions/qualityCheck";

function ArticleCreateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialKeyword = searchParams?.get("keyword") || "";
  
  const [keyword, setKeyword] = useState(initialKeyword);
  const [primaryInfo, setPrimaryInfo] = useState("");
  
  // AI生成結果のState
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [ctrTitle, setCtrTitle] = useState("");
  const [content, setContent] = useState("");
  const [lineText, setLineText] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [savedArticleId, setSavedArticleId] = useState<string | null>(null);
  
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);

  useEffect(() => {
    if (searchParams?.get("keyword")) {
      setKeyword(searchParams.get("keyword")!);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!keyword) {
      alert("対策キーワードを入力してください");
      return;
    }
    if (!primaryInfo) {
      if (!confirm("一次情報（エピソードなど）が未入力の場合、どこにでもある薄い記事になります。本当に生成しますか？")) {
        return;
      }
    }

    setIsGenerating(true);
    try {
      const result = await generateArticleDraft(keyword, primaryInfo);
      setSeoTitle(result.seo_title);
      setCtrTitle(result.ctr_title);
      setContent(result.content_draft);
      setLineText(result.line_default_text);

      // 生成直後に自動で品質チェックと画像診断を実行
      setIsCheckingQuality(true);
      try {
        const quality = await checkArticleQuality(result.seo_title, result.content_draft);
        //@ts-ignore
        setQualityResult(quality);
      } catch (err) {
        console.error("Auto quality check failed", err);
      } finally {
        setIsCheckingQuality(false);
      }

    } catch (error) {
      alert("記事生成に失敗しました: " + error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!seoTitle || !content) {
      alert("保存するタイトルと本文がありません。先に生成を行ってください。");
      return;
    }

    setIsSaving(true);
    try {
      // SEOタイトルを本タイトルとして保存（または選択させる）
      // MVPとしてseo_titleを利用
      const result = await saveArticle({
        title: seoTitle,
        content: content,
        line_default_text: lineText
      });
      setSavedArticleId(result.id);
    } catch (error) {
      alert("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQualityCheck = async () => {
    if (!content) {
      alert("評価する本文がありません。先に構成と本文の生成を行ってください。");
      return;
    }
    setIsCheckingQuality(true);
    try {
      const result = await checkArticleQuality(seoTitle || keyword, content);
      // @ts-ignore
      setQualityResult(result);
    } catch (error) {
      alert("品質チェックに失敗しました: " + error);
    } finally {
      setIsCheckingQuality(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <Link href="/articles" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'inline-block' }}>← 記事一覧に戻る</Link>
          <h1 className="page-title">新規記事作成: {keyword || "キーワード未設定"}</h1>
        </div>
        <div className="flex-gap-4">
          <button className="btn btn-outline" disabled={isSaving}>下書き保存</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || isGenerating}>
            {isSaving ? "保存中..." : "公開・保存する"}
          </button>
        </div>
      </header>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '32px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 一次情報入力 */}
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>1. 一次情報のヒアリング</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>対策キーワード: <strong>{keyword}</strong></p>
              
              <div className="form-group">
                <label className="form-label">Q. このキーワードに関して、求職者に刺さる自店だけの強みやエピソード（一次情報）を入力してください。</label>
                <textarea 
                  className="input" 
                  rows={4} 
                  value={primaryInfo}
                  onChange={(e) => setPrimaryInfo(e.target.value)}
                  placeholder={`例：前のお店では遅刻で時給を下げられていた子が、当店では事前に連絡さえくれればペナルティなしだと知ってすごく安心してくれた件について書いてほしい。`}
                ></textarea>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{ backgroundColor: isGenerating ? 'var(--text-muted)' : 'var(--brand-primary)' }}
              >
                {isGenerating ? "🌀 AIが構成と本文を執筆中... (10〜20秒)" : "✨ この情報をベースに構成と本文を一括生成"}
              </button>
            </div>

            {/* タイトル選定 */}
            <div className="card" style={{ opacity: isGenerating ? 0.5 : 1 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>2. AI提案のタイトル</h2>
              <div className="grid-2">
                <div>
                  <h3 className="form-label" style={{ color: 'var(--brand-primary)' }}>応募率・CTR重視のタイトル案</h3>
                  <textarea className="input" rows={2} value={ctrTitle} onChange={(e) => setCtrTitle(e.target.value)}></textarea>
                </div>
                <div>
                  <h3 className="form-label">SEO・検索順位重視のタイトル案</h3>
                  <textarea className="input" rows={2} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}></textarea>
                </div>
              </div>
            </div>

            {/* 記事構成と本文 */}
            <div className="card" style={{ opacity: isGenerating ? 0.5 : 1 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>3. 本文エディタ (マークダウン形式)</h2>
              <textarea 
                className="input" 
                rows={15} 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ fontFamily: 'monospace' }}
              ></textarea>

              {/* 導線挿入 */}
              <div style={{ marginTop: '24px', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-hover)' }}>
                 <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', backgroundColor: '#00B900', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>L</div>
                  LINE応募・成果計測設定（記事の末尾に自動挿入）
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">LINEを開いた時に自動入力させておく文字（AI推奨案）</label>
                  <textarea 
                    className="input" 
                    rows={2} 
                    value={lineText}
                    onChange={(e) => setLineText(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* AI画像提案表示エリア */}
              {qualityResult?.checks && qualityResult.checks.find((c) => c.title === "画像の推奨（ビジュアル提案）") && (
                <div style={{ marginTop: '24px', border: '2px dashed #E91E63', padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FDF2F8' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '8px', color: '#E91E63', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📸</span> {qualityResult.checks.find((c) => c.title === "画像の推奨（ビジュアル提案）")?.title}
                  </div>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#831843' }}>
                    {qualityResult.checks.find((c) => c.title === "画像の推奨（ビジュアル提案）")?.message}
                  </p>
                </div>
              )}

              {/* 保存ボタンまたは完了画面（下部） */}
              {!savedArticleId ? (
                <div style={{ marginTop: '32px', textAlign: 'center', padding: '24px', backgroundColor: 'var(--brand-primary-light)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '8px', color: 'var(--brand-primary)' }}>記事が完成しましたか？</h3>
                  <p style={{ fontSize: '0.875rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    この作成内容とLINE設定をSupabaseデータベースに保存し、計測用の独自URLを発行します！
                  </p>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSave} 
                    disabled={isSaving || isGenerating}
                    style={{ fontSize: '1rem', padding: '12px 32px' }}
                  >
                    {isSaving ? "保存中..." : "✅ この内容で記事を保存・公開する"}
                  </button>
                </div>
              ) : (
                <div className="card" style={{ marginTop: '32px', border: '2px solid #10B981', backgroundColor: '#F0FDF4' }}>
                  <h3 style={{ color: '#047857', fontSize: '1.25rem', marginBottom: '16px' }}>🎉 記事の保存とLINE設定が完了しました！</h3>
                  <p style={{ marginBottom: '16px', color: '#065F46' }}>以下のボックスの文章には、すでに**あなたの設定したLINE文言に繋がる計測用リンク**がセットされています。このまま丸ごとコピーして、投稿先（バニラ等）に貼り付けてください。</p>
                  
                  <textarea
                    className="input"
                    rows={15}
                    readOnly
                    value={[
                      `<p style="text-align: center;"><strong>${ctrTitle || seoTitle}</strong></p>`,
                      `<p style="text-align: center;">&nbsp;</p>`,
                      ...(content.split('\n').map(line => {
                        const t = line.trim();
                        return t ? `<p style="text-align: center;">${t}</p>` : `<p style="text-align: center;">&nbsp;</p>`;
                      })),
                      `<p style="text-align: center;">&nbsp;</p>`,
                      `<p style="text-align: center;"><img onclick="location.href='${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/r/${savedArticleId}'" alt="LINEで質問だけしてみる" src="https://d1ywb8dvwodsnl.cloudfront.net/files.qzin.jp/img/shop/egirlshakata/manager_blog/154211337/20260406152707.png" style="width: 584px; height: 154px; cursor: pointer;" /></p>`
                    ].join('\n')}
                    style={{ backgroundColor: '#fff', fontSize: '0.875rem', fontFamily: 'monospace' }}
                  />
                  
                  <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        const copyText = [
                          `<p style="text-align: center;"><strong>${ctrTitle || seoTitle}</strong></p>`,
                          `<p style="text-align: center;">&nbsp;</p>`,
                          ...(content.split('\n').map(line => {
                            const t = line.trim();
                            return t ? `<p style="text-align: center;">${t}</p>` : `<p style="text-align: center;">&nbsp;</p>`;
                          })),
                          `<p style="text-align: center;">&nbsp;</p>`,
                          `<p style="text-align: center;"><img onclick="location.href='${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/r/${savedArticleId}'" alt="LINEで質問だけしてみる" src="https://d1ywb8dvwodsnl.cloudfront.net/files.qzin.jp/img/shop/egirlshakata/manager_blog/154211337/20260406152707.png" style="width: 584px; height: 154px; cursor: pointer;" /></p>`
                        ].join('\n');
                        navigator.clipboard.writeText(copyText);
                        alert("クリップボードにコピーしました！そのまま求人サイト(HTMLエディタ)に貼り付けてください。");
                      }}
                      style={{ backgroundColor: '#10B981' }}
                    >
                      📋 全文と計測リンクをまとめてコピー
                    </button>
                    <Link href="/articles" className="btn btn-outline" style={{ backgroundColor: '#fff' }}>記事一覧に戻る</Link>
                  </div>
                </div>
              )}

            </div>
          </div>

          <aside>
            <QualityCheckList 
              isChecking={isCheckingQuality} 
              result={qualityResult} 
              onCheck={handleQualityCheck} 
            />
          </aside>
        </div>
      </div>
    </>
  );
}

export default function ArticleCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticleCreateContent />
    </Suspense>
  );
}
