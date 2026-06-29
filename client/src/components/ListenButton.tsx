interface ListenButtonProps {
  playing: boolean;
  onPlay: () => void;
}

export function ListenButton({ playing, onPlay }: ListenButtonProps) {
  return (
    <>
      <button className={`listen-btn${playing ? ' playing' : ''}`} onClick={onPlay}>
        🔊 Tap to Listen
      </button>
      <div className="listen-hint">Listen carefully, then choose the Hebrew meaning</div>
    </>
  );
}
