import { Question } from '../types/game';
import { ListenButton } from './ListenButton';

interface QuestionCardProps {
  question: Question;
  shake: boolean;
  playing: boolean;
  onPlay: () => void;
}

export function QuestionCard({ question: q, shake, playing, onPlay }: QuestionCardProps) {
  const badge =
    q.kind === 'e2h'
      ? '🇬🇧 → 🇮🇱 Translate to Hebrew · תרגם לעברית'
      : q.kind === 'h2e'
      ? '🇮🇱 → 🇬🇧 Translate to English · תרגם לאנגלית'
      : q.kind === 'listen'
      ? '🎧 Listen & Choose Hebrew · הקשב ובחר בעברית'
      : q.kind === 'letter-choice'
      ? '🔤 Recognize the Letter · זהה את האות'
      : q.kind === 'letter-listen'
      ? '🎧 Listen & Choose the Letter · הקשב ובחר את האות'
      : '✏️ Complete the Sentence · השלם את המשפט';

  return (
    <div className={`question-card${shake ? ' shake' : ''}`}>
      <div className="q-type-badge">{badge}</div>

      {q.kind === 'sentence' ? (
        <>
          <div
            className="q-sentence"
            dangerouslySetInnerHTML={{
              __html: q.question.replace(
                '___',
                '<span class="blank">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>'
              ),
            }}
          />
          <div className="q-hint">Pick the correct word · בחר את המילה הנכונה</div>
        </>
      ) : q.kind === 'listen' ? (
        <div className="q-word">
          <ListenButton playing={playing} onPlay={onPlay} />
        </div>
      ) : q.kind === 'letter-listen' ? (
        <div className="q-word">
          <ListenButton
            playing={playing}
            onPlay={onPlay}
            hint="Listen carefully, then choose the matching letter · הקשב היטב ובחר את האות המתאימה"
          />
        </div>
      ) : q.kind === 'letter-choice' ? (
        <>
          <div className="q-word" style={{ fontSize: q.question.length === 1 ? '4rem' : undefined }}>
            {q.question}
          </div>
          <div className="q-hint">{q.hintText}</div>
        </>
      ) : (
        <>
          <div className={`q-word${q.kind === 'h2e' ? ' hebrew' : ''}`}>{q.question}</div>
          <div className="q-hint">
            {q.hintText === 'phrase' ? '💬 Conversational phrase · ביטוי שיחה' : ''}
          </div>
        </>
      )}
    </div>
  );
}
