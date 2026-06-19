import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";

/** דיאלוג הסבר על משמעות סטטוסי העונה. */
export function SeasonStatusInfo() {
  return (
    <Dialog triggerLabel="מה זה פעילה / סגורה?" title="סטטוס עונה">
      <div className="text-text-body flex flex-col gap-4 text-sm leading-relaxed">
        <div className="flex items-start gap-3">
          <Badge variant="success">פעילה</Badge>
          <p>
            העונה הנוכחית שעליה עובדים — ברירת המחדל בכל המסכים (שחקנים, קבוצות,
            תשלומים). בכל רגע יש עונה פעילה אחת בלבד.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="muted">סגורה</Badge>
          <p>
            עונה שהסתיימה. לקריאה בלבד — שומרת על היסטוריה נקייה ומונעת שינויים
            בטעות. אפשר לפתוח מחדש בעת הצורך.
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Badge variant="info">לא פעילה</Badge>
          <p>
            עונה שנוצרה אך אינה הנוכחית (למשל עונה עתידית שהוכנה מראש). אפשר
            להפעיל אותה בכל עת.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
