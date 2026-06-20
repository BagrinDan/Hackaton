import { useState } from "react";

import { ParrotConversationList } from "@/features/parrot/components/parrot-conversation-list";
import { ParrotConversationTranscript } from "@/features/parrot/components/parrot-conversation-transcript";
import { ParrotMetrics } from "@/features/parrot/components/parrot-metrics";

export function ParrotAdminPanel() {
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  if (selectedGuestId) {
    return (
      <ParrotConversationTranscript
        guestId={selectedGuestId}
        onBack={() => setSelectedGuestId(null)}
      />
    );
  }

  return (
    <div data-testid="parrot-admin-panel" className="flex flex-col gap-6">
      <ParrotMetrics />
      <ParrotConversationList
        selectedGuestId={selectedGuestId}
        onSelect={setSelectedGuestId}
      />
    </div>
  );
}
