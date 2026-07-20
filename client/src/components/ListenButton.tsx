interface ListenButtonProps {
  playing: boolean;
  onPlay: () => void;
  hint?: string;
}

export function ListenButton({ playing, onPlay, hint = 'Listen carefully, then choose the Hebrew meaning' }: ListenButtonProps) {
  return (
    <>
      <button className={`listen-btn${playing ? ' playing' : ''}`} onClick={onPlay}>
        🔊 Tap to Listen
      </button>
      <div className="listen-hint">{hint}</div>
    </>
  );
}
