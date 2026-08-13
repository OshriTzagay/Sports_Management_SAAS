/**
 * פס התקדמות בראש המסך — משוב מיידי בזמן שניווט (route) נטען.
 * ממלא את רוחב המסך מקצה ההתחלה ומטפס עד ~90% עד שהדף מוכן.
 * מוצג ע"י ה-caller כל עוד הניווט בתהליך (useLinkStatus().pending).
 */
export function TopLoadingBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px] w-full overflow-hidden">
      <div className="bg-primary-500 animate-route-progress shadow-primary-500/50 h-full w-full shadow-[0_0_10px_1px]" />
    </div>
  );
}
