import React from "react";

export type QualityResult = {
  score: number;
  checks: Array<{
    title: string;
    status: "success" | "warning" | "error";
    message: string;
  }>;
};

type Props = {
  result?: QualityResult | null;
  isChecking?: boolean;
  onCheck?: () => void;
};

export default function QualityCheckList({ result, isChecking, onCheck }: Props) {
  return (
    <div className="card" style={{ position: 'sticky', top: '24px' }}>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>品質チェック</h3>
        {result?.score !== undefined && (
          <span className="badge badge-warning" style={{ fontSize: '1rem', padding: '4px 12px' }}>
            スコア: {result.score}点
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {/* ローディング中 */}
        {isChecking && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            <div style={{ marginBottom: '12px', fontSize: '2rem' }}>🔍</div>
            <div>AIが記事と画像を診断中...<br/><small>(約10秒)</small></div>
          </div>
        )}

        {/* 結果表示 */}
        {!isChecking && result?.checks.map((check, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              backgroundColor: check.status === 'success' ? '#10B981' : check.status === 'error' ? '#EF4444' : '#F59E0B',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>
              {check.status === 'success' ? '✓' : check.status === 'error' ? 'X' : '!'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>{check.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {check.message}
              </div>
            </div>
          </div>
        ))}

        {/* 初期状態 */}
        {!isChecking && !result && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '16px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)' }}>
            左側の「構成と本文を一括生成」を行った後、「AIで品質基準と画像を診断」ボタンを押すと、不足している情報やおすすめの掲載写真についてアドバイスが表示されます。
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={onCheck}
          className="btn btn-outline" 
          disabled={isChecking}
          style={{ width: '100%', fontSize: '0.875rem' }}
        >
          {isChecking ? "診断中..." : "🔄 記事を修正して再診断する"}
        </button>
      </div>
    </div>
  );
}
