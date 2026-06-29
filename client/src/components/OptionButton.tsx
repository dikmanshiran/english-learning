interface OptionButtonProps {
  text: string;
  isHebrew: boolean;
  state: 'default' | 'correct' | 'wrong' | 'disabled';
  onClick: () => void;
}

export function OptionButton({ text, isHebrew, state, onClick }: OptionButtonProps) {
  const cls = [
    'opt-btn',
    isHebrew ? 'hebrew-opt' : '',
    state === 'correct' ? 'correct' : '',
    state === 'wrong' ? 'wrong' : '',
    state === 'disabled' || state === 'correct' ? 'disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} onClick={onClick}>
      {text}
    </button>
  );
}
