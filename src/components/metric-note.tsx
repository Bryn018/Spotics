type MetricNoteProps = {
  title: string;
  body: string;
  tone?: "neutral" | "caution";
};

export default function MetricNote({ title, body, tone = "neutral" }: MetricNoteProps) {
  const toneClasses =
    tone === "caution"
      ? "border-orange-300/20 bg-orange-300/10"
      : "border-white/8 bg-white/[0.04]";

  return (
    <div className={`rounded-[1.5rem] border p-5 ${toneClasses}`}>
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">{title}</p>
      <p className="mt-3 text-sm leading-7 text-white/62">{body}</p>
    </div>
  );
}
