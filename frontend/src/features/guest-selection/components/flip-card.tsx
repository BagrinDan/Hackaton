import { cn } from "@/lib/utils";

interface FlipCardProps {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
}

const faceClass =
  "rounded-[1.75rem] p-4 shadow-(--wood-shadow) [background:var(--wood-gradient)] [backface-visibility:hidden]";

export function FlipCard({ flipped, front, back }: FlipCardProps) {
  return (
    <div
      className="relative transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-style:preserve-3d]"
      style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
    >
      <div className={faceClass}>{front}</div>
      <div
        className={cn(
          faceClass,
          "absolute inset-0 [transform:rotateY(180deg)]"
        )}
      >
        {back}
      </div>
    </div>
  );
}
