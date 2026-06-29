interface HeartsProps {
  lives: number;
  max?: number;
}

export function Hearts({ lives, max = 3 }: HeartsProps) {
  return (
    <span className="hearts">
      {'❤️'.repeat(Math.max(0, lives))}
      {'🖤'.repeat(Math.max(0, max - lives))}
    </span>
  );
}
