"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  type ProductState,
} from "./actions";
import { PRODUCT_CATEGORY_LABELS, type Product } from "./types";

const initialState: ProductState = { error: null };
const selectClass =
  "h-10 w-full rounded-md border border-border bg-bg-surface px-3 text-sm text-text-primary";

/** יצירת מוצר בתוך FormDialog — סוגר את הדיאלוג בהצלחה. */
export function CreateProductForm() {
  const close = useDialogClose();
  return <ProductForm onDone={close} />;
}

export function ProductForm({
  product,
  onDone,
}: {
  product?: Product;
  onDone: () => void;
}) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [variable, setVariable] = useState(product?.variable_amount ?? false);
  const [deleting, setDeleting] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onDone();
    wasPending.current = pending;
  }, [pending, state.error, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {product && <input type="hidden" name="productId" value={product.id} />}
      <Input
        name="name"
        placeholder="שם המוצר — למשל ביגוד"
        defaultValue={product?.name ?? ""}
        required
      />
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        קטגוריה
        <select
          name="category"
          defaultValue={product?.category ?? "other"}
          className={selectClass}
        >
          {Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-text-body flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="variableAmount"
          checked={variable}
          onChange={(e) => setVariable(e.target.checked)}
          className="size-4"
        />
        סכום חופשי (המשלם קובע — למשל תרומה)
      </label>
      {!variable && (
        <label className="text-text-muted flex flex-col gap-1 text-xs">
          סכום (₪)
          <Input
            name="amount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={
              product ? (product.amount_agorot / 100).toFixed(2) : ""
            }
            required
          />
        </label>
      )}
      <label className="text-text-body flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.is_active ?? true}
          className="size-4"
        />
        פעיל
      </label>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <div className="flex items-center justify-between">
        <Button type="submit" disabled={pending || deleting}>
          {pending ? <Spinner className="size-4" /> : "שמירה"}
        </Button>
        {product && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending || deleting}
            onClick={() => {
              if (!confirm("למחוק את המוצר?")) return;
              setDeleting(true);
              const fd = new FormData();
              fd.set("productId", product.id);
              deleteProductAction(fd).then(onDone);
            }}
          >
            מחיקה
          </Button>
        )}
      </div>
    </form>
  );
}
