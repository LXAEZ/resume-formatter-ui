import JSZip from "jszip";
import { saveAs } from "file-saver";
import { createResumePDF } from "../components/ResumePDFDownloader";
import { Document, Packer } from "docx";
import { createStyledSections } from "../components/ResumeDocxDownloader";

export const generateZipFile = async (resumes, format = "pdf") => {
  const zip = new JSZip();

  try {
    for (const resume of resumes) {
      const { filename, parsed_data } = resume;
      const baseFilename = filename.replace(/\.[^/.]+$/, ""); // Remove extension

      if (format === "pdf") {
        // Generate PDF using your existing PDF generator
        const pdf = createResumePDF(parsed_data);
        const pdfBlob = pdf.output("blob");
        zip.file(`${baseFilename}.pdf`, pdfBlob);
      } else if (format === "docx") {
        // Generate DOCX using your existing DOCX generator
        const doc = new Document({
          sections: createStyledSections(parsed_data),
        });
        const docxBlob = await Packer.toBlob(doc);
        zip.file(`${baseFilename}.docx`, docxBlob);
      }
    }

    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Download the ZIP file
    const timestamp = new Date().toISOString().slice(0, 10);
    saveAs(zipBlob, `resumes_${format}_${timestamp}.zip`);

    return true;
  } catch (error) {
    console.error("Error generating ZIP file:", error);
    throw new Error(`Failed to generate ${format.toUpperCase()} ZIP file`);
  }
};
