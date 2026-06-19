import { useIsFetching } from "@tanstack/react-query";

export function RefreshIndicator() {
  const fetching = useIsFetching();

  return (
    <div
      role="status"
      aria-hidden={fetching === 0}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden transition-opacity duration-300"
      style={{ opacity: fetching > 0 ? 1 : 0 }}
    >
      <div className="refresh-bar h-full w-full gold-gradient" />
    </div>
  );
}
