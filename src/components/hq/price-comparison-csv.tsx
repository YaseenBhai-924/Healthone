"use client";

import { useRef, useTransition } from "react";
import {
  exportPriceComparisonsAction,
  importPriceComparisonsAction,
} from "@/app/(hq)/hq/price-comparisons/actions";
import { Button, useToast } from "@/components/ui";

export function PriceComparisonCsvTools() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();

  function downloadCsv() {
    startTransition(async () => {
      const result = await exportPriceComparisonsAction();
      if (!result.ok || !result.csv) {
        addToast({
          variant: "danger",
          message: result.ok ? "Export failed." : result.message,
        });
        return;
      }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "price-comparisons.csv";
      a.click();
      URL.revokeObjectURL(url);
      addToast({ variant: "success", message: "CSV exported." });
    });
  }

  function onFile(file: File | null) {
    if (!file) return;
    startTransition(async () => {
      const text = await file.text();
      const result = await importPriceComparisonsAction(text);
      if (!result.ok) {
        addToast({ variant: "danger", message: result.message });
        return;
      }
      addToast({
        variant: "success",
        message: `Imported ${result.imported ?? 0} comparison(s).`,
      });
      window.location.reload();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={pending}
        onClick={downloadCsv}
      >
        Export CSV
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        Import CSV
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
