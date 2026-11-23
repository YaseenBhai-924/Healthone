"use client";

import { useTransition } from "react";
import { QrCode } from "lucide-react";
import { downloadQrAction } from "@/app/(hq)/hq/clinics/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function ClinicQrButton({
  clinicId,
  clinicName,
}: {
  clinicId: string;
  clinicName: string;
}) {
  const { addToast } = useToast();
  const [pending, startTransition] = useTransition();

  function download() {
    startTransition(async () => {
      const result = await downloadQrAction(clinicId, "png");
      if (!result.ok || !result.contentBase64 || !result.fileName) {
        addToast({
          variant: "danger",
          message: result.ok ? "Download failed." : result.message,
        });
        return;
      }
      const binary = atob(result.contentBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], {
        type: result.contentType ?? "image/png",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      a.click();
      URL.revokeObjectURL(url);
      addToast({
        variant: "success",
        message: `QR downloaded for ${clinicName}.`,
      });
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      loading={pending}
      onClick={download}
    >
      <QrCode className="h-3.5 w-3.5" aria-hidden />
      QR PNG
    </Button>
  );
}
