import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/use-online";

export function OfflineBanner() {
  const online = useOnline();

  if (online) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex h-8 items-center justify-center gap-2 bg-amber-500 px-4 text-xs font-medium text-amber-950"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">
        Você está offline - exibindo dados salvos. Ações indisponíveis.
      </span>
    </div>
  );
}
