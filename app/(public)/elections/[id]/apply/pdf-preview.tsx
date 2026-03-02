"use client";

import { PDFViewer } from "@react-pdf/renderer";
import CandidacyPDF from "./candidacy-pdf";
import { CandidacyFormData } from "./types";

interface PDFPreviewProps {
  data: CandidacyFormData;
}

export default function PDFPreview({ data }: PDFPreviewProps) {
  return (
    <PDFViewer
      width="100%"
      height="100%"
      showToolbar={true}
      className="rounded-lg border border-gray-200"
    >
      <CandidacyPDF data={data} />
    </PDFViewer>
  );
}
