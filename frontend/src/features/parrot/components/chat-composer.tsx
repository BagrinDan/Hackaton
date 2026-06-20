import { useState, type KeyboardEvent } from "react";
import { IconSend2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatComposerProps {
  disabled?: boolean;
  onSend: (message: string) => void;
}

export function ChatComposer({ disabled = false, onSend }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const isEmpty = value.trim().length === 0;

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-border/70 bg-background/95 px-4 py-4">
      <div className="rounded-2xl border border-border/70 bg-background shadow-xs">
        <div className="p-3 pb-2">
          <Textarea
            value={value}
            data-testid="chat-input"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask about the island, your next stop, or what to do today…"
            className="max-h-28 min-h-20 resize-none border-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center justify-end px-3 py-2.5">
          <Button
            type="button"
            data-testid="chat-send"
            onClick={submit}
            disabled={disabled || isEmpty}
            className="cursor-pointer bg-(--zone-accent) text-white hover:opacity-90"
          >
            <IconSend2 size={14} className="mr-1.5" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
