import Link from "next/link";

export default function Dashboard() {
  return (
    <>
      <header className="page-header">
        <h1 className="page-title">ダッシュボード</h1>
        <div className="flex-gap-4">
          <button className="btn btn-outline">プロジェクト設定</button>
          <Link href="/articles/create" className="btn btn-primary">+ 新規記事作成</Link>
        </div>
      </header>
      
      <div className="page-content">
        <div className="grid-3" style={{ marginBottom: '32px' }}>
          <div className="card">
            <h3 className="form-label">作成済み記事（公開中）</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-primary)' }}>12件</div>
          </div>
          <div className="card">
            <h3 className="form-label">レビュー待ち（下書き）</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>3件</div>
          </div>
          <div className="card">
            <h3 className="form-label">月間想定インプレッション</h3>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>1,400</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h2 className="page-title" style={{ fontSize: '1.25rem' }}>対策優先キーワード</h2>
              <Link href="/keywords" style={{ fontSize: '0.875rem', color: 'var(--accent-color)' }}>すべて見る</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '8px 0' }}>キーワード</th>
                  <th>検索意図</th>
                  <th>優先度</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color-focus)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>新宿 キャバクラ 体験入店</td>
                  <td><span className="badge badge-warning">比較検討</span></td>
                  <td style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>SS</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color-focus)' }}>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>新宿 キャバクラ 罰金なし</td>
                  <td><span className="badge badge-info">不安解消</span></td>
                  <td style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>S</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>新宿 未経験 夜職</td>
                  <td><span className="badge badge-info">不安解消</span></td>
                  <td style={{ fontWeight: 600 }}>A</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h2 className="page-title" style={{ fontSize: '1.25rem' }}>直近の作成記事</h2>
              <Link href="/articles" style={{ fontSize: '0.875rem', color: 'var(--accent-color)' }}>記事一覧へ</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span className="badge badge-warning">レビュー待ち</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>今日 10:30</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>歌舞伎町でノルマ・罰金なしのキャバクラが少ない理由と当店の「絶対安心」の給与システム</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>対策KW: 新宿 キャバクラ 罰金なし</div>
              </div>
              
              <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span className="badge badge-success">公開済</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>昨日 18:00</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>未経験から歌舞伎町キャバクラで働く前に知っておくべき3つの真実。店長が教えます</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>対策KW: 新宿 未経験 夜職</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
