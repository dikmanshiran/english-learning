import { useGameStore } from '../store/gameStore';
import { WrongAnswer } from '../types/game';

interface ResultsScreenProps {
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultsScreen({ onPlayAgain, onHome }: ResultsScreenProps) {
  const { questions, currentQ, score, lives, wrongAnswers } = useGameStore();

  const total = questions.length;
  const pct = total > 0 ? score / total : 0;

  let emoji = '💪';
  let title = 'Keep Practicing!';
  let stars = '⭐';

  if (lives === 0) {
    emoji = '😅';
    title = 'Game Over!';
    stars = score >= total * 0.5 ? '⭐⭐' : '⭐';
  } else if (pct >= 0.9) {
    emoji = '🏆';
    title = 'AMAZING!';
    stars = '⭐⭐⭐';
  } else if (pct >= 0.7) {
    emoji = '🎉';
    title = 'Great Job!';
    stars = '⭐⭐⭐';
  } else if (pct >= 0.5) {
    emoji = '😊';
    title = 'Good Work!';
    stars = '⭐⭐';
  }

  const subtitle =
    lives === 0
      ? `You ran out of hearts after ${currentQ} questions.`
      : `You scored ${score} points on ${total} questions!`;

  return (
    <div className="screen active">
      <div className="results-card">
        <span className="result-emoji">{emoji}</span>
        <div className="result-title">{title}</div>
        <div className="result-stars">{stars}</div>
        <div className="result-score">{score} pts</div>
        <div className="result-subtitle">{subtitle}</div>

        <div className="review-section">
          {wrongAnswers.length === 0 ? (
            <div className="review-title" style={{ color: '#6ee7b7' }}>
              🎯 Perfect — no mistakes!
            </div>
          ) : (
            <>
              <div className="review-title">
                📝 Review your mistakes ({wrongAnswers.length})
              </div>
              {wrongAnswers.map((wa: WrongAnswer, i: number) => {
                const { q, chosen, correct } = wa;
                let qLabel: string;
                if (q.kind === 'sentence') {
                  qLabel = q.question.replace('___', '___');
                } else if (q.kind === 'e2h') {
                  qLabel = `Translate "${q.question}" to Hebrew`;
                } else if (q.kind === 'listen') {
                  qLabel = `🎧 Listen: "${q.question}" → Hebrew`;
                } else {
                  qLabel = `Translate "${q.question}" to English`;
                }
                const isHebrewAnswer = q.kind === 'e2h' || q.kind === 'listen';
                return (
                  <div key={i} className="review-item">
                    <div className="review-q">{qLabel}</div>
                    <div className="review-chosen" style={isHebrewAnswer ? { direction: 'rtl' } : {}}>
                      ✗ You chose: {chosen}
                    </div>
                    <div className="review-correct" style={isHebrewAnswer ? { direction: 'rtl' } : {}}>
                      ✓ Correct: {correct}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className="result-btns">
          <button className="result-btn primary" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          <button className="result-btn secondary" onClick={onHome}>
            🏠 Change Units
          </button>
        </div>
      </div>
    </div>
  );
}
