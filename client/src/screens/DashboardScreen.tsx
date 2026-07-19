import { useEffect, useState } from 'react';
import { useProfileStore } from '../store/profileStore';
import { getSummary, getWordStats } from '../services/statsService';
import { LEVELS } from '../types/game';

interface SessionQuestion {
  id: string;
  kind: string;
  questionText: string;
  answer: string;
  chosen: string;
  correct: boolean;
  firstTry: boolean;
}

interface Session {
  id: string;
  completedAt: string;
  score: number;
  questionCount: number;
  stars: number;
  livesLeft: number;
  questions: SessionQuestion[];
}

interface WordStat {
  wordKey: string;
  correct: number;
  wrong: number;
  mastery: 'UNSEEN' | 'STRUGGLING' | 'LEARNING' | 'MASTERED';
  lastSeen: string;
}

interface DashboardScreenProps {
  profileId: string | null; // null = show child selector
  onBack: () => void;
  onLogout?: () => void;
}

const KIND_LABEL: Record<string, string> = {
  E2H: 'English→Hebrew',
  H2E: 'Hebrew→English',
  SENTENCE: 'Sentence',
  LISTEN: 'Listen',
  LETTER_CHOICE: 'Recognize Letter',
  LETTER_TYPE: 'Write Letter',
};

const MASTERY_EMOJI: Record<string, string> = {
  STRUGGLING: '🔴',
  LEARNING: '🟡',
  MASTERED: '🟢',
  UNSEEN: '⚪',
};

function Stars({ count }: { count: number }) {
  return (
    <span>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ opacity: i <= count ? 1 : 0.25 }}>⭐</span>
      ))}
    </span>
  );
}

export function DashboardScreen({ profileId: initialProfileId, onBack, onLogout }: DashboardScreenProps) {
  const { profiles, updateProfileLevel } = useProfileStore();
  const profileList = Object.values(profiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(initialProfileId ?? (profileList[0]?.id ?? null));
  const profile = selectedProfileId ? profiles[selectedProfileId] : null;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [words, setWords] = useState<WordStat[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [tab, setTab] = useState<'sessions' | 'words'>('sessions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedProfileId) return;
    setLoading(true);
    setError('');
    setSessions([]);
    setWords([]);
    async function load() {
      try {
        const [summary, wordStats] = await Promise.all([
          getSummary(selectedProfileId!),
          getWordStats(selectedProfileId!),
        ]);
        setSessions(summary.recentSessions ?? []);
        setWords(wordStats ?? []);
      } catch {
        setError('לא ניתן לטעון נתונים. ודא שאתה מחובר.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedProfileId]);

  const wrongWords = words.filter((w) => w.mastery === 'STRUGGLING' || w.wrong > 0);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="screen active" style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>👨‍👩‍👧 אזור הורים</h2>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-dim)', fontSize: '0.75rem', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer' }}
          >
            יציאה
          </button>
        )}
      </div>

      {/* Child selector */}
      {profileList.length === 0 ? (
        <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>אין ילדים עדיין</div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
          {profileList.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProfileId(p.id)}
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                background: selectedProfileId === p.id ? 'var(--color-primary)' : 'var(--color-surface-1)',
                color: selectedProfileId === p.id ? '#fff' : 'var(--text-dim)',
                fontWeight: selectedProfileId === p.id ? 700 : 400,
                fontSize: '0.9rem',
              }}
            >
              <span>{p.avatar}</span> {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Selected child summary */}
      {profile && (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: '10px' }}>
          {profile.totalGames} משחקים · ⭐{profile.totalStars}
        </div>
      )}

      {/* Level picker */}
      {profile && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            רמת קושי
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => updateProfileLevel(profile.id, lvl.id)}
                style={{
                  flex: 1, padding: '8px 6px', borderRadius: '12px',
                  border: profile.level === lvl.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                  background: profile.level === lvl.id ? 'rgba(108,63,197,0.2)' : 'var(--color-surface-1)',
                  color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  fontSize: '0.8rem',
                }}
              >
                <span>{lvl.icon}</span> {lvl.labelHe}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {(['sessions', 'words'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px', borderRadius: '12px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              background: tab === t ? 'var(--color-primary)' : 'var(--color-surface-1)',
              color: tab === t ? '#fff' : 'var(--text-dim)',
              transition: 'background 0.2s',
            }}
          >
            {t === 'sessions' ? '🎮 Game History' : '📚 Word Stats'}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0' }}>
          Loading…
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--color-danger)', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      )}

      {/* Sessions tab */}
      {!loading && !error && tab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.length === 0 && (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px 0' }}>
              No games played yet
            </div>
          )}
          {sessions.map((s) => {
            const wrong = s.questions.filter((q) => !q.correct);
            const expanded = expandedSession === s.id;
            return (
              <div
                key={s.id}
                style={{
                  background: 'var(--color-surface-1)', borderRadius: '14px',
                  overflow: 'hidden',
                }}
              >
                {/* Session header row */}
                <button
                  onClick={() => setExpandedSession(expanded ? null : s.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '14px 16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: 'inherit', textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '3px' }}>
                      <Stars count={s.stars} />
                      &nbsp; {s.score}/{s.questionCount} correct
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {formatDate(s.completedAt)} · ❤️ {s.livesLeft} left
                      {wrong.length > 0 && (
                        <span style={{ color: 'var(--color-danger)', marginLeft: '8px' }}>
                          · {wrong.length} missed
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
                    {expanded ? '▲' : '▼'}
                  </span>
                </button>

                {/* Expandable wrong answers */}
                {expanded && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 16px' }}>
                    {wrong.length === 0 ? (
                      <div style={{ color: 'var(--color-success)', fontSize: '0.9rem', textAlign: 'center', padding: '8px 0' }}>
                        🎉 Perfect score!
                      </div>
                    ) : (
                      <>
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Missed questions
                        </div>
                        {wrong.map((q) => (
                          <div
                            key={q.id}
                            style={{
                              background: 'rgba(239,68,68,0.08)', borderRadius: '10px',
                              padding: '10px 12px', marginBottom: '8px',
                              borderLeft: '3px solid var(--color-danger)',
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '3px' }}>
                              {KIND_LABEL[q.kind] ?? q.kind}
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                              {q.questionText}
                            </div>
                            <div style={{ fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--color-success)' }}>✓ {q.answer}</span>
                              <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>·</span>
                              <span style={{ color: 'var(--color-danger)' }}>✗ {q.chosen}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {/* Also show correct ones */}
                    {s.questions.filter((q) => q.correct).length > 0 && (
                      <details style={{ marginTop: '8px' }}>
                        <summary style={{ color: 'var(--text-dim)', fontSize: '0.82rem', cursor: 'pointer' }}>
                          Show correct answers ({s.questions.filter((q) => q.correct).length})
                        </summary>
                        <div style={{ marginTop: '8px' }}>
                          {s.questions.filter((q) => q.correct).map((q) => (
                            <div
                              key={q.id}
                              style={{
                                background: 'rgba(16,185,129,0.07)', borderRadius: '10px',
                                padding: '8px 12px', marginBottom: '6px',
                                borderLeft: '3px solid var(--color-success)',
                                fontSize: '0.85rem',
                              }}
                            >
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{KIND_LABEL[q.kind]} · </span>
                              <strong>{q.questionText}</strong>
                              <span style={{ color: 'var(--color-success)', marginLeft: '8px' }}>✓ {q.answer}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Word Stats tab */}
      {!loading && !error && tab === 'words' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {words.length === 0 && (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px 0' }}>
              No word data yet
            </div>
          )}

          {/* Struggling first */}
          {(['STRUGGLING', 'LEARNING', 'MASTERED'] as const).map((level) => {
            const group = words.filter((w) => w.mastery === level);
            if (group.length === 0) return null;
            return (
              <div key={level}>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '10px 0 6px' }}>
                  {MASTERY_EMOJI[level]} {level} ({group.length})
                </div>
                {group.map((w) => (
                  <div
                    key={w.wordKey}
                    style={{
                      background: 'var(--color-surface-1)', borderRadius: '10px',
                      padding: '10px 14px', marginBottom: '6px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{w.wordKey}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        ✓ {w.correct} correct · ✗ {w.wrong} wrong
                      </div>
                    </div>
                    <div style={{ fontSize: '1.3rem' }}>{MASTERY_EMOJI[w.mastery]}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
