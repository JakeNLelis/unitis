"use client";

import { useEffect } from "react";
import { usePDF } from "@react-pdf/renderer";
import CandidacyPDF from "./candidacy-pdf";
import type { PDFPreviewProps } from "@/lib/types/public";

export default function PDFPreview({ data }: PDFPreviewProps) {
  const [instance, updateInstance] = usePDF({
    document: <CandidacyPDF data={data} />,
  });

  useEffect(() => {
    updateInstance(<CandidacyPDF data={data} />);
  }, [data, updateInstance]);

  if (!instance.url) {
    return (
      <div className="h-full w-full rounded-lg border border-border bg-card flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Rendering PDF preview...
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full rounded-lg border border-border bg-card overflow-hidden">
      <iframe
        title="Candidacy PDF Preview"
        src={instance.url}
        className="h-full w-full"
      />
      {instance.loading && (
        <div className="absolute bottom-3 right-3 rounded-md bg-background/95 border border-border px-2 py-1 text-xs text-muted-foreground">
          Updating preview...
        </div>
      )}
    </div>
  );
}
