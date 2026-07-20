"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import type { Player } from "@/features/players/types";
import { createChargeAction, type CreateChargeState } from "./actions";

const initialState: CreateChargeState = { error: null };

export function CreateChargeForm({
  players,
  playersWithBilling,
}: {
  players: Player[];
  playersWithBilling: string[];
}) {
  const [state, formAction, pending] = useActionState(
    createChargeAction,
    initialState,
  );
  const [playerId, setPlayerId] = useState("");
  const [discount, setDiscount] = useState("");
  const close = useDialogClose();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) close();
    wasPending.current = pending;
  }, [pending, state.error, close]);

  const showReason = Number(discount) > 0;
  const noBilling = playerId !== "" && !playersWithBilling.includes(playerId);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        שחקן
        <SearchableSelect
          name="playerId"
          value={playerId}
          onChange={setPlayerId}
          options={players.map((p) => ({
            value: p.id,
            label: `${p.first_name} ${p.last_name}`,
          }))}
          placeholder="בחירת שחקן…"
          searchPlaceholder="חיפוש שחקן…"
        />
      </label>
      {noBilling && (
        <p className="bg-warning-bg text-warning-text rounded-md px-3 py-2 text-xs">
          לשחקן זה אין איש קשר לחיוב. החיוב ייווצר, אך לא ניתן יהיה לשלוח קישור
          תשלום עד שתגדיר איש קשר ״משלם״ בכרטיס השחקן.
        </p>
      )}
      <Input
        name="description"
        placeholder="תיאור — למשל דמי רישום 2026/27"
        required
      />
      <div className="flex gap-2">
        <label className="text-text-muted flex flex-1 flex-col gap-1 text-xs">
          סכום (₪)
          <Input
            name="amount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            required
          />
        </label>
        <label className="text-text-muted flex flex-1 flex-col gap-1 text-xs">
          הנחה / מלגה (₪)
          <Input
            name="discount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="0"
          />
        </label>
      </div>
      {showReason && (
        <Input
          name="discountReason"
          placeholder="סיבת ההנחה — למשל קושי כלכלי / הנחת אח"
        />
      )}
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        תאריך יעד (אופציונלי)
        <Input name="dueDate" type="date" />
      </label>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending || !playerId}>
        {pending ? <Spinner className="size-4" /> : "יצירת חיוב"}
      </Button>
    </form>
  );
}
