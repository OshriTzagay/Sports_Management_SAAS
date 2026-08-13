"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowModal } from "@/components/ui/row-modal";
import { ProductForm } from "./product-form";
import { PRODUCT_CATEGORY_LABELS, formatAgorot, type Product } from "./types";

export function ProductList({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (product: Product) => {
    setSelected(product);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "שם",
      cell: (p) => (
        <span className="text-text-primary font-medium">{p.name}</span>
      ),
      sortValue: (p) => p.name,
    },
    {
      key: "category",
      header: "קטגוריה",
      cell: (p) => (
        <span className="text-text-muted">
          {PRODUCT_CATEGORY_LABELS[p.category]}
        </span>
      ),
      sortValue: (p) => PRODUCT_CATEGORY_LABELS[p.category],
      filter: {
        label: "קטגוריה",
        value: (p) => PRODUCT_CATEGORY_LABELS[p.category],
      },
    },
    {
      key: "amount",
      header: "מחיר",
      cell: (p) => (
        <span className="text-text-primary">
          {p.variable_amount
            ? "סכום חופשי"
            : formatAgorot(p.amount_agorot, p.currency)}
        </span>
      ),
      sortValue: (p) => p.amount_agorot,
    },
    {
      key: "active",
      header: "סטטוס",
      align: "end",
      cell: (p) => (
        <Badge variant={p.is_active ? "success" : "muted"}>
          {p.is_active ? "פעיל" : "לא פעיל"}
        </Badge>
      ),
      sortValue: (p) => (p.is_active ? "פעיל" : "לא פעיל"),
      filter: {
        label: "סטטוס",
        value: (p) => (p.is_active ? "פעיל" : "לא פעיל"),
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={products}
        rowKey={(p) => p.id}
        onRowClick={open}
        searchAccessor={(p) => p.name}
        searchPlaceholder="חיפוש מוצר…"
        emptyMessage="עדיין אין מוצרים. הוסף פריט חיוב ראשון."
      />

      <RowModal dialogRef={dialogRef} title="עריכת מוצר" onClose={close}>
        {selected && (
          <ProductForm key={selected.id} product={selected} onDone={close} />
        )}
      </RowModal>
    </>
  );
}
