"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { generateAndSaveKeywords } from "@/app/actions/keywords";
import { createClient } from "@/utils/supabase/client";

type KeywordRow = {
  id: string;
  keyword: string;
  search_intent: string;
  mock_volume: number;
  priority_score: string;
  status?: string;
};

export default function KeywordsPage() {
  const [seed, setSeed] = useState("キャバクラ");
  const [area, setArea] = useState("新宿");
  const [isLoading, setIsLoading] = useState(false);
  const [keywords, setKeywords] = useState<KeywordRow[]>([]);
  const supabase = createClient();

  // 初回マウント時＆更新時にキーワードをDBから取得
  const fetchKeywords = async () => {
    const { data } = await supabase
      .from("blogmaker_keywords")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setKeywords(data);
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleGenerate = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await generateAndSaveKeywords(seed, area);
      await fetchKeywords(); // 生成後に再取得して一覧更新
    } catch (error) {
      alert("生成中にエラーが発生しました。GEMINI_API_KEYの設定などを確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">キーワード管理</h1>
        <div className="flex-gap-4">
          <button className="btn btn-primary" disabled={isLoading}>+ 種キーワードを手動追加</button>
        </div>
      </header>

      <div className="page-content">
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '16px' }}>新たなキーワードの分析（AI自動生成）</h2>
          <div className="grid-3" style={{ alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">種キーワード</label>
              <input type="text" className="input" value={seed} onChange={e => setSeed(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">対象エリア</label>
              <input type="text" className="input" value={area} onChange={e => setArea(e.target.value)} />
            </div>
            <div>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', backgroundColor: isLoading ? 'var(--text-muted)' : 'var(--brand-primary)' }}
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? "🔄 生成中... (約10秒かかります)" : "✨ AIで拡張・検索意図を分析"}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div className="flex-gap-4" style={{ alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>対策キーワード一覧</h2>
              <span className="badge badge-info">全 {keywords.length} 件</span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <th style={{ padding: '12px 16px' }}>キーワード</th>
                <th style={{ padding: '12px 16px' }}>検索意図</th>
                <th style={{ padding: '12px 16px' }}>見込Vol.</th>
                <th style={{ padding: '12px 16px' }}>優先度</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>アクション</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color-focus)', backgroundColor: item.priority_score.includes('S') ? 'var(--brand-primary-light)' : 'transparent' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{item.keyword}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${item.search_intent === '応募直前' ? 'badge-success' : item.search_intent === '不安解消' ? 'badge-info' : 'badge-warning'}`}>
                      {item.search_intent}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>{item.mock_volume}</td>
                  <td style={{ padding: '16px', color: item.priority_score.includes('S') ? 'var(--brand-primary)' : 'inherit', fontWeight: 600 }}>
                    {item.priority_score}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Link href={`/articles/create?keyword=${encodeURIComponent(item.keyword)}`} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                      記事化する
                    </Link>
                  </td>
                </tr>
              ))}
              
              {keywords.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    キーワードがまだありません。上の機能を使ってAI生成を行ってください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
