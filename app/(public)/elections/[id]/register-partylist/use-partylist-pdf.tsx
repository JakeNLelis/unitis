import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import PartylistRegistrationPDF from "./partylist-registration-pdf";
import type { PartylistRegistrationPDFProps } from "@/lib/types/public";

export default function usePartylistPdf() {
  const [downloadState, setDownloadState] = useState<
    "idle" | "generating" | "done" | "failed"
  >("idle");
  const [pdfPayload, setPdfPayload] =
    useState<PartylistRegistrationPDFProps | null>(null);

  useEffect(() => {
    if (!pdfPayload) {
      return;
    }

    const payload = pdfPayload;
    let revokedUrl = "";

    async function generateAndDownload() {
      setDownloadState("generating");
      try {
        const blob = await pdf(
          <PartylistRegistrationPDF
            electionName={payload.electionName}
            partylistName={payload.partylistName}
            managerName={payload.managerName}
            candidates={payload.candidates}
          />,
        ).toBlob();

        const objectUrl = URL.createObjectURL(blob);
        revokedUrl = objectUrl;

        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.download = `${payload.partylistName.replace(/\s+/g, "-").toLowerCase()}-partylist-registration.pdf`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        setDownloadState("done");
      } catch (downloadError) {
        console.error(downloadError);
        setDownloadState("failed");
      }
    }

    generateAndDownload();

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [pdfPayload]);

  return { downloadState, pdfPayload, setPdfPayload };
}
