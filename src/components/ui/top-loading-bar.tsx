/**
 * פס התקדמות דק בראש המסך — משוב מיידי בזמן שניווט (route) נטען.
 * מוצג ע"י ה-caller כל עוד הניווט בתהליך (useLinkStatus().pending).
 */
export function TopLoadingBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden">
      <div className="bg-primary-500 animate-route-progress h-full w-1/4 rounded-full" />
    </div>
  );
}
