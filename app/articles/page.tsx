import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function ArticlesPage() {
  const supabase = await createClient();

  // Fetch articles and click counts
  const { data: articles, error } = await supabase
    .from("blogmaker_articles")
    .select(`
      id,
      title,
      created_at,
      clicks:blogmaker_article_clicks(count)
    `)
    .order("created_at", { ascending: false });

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">記事一覧</h1>
        <div className="flex-gap-4">
          <Link href="/articles/create" className="btn btn-primary">+ 新規記事作成</Link>
        </div>
      </header>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '24px', backgroundColor: 'var(--bg-surface-hover)' }}>
            <div style={{ fontWeight: 600, color: 'var(--brand-primary)', borderBottom: '2px solid var(--brand-primary)', paddingBottom: '12px', marginBottom: '-17px' }}>
              すべて ({articles?.length || 0})
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.875rem', backgroundColor: '#fff' }}>
                <th style={{ padding: '16px 24px' }}>タイトル（SEO / 応募タイトル）</th>
                <th style={{ padding: '16px 24px', width: '200px' }}>LINE起動（成果）</th>
                <th style={{ padding: '16px 24px', width: '200px' }}>ステータス</th>
                <th style={{ padding: '16px 24px', width: '200px', textAlign: 'center' }}>計測用リンク</th>
              </tr>
            </thead>
            <tbody>
              {articles?.map((article) => {
                // Supabase returns count as an array [{ count: number }]
                const clickCount = article.clicks?.[0]?.count || 0;
                // Generate relative time or date string
                const dateStr = new Date(article.created_at).toLocaleDateString("ja-JP");

                return (
                  <tr key={article.id} style={{ borderBottom: '1px solid var(--border-color-focus)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                        {article.title}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>作成日: {dateStr}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', backgroundColor: '#00B900', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>L</div>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{clickCount}</span> 回
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge badge-success">公開済</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <a 
                        href={`/r/${article.id}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
                      >
                        【ブログに貼る用】LINE計測リンク確認
                      </a>
                    </td>
                  </tr>
                );
              })}

              {(!articles || articles.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    記事がありません
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
