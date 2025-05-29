import React, { useRef, useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable"; // For better table support in PDF
import { generateResumeDocx } from "./ResumeDocxDownloader";
import { ArrowLeft, FileJson, FileIcon as FilePdf } from "lucide-react";
import ExportDropdown from "./ExportDropdown";

const formatDateRange = (start, end) => {
  if (!start && !end) return "";
  if (!start) return `Until ${end}`;
  if (!end) return `${start} - Present`;
  return `${start} - ${end}`;
};

const ResumePreview = ({ parsedData }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [error, setError] = useState(null);

  // Constants for page layout
  const PAGE_TOP_MARGIN = 20;
  const PAGE_BOTTOM_MARGIN = 20; // Bottom margin for all pages

  // Generate PDF on component mount
  useEffect(() => {
    generatePDFPreview();
    // Cleanup function to revoke the blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [parsedData]);

  const handleDownloadDocx = async () => {
    if (!parsedData) return;

    setDownloadingDocx(true);
    try {
      await generateResumeDocx(parsedData);
    } catch (err) {
      setError(err.message || "DOCX download error");
      console.error(err);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const hasData = (section) => {
    if (!section) return false;
    if (Array.isArray(section)) return section.length > 0;
    if (typeof section === "object") return Object.keys(section).length > 0;
    return Boolean(section);
  };

  // Function to add green sidebar to any page
  const addGreenSidebar = (pdf, startY = null) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const extraMarginTop = 7;

    // If it's the first page, account for header
    const isFirstPage = pdf.internal.getCurrentPageInfo().pageNumber === 1;
    const headerHeight = isFirstPage ? 45 : 0;
    const topStart = isFirstPage
      ? headerHeight + extraMarginTop
      : PAGE_TOP_MARGIN;

    pdf.setFillColor(31, 116, 123); // #1F747B
    const greenBoxHeight = pageHeight - topStart - PAGE_BOTTOM_MARGIN;
    pdf.rect(margin, topStart, pageWidth * 0.35, greenBoxHeight, "F");
  };

  const createPDF = () => {
    // Create new PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Add header background (black box)
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, 45, "F");

    // Add UST logo (you'll need to handle this properly)
    // Base64 string for UST logo
    const ustLogoBase64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAABCCAYAAAAL1LXDAAAAAXNSR0IArs4c6QAAA7JJREFUaEPtW4111DAMliYANmgngE4ANwFlArgJoBPQm4DeBLQTlE5AmYAyAd2AbiDyBfle4vNfciZx3tnv3evrXWLpk+RPsuKwiJyQezwx85Pnt/ZrEXlORPjsDWZ+DN079jeV+YGIXhLRK0s+ZD4Q0R0z3zv1EpHfROQCfc/MqwjgayJ67wHMY0G57lPHfCYigE0ZAL9hZui4G7wEwCICT373RVMEPYCvTMQVD1g9+3MkWGOLHeglAPYtuZSw7l6DdX1eNGAROW/I6TYhZOFB8JCPgEFg70DCpQO+IqKPHsDb5vvLbibR8Aep4R6TPUBcl2aO0gGDqN4MzQIK/CsR3SyKpRvFvWlPmdeZa0NLoHQPfyKiLwEAMAi8mAy8dMBYh38S6BgVIUD/wN+GjVFtOUfRgKFxU0qGiMuHC6xtvN8rcYsHrKBReKDaGjrg+Stm3iyCpbvoRnraTHHNzGv8swgPG621EEGOdaaqiPvh6YsQ4AdmPgtNEkobTRhl3S1Z3kZ4o8B4PTDUVyHAj8x8GgE8qjAYuhAjOoDJ4XGUoTCAr7zENBsARq2Ki10D2ypnjovsYtA8eJEZ2ElKUyGy1u8AOET7yGcAvdf5EBEUBCgMXCPaPBhijGbPjiYD9OwxrmsOEYG3EXluvSIX4Ka2c6CtEwDH+okRx9quYYcAtNYruhy74l/1uHBFnrZ/ANaXwrYtsQS6HmP1PE0Jv4S1ieXmY2TTv/rVlJ/PFKTd47JFrA3glH1nKvjediz1Jvu6hMgbOnVLwrvUEdmZpE4eZfbUiTTyEMoI6RzjDDV2L1ceWM2A4NBVyNqeFRHkW4AOpZuQQcA70KvNNnvFwQgBmHDb7SrkcIdFXAALb8fybPe2Vi9l9l2W8VZDCvytWtZmPUMY2I6hTg027HMaQMtLEBka8aaPBfnmg0iDXt9ceiWXf0r5NCW4nIYycyUD/h/C55izAp7D6lPKrB6e0tpzyKoensPqU8qsHp7S2nPIqh6ew+pTyqwentLac8g6Pg9r72jMo4uQg9Dq6Z2PmsObLpnoS+fsGxkZWfvSOY1VAWeyZvVwJkMePM1RhnToBBu6lb5TNDd6jsJldTw99B4sOdhNB0wQzMORxx1ZHqkM1V0f08aa8l6DLxFw6LBaNC1WwN0QKzSkq4cdPOCtA2pI15D2HxCZKy3VNVzX8L8jxM53rpZIWt634bqe9h29WBzgoaWofX0FXHpaqh4eaIEa0sce0uh4+N79w2E0HOld1PgLGa5FbiKSBQEAAAAASUVORK5CYII=";

    // Create black header
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, 45, "F");

    // Header center point calculation
    const headerCenterY = 45 / 2; // Vertical center of header

    // Add UST logo to header - vertically centered
    pdf.addImage(ustLogoBase64, "PNG", 7, headerCenterY - 5, 10, 10); // 5 is half the logo height

    // Add name in header - centered horizontally and vertically
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");

    // Convert the text to uppercase using toUpperCase()
    const name = (
      parsedData.personal_details?.name || "Unnamed Candidate"
    ).toUpperCase();
    const headerCenterX = pageWidth / 2; // Horizontal center of header

    pdf.text(name, headerCenterX, headerCenterY, {
      align: "center",
      baseline: "middle",
    });

    // Add green sidebar to first page
    addGreenSidebar(pdf);

    // Set variables for content positioning
    const leftColumnX = margin + 7;
    const leftColumnWidth = pageWidth * 0.35 - 20;
    const rightColumnX = margin + pageWidth * 0.35 + 5;
    const rightColumnWidth = pageWidth - rightColumnX - margin;

    const extraMarginTop = 7;
    let leftYPosition = 55 + extraMarginTop;
    let rightYPosition = 55 + extraMarginTop;
    let currentRightPage = 1;

    // Function to add section title
    const addSectionTitle = (title, x, y, isWhiteText = false) => {
      if (isWhiteText) {
        pdf.setTextColor(255, 255, 255);
      } else {
        pdf.setTextColor(0, 0, 0);
      }
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, x, y);
      return y + 5; // Return new Y position after title
    };

    // Function to add bullet point item with drawn square bullet
    const addBulletPoint = (
      text,
      x,
      y,
      maxWidth,
      isWhiteText = false,
      lineSpacing = 5 // default for other sections
    ) => {
      if (isWhiteText) {
        pdf.setTextColor(255, 255, 255);
        pdf.setFillColor(255, 255, 255);
      } else {
        pdf.setTextColor(0, 0, 0);
        pdf.setFillColor(0, 0, 0);
      }

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      // Draw a small square bullet (2mm x 2mm)
      pdf.rect(x, y - 1.5, 1, 1, "F");

      // Split text to fit within column width
      const textLines = pdf.splitTextToSize(text, maxWidth - 5);
      pdf.text(textLines, x + 5, y);

      // Apply custom line spacing
      return y + textLines.length * lineSpacing;
    };

    // LEFT COLUMN CONTENT - Track left column pages separately
    let leftColumnPages = []; // Track which pages have left column content
    let currentLeftPage = 1;
    // Technical Expertise Section in left column
    const skillsData = parsedData.categorized_skills || parsedData.skills;

    if (hasData(skillsData)) {
      // Check if we need a new page for left column
      if (leftYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
        pdf.addPage();
        currentLeftPage++;
        addGreenSidebar(pdf);
        leftYPosition = PAGE_TOP_MARGIN + 10;
        leftColumnPages.push(currentLeftPage);
      }

      leftYPosition = addSectionTitle(
        "Technical Expertise",
        leftColumnX,
        leftYPosition,
        true
      );

      if (Array.isArray(skillsData)) {
        skillsData.forEach((skill) => {
          if (leftYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            currentLeftPage++;
            addGreenSidebar(pdf);
            leftYPosition = PAGE_TOP_MARGIN + 10;
            leftColumnPages.push(currentLeftPage);
          }

          leftYPosition = addBulletPoint(
            skill,
            leftColumnX + 5,
            leftYPosition,
            leftColumnWidth,
            true,
            4
          );
        });
      } else {
        Object.entries(skillsData).forEach(([category, skillList]) => {
          if (!Array.isArray(skillList) || skillList.length === 0) return;

          if (leftYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            currentLeftPage++;
            addGreenSidebar(pdf);
            leftYPosition = PAGE_TOP_MARGIN + 10;
            leftColumnPages.push(currentLeftPage);
          }

          const displayCategory = category
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          const formattedSkills = Array.isArray(skillList)
            ? skillList.join(", ")
            : skillList;

          const skillText = `${displayCategory}: ${formattedSkills}`;

          leftYPosition = addBulletPoint(
            skillText,
            leftColumnX + 5,
            leftYPosition,
            leftColumnWidth,
            true,
            4 // reduced spacing
          );

          leftYPosition += 0;
        });
      }

      leftYPosition += 4;
    }

    // Certifications Section in left column
    if (hasData(parsedData.certifications)) {
      if (leftYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
        pdf.addPage();
        currentLeftPage++;
        addGreenSidebar(pdf);
        leftYPosition = PAGE_TOP_MARGIN + 10;
        leftColumnPages.push(currentLeftPage);
      }

      leftYPosition = addSectionTitle(
        "Certifications",
        leftColumnX,
        leftYPosition,
        true
      );

      parsedData.certifications.forEach((cert) => {
        if (leftYPosition > pageHeight - PAGE_BOTTOM_MARGIN - 10) {
          pdf.addPage();
          currentLeftPage++;
          addGreenSidebar(pdf);
          leftYPosition = PAGE_TOP_MARGIN + 10;
          leftColumnPages.push(currentLeftPage);
        }

        const certText =
          typeof cert === "string"
            ? cert
            : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ""}`;

        leftYPosition = addBulletPoint(
          certText,
          leftColumnX + 5,
          leftYPosition,
          leftColumnWidth,
          true,
          4
        );
      });
    }

    // RIGHT COLUMN CONTENT - Professional Briefing Section
    // Stay on current page for right column content
    pdf.setPage(1);

    if (hasData(parsedData.professional_briefing)) {
      // Reset right column position to first page
      rightYPosition = 55 + extraMarginTop;
      currentRightPage = 1;

      // Add title on first page right column
      rightYPosition = addSectionTitle(
        "Professional Experience",
        rightColumnX,
        rightYPosition
      );

      // Add professional briefing bullet points
      if (Array.isArray(parsedData.professional_briefing)) {
        parsedData.professional_briefing.forEach((point) => {
          // Estimate text height for this point
          const textLines = pdf.splitTextToSize(point, rightColumnWidth - 5);
          const estimatedHeight = textLines.length * 5 + 2;

          // Check if current content will fit on current page
          if (
            rightYPosition + estimatedHeight >
            pageHeight - PAGE_BOTTOM_MARGIN
          ) {
            // Check if we need to create a new page or go to an existing one
            const totalPages = pdf.internal.getNumberOfPages();
            const nextPageNumber = currentRightPage + 1;

            if (nextPageNumber <= totalPages) {
              // Go to existing page
              pdf.setPage(nextPageNumber);
            } else {
              // Create new page
              pdf.addPage();
              addGreenSidebar(pdf);
            }

            currentRightPage = nextPageNumber;
            rightYPosition = PAGE_TOP_MARGIN + 10;
          }

          // Make sure we're on the correct page
          pdf.setPage(currentRightPage);

          rightYPosition = addBulletPoint(
            point,
            rightColumnX + 5,
            rightYPosition + 2,
            rightColumnWidth - 15
          );
        });
      }

      rightYPosition += 5; // Space after the section
    }

    const sortedExperience = [...parsedData.work_experience].sort((a, b) => {
      const aHasResp = hasData(a.responsibilities) ? 1 : 0;
      const bHasResp = hasData(b.responsibilities) ? 1 : 0;
      return bHasResp - aHasResp; // Entries with responsibilities first
    });

    // Experience Section - Move to new page only if we have content
    if (hasData(parsedData.work_experience)) {
      // Always move to new page for experience section
      pdf.addPage();
      rightYPosition = PAGE_TOP_MARGIN;

      // Center-align the Professional Experience title on the new page
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      const expTitle = "Professional Experience";
      pdf.text(expTitle, leftColumnX + 10, rightYPosition);

      rightYPosition += 8; // Space after title

      // Set new wider margins
      const leftRightMargin = 30; // wider margin
      const newPageRightColumnX = leftRightMargin;
      const newPageRightColumnWidth = pageWidth - 2 * leftRightMargin;
      const expIndentation = 6;

      sortedExperience.forEach((job, index) => {
        // Check if we need a new page
        if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
          pdf.addPage();
          rightYPosition = PAGE_TOP_MARGIN;
        }

        // Company
        if (job.company) {
          pdf.setFontSize(10);

          const bulletX = newPageRightColumnX + expIndentation;
          const textX = bulletX + 5;
          const y = rightYPosition;

          pdf.setFillColor(0, 0, 0);
          pdf.rect(bulletX, y - 1.8, 1, 1, "F");

          const label = "Company: ";
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 0, 0);
          pdf.text(label, textX, y);

          const labelWidth = pdf.getTextWidth(label);
          pdf.setFont("helvetica", "normal");
          pdf.text(job.company, textX + labelWidth, y);

          rightYPosition += 5;
        }

        // Date
        if (job.start_date || job.end_date) {
          if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            rightYPosition = PAGE_TOP_MARGIN;
          }

          pdf.setFontSize(10);

          const bulletX = newPageRightColumnX + expIndentation;
          const textX = bulletX + 5;
          const y = rightYPosition;

          pdf.setFillColor(0, 0, 0);
          pdf.rect(bulletX, y - 1.8, 1, 1, "F");

          const label = "Date: ";
          pdf.setFont("helvetica", "normal");
          pdf.text(label, textX, y);

          const labelWidth = pdf.getTextWidth(label);
          pdf.setFont("helvetica", "bold");
          const dateText = formatDateRange(job.start_date, job.end_date);
          pdf.text(dateText, textX + labelWidth, y);

          rightYPosition += 5;
        }

        // Role
        if (job.role) {
          if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            rightYPosition = PAGE_TOP_MARGIN;
          }

          const bulletX = newPageRightColumnX + expIndentation;
          const textX = bulletX + 5;
          const y = rightYPosition;

          pdf.setFillColor(0, 0, 0);
          pdf.rect(bulletX, y - 1.8, 1, 1, "F");

          const label = "Role: ";
          pdf.setFont("helvetica", "bold");
          pdf.text(label, textX, y);

          const labelWidth = pdf.getTextWidth(label);
          pdf.setFont("helvetica", "normal");
          const lines = pdf.splitTextToSize(
            job.role,
            newPageRightColumnWidth - (textX + labelWidth - newPageRightColumnX)
          );
          pdf.text(lines, textX + labelWidth, y);

          rightYPosition += lines.length * 5;
        }

        // Client Engagement
        if (job.client_engagement) {
          if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            rightYPosition = PAGE_TOP_MARGIN;
          }

          const bulletX = newPageRightColumnX + expIndentation;
          const textX = bulletX + 5;
          const y = rightYPosition;

          pdf.setFillColor(0, 0, 0);
          pdf.rect(bulletX, y - 1.8, 1, 1, "F");

          const label = "Client: ";
          pdf.setFont("helvetica", "bold");
          pdf.text(label, textX, y);

          const labelWidth = pdf.getTextWidth(label);
          pdf.setFont("helvetica", "normal");
          const lines = pdf.splitTextToSize(
            job.client_engagement,
            newPageRightColumnWidth - (textX + labelWidth - newPageRightColumnX)
          );
          pdf.text(lines, textX + labelWidth, y);

          rightYPosition += lines.length * 5;
        }

        // Program
        if (job.program) {
          if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            rightYPosition = PAGE_TOP_MARGIN;
          }

          const bulletX = newPageRightColumnX + expIndentation;
          const textX = bulletX + 5;
          const y = rightYPosition;

          pdf.setFillColor(0, 0, 0);
          pdf.rect(bulletX, y - 1.8, 1, 1, "F");

          const label = "Program: ";
          pdf.setFont("helvetica", "bold");
          pdf.text(label, textX, y);

          const labelWidth = pdf.getTextWidth(label);
          pdf.setFont("helvetica", "normal");
          const lines = pdf.splitTextToSize(
            job.program,
            newPageRightColumnWidth - (textX + labelWidth - newPageRightColumnX)
          );
          pdf.text(lines, textX + labelWidth, y);

          rightYPosition += lines.length * 5;
        }

        // Responsibilities
        if (hasData(job.responsibilities)) {
          if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            rightYPosition = PAGE_TOP_MARGIN;
          }

          // Section title
          pdf.text("", newPageRightColumnX + expIndentation, rightYPosition);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.text(
            "RESPONSIBILITIES: ",
            newPageRightColumnX + expIndentation + 5,
            rightYPosition
          );
          rightYPosition += 5;

          // Bullet list
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          job.responsibilities.forEach((resp) => {
            if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
              pdf.addPage();
              rightYPosition = PAGE_TOP_MARGIN;
            }

            rightYPosition = addBulletPoint(
              resp,
              newPageRightColumnX + expIndentation,
              rightYPosition,
              newPageRightColumnWidth
            );
          });
        }

        rightYPosition += 5;

        // Space between jobs
        if (index < parsedData.work_experience.length - 1) {
          rightYPosition += 5;
          if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            rightYPosition = PAGE_TOP_MARGIN;
          }
        }
      });
      rightYPosition += 5;

      // EDUCATION (moved to bottom of right column)
      if (hasData(parsedData.education)) {
        if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
          pdf.addPage();
          rightYPosition = PAGE_TOP_MARGIN;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Education", newPageRightColumnX, rightYPosition);
        rightYPosition += 6;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);

        parsedData.education.forEach((edu) => {
          if (rightYPosition > pageHeight - PAGE_BOTTOM_MARGIN) {
            pdf.addPage();
            rightYPosition = PAGE_TOP_MARGIN;
          }
          const bulletX = newPageRightColumnX + 6; // add indentation similar to experience
          const textX = bulletX + 5;

          const y = rightYPosition;

          pdf.setFillColor(0, 0, 0);
          pdf.rect(bulletX, y - 1.8, 1, 1, "F");

          const degreeText = `${edu.degree} from ${edu.institution}`;
          const degreeLines = pdf.splitTextToSize(
            degreeText,
            newPageRightColumnWidth - 5
          );
          pdf.text(degreeLines, textX, y);

          rightYPosition += degreeLines.length * 5;
        });

        rightYPosition += 5;
      }
    }

    return pdf;
  };

  const generatePDFPreview = async () => {
    setIsGenerating(true);
    try {
      const pdf = createPDF();

      // Get PDF as blob
      const pdfBlob = pdf.output("blob");

      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob);

      // Set the URL to state
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF preview: ", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    try {
      const pdf = createPDF();
      // Save the PDF
      pdf.save(`${parsedData.personal_details?.name || "Resume"}.pdf`);
    } catch (error) {
      console.error("Error downloading PDF: ", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Resume Preview
        </Typography>

        <ExportDropdown
          downloadPDF={downloadPDF}
          handleDownloadDocx={handleDownloadDocx}
          downloadingDocx={downloadingDocx}
        />
      </Stack>

      {isGenerating ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>Generating PDF preview...</Typography>
        </Box>
      ) : pdfUrl ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 2,
          }}
        >
          <iframe
            src={pdfUrl}
            style={{
              width: "750px", // A4 width in points (~8.27in * 72)
              height: "842px", // A4 height in points (~11.69in * 72)
            }}
            title="Resume PDF Preview"
          />
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>Failed to generate PDF preview.</Typography>
          <Button
            variant="outlined"
            onClick={generatePDFPreview}
            sx={{ mt: 2 }}
          >
            Retry Preview
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ResumePreview;
