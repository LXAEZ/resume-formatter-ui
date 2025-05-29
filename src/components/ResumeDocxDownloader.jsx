import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  SectionType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  VerticalAlign,
  BorderStyle,
  ImageRun,
  HeightRule,
  TabStopType,
} from "docx";
import { saveAs } from "file-saver";

// Add the trueBulletParagraph function
export const trueBulletParagraph = (labelText, valueText, options = {}) => {
  const bulletColor = options.bulletColor || "000000"; // Default black bullet
  const labelColor = options.labelColor || bulletColor;
  const valueColor = options.valueColor || bulletColor;

  const labelBold = options.labelBold !== undefined ? options.labelBold : false;
  const valueBold = options.valueBold !== undefined ? options.valueBold : false;
  const alignment = options.alignment || AlignmentType.LEFT;
  const lineSpacing = options.lineSpacing || 240; // Default line spacing (1.0)

  return new Paragraph({
    spacing: { after: 120, line: lineSpacing },
    indent: { left: 600, hanging: 200 },
    alignment: alignment,
    tabStops: [{ type: TabStopType.LEFT, position: 400 }],
    children: [
      new TextRun({
        text: "▪\t",
        font: "helvetica",
        size: 20,
        color: bulletColor, // Bullet color is customizable
      }),
      new TextRun({
        text: labelText,
        bold: labelBold,
        font: "helvetica",
        size: 20,
        color: labelColor,
      }),
      new TextRun({
        text: valueText,
        bold: valueBold,
        font: "helvetica",
        size: 20,
        color: valueColor,
      }),
    ],
  });
};

export const generateResumeDocx = async (data) => {
  const doc = new Document({
    sections: createStyledSections(data),
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${data.name || "resume"}.docx`);
};

const createStyledSections = (data) => {
  const leftContent = [];
  const rightContent = [];

  // === LEFT CONTENT ===

  const skillsData = data.categorized_skills || data.skills;

  leftContent.push(createSectionHeading("Technical Expertise", "FFFFFF"));
  if (Array.isArray(data.skills) && data.skills.length > 0) {
    if (Array.isArray(skillsData)) {
      skillsData.forEach((skill) => {
        leftContent.push(
          trueBulletParagraph(skill, "", {
            bulletColor: "FFFFFF",
            labelColor: "FFFFFF",
            valueColor: "FFFFFF",
            labelBold: true,
            lineSpacing: 276, // 1.15 line spacing
          })
        );
      });
    }
  } else {
    Object.entries(skillsData).forEach(([category, skillList]) => {
      if (!Array.isArray(skillList) || skillList.length === 0) return;

      const displayCategory = category
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const formattedSkills = Array.isArray(skillList)
        ? skillList.join(", ")
        : skillList;

      const skillText = `${displayCategory}: ${formattedSkills}`;

      leftContent.push(
        trueBulletParagraph(skillText, "", {
          bulletColor: "FFFFFF",
          valueColor: "FFFFFF",
          lineSpacing: 276, // 1.15 line spacing
          indent: { left: 300 },
        })
      );
    });
  }

  if (Array.isArray(data.certifications) && data.certifications.length > 0) {
    leftContent.push(createSectionHeading("Certifications", "FFFFFF"));
    data.certifications.forEach((cert) => {
      const certText =
        typeof cert === "string"
          ? cert
          : `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ""}`;
      leftContent.push(
        trueBulletParagraph("", certText, {
          bulletColor: "FFFFFF",
          valueColor: "FFFFFF",
          lineSpacing: 276, // 1.15 line spacing
        })
      );
    });
  }

  // === RIGHT CONTENT ===
  if (
    Array.isArray(data.professional_briefing) &&
    data.professional_briefing.length > 0
  ) {
    rightContent.push(
      createSectionHeading("Professional Experience", "000000")
    );
    data.professional_briefing.forEach((item) => {
      rightContent.push(
        trueBulletParagraph("", item, {
          bulletColor: "000000",
          valueColor: "000000",
          lineSpacing: 280, // 2.0 line spacing
        })
      );
    });
  }

  // 1. Original Base64 with prefix
  const ustLogoBase64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAABCCAYAAAAL1LXDAAAAAXNSR0IArs4c6QAAA7JJREFUaEPtW4111DAMliYANmgngE4ANwFlArgJoBPQm4DeBLQTlE5AmYAyAd2AbiDyBfle4vNfciZx3tnv3evrXWLpk+RPsuKwiJyQezwx85Pnt/ZrEXlORPjsDWZ+DN079jeV+YGIXhLRK0s+ZD4Q0R0z3zv1EpHfROQCfc/MqwjgayJ67wHMY0G57lPHfCYigE0ZAL9hZui4G7wEwCICT373RVMEPYCvTMQVD1g9+3MkWGOLHeglAPYtuZSw7l6DdX1eNGAROW/I6TYhZOFB8JCPgEFg70DCpQO+IqKPHsDb5vvLbibR8Aep4R6TPUBcl2aO0gGDqN4MzQIK/CsR3SyKpRvFvWlPmdeZa0NLoHQPfyKiLwEAMAi8mAy8dMBYh38S6BgVIUD/wN+GjVFtOUfRgKFxU0qGiMuHC6xtvN8rcYsHrKBReKDaGjrg+Stm3iyCpbvoRnraTHHNzGv8swgPG621EEGOdaaqiPvh6YsQ4AdmPgtNEkobTRhl3S1Z3kZ4o8B4PTDUVyHAj8x8GgE8qjAYuhAjOoDJ4XGUoTCAr7zENBsARq2Ki10D2ypnjovsYtA8eJEZ2ElKUyGy1u8AOET7yGcAvdf5EBEUBCgMXCPaPBhijGbPjiYD9OwxrmsOEYG3EXluvSIX4Ka2c6CtEwDH+okRx9quYYcAtNYruhy74l/1uHBFnrZ/ANaXwrYtsQS6HmP1PE0Jv4S1ieXmY2TTv/rVlJ/PFKTd47JFrA3glH1nKvjediz1Jvu6hMgbOnVLwrvUEdmZpE4eZfbUiTTyEMoI6RzjDDV2L1ceWM2A4NBVyNqeFRHkW4AOpZuQQcA70KvNNnvFwQgBmHDb7SrkcIdFXAALb8fybPe2Vi9l9l2W8VZDCvytWtZmPUMY2I6hTg027HMaQMtLEBka8aaPBfnmg0iDXt9ceiWXf0r5NCW4nIYycyUD/h/C55izAp7D6lPKrB6e0tpzyKoensPqU8qsHp7S2nPIqh6ew+pTyqwentLac8g6Pg9r72jMo4uQg9Dq6Z2PmsObLpnoS+fsGxkZWfvSOY1VAWeyZvVwJkMePM1RhnToBBu6lb5TNDd6jsJldTw99B4sOdhNB0wQzMORxx1ZHqkM1V0f08aa8l6DLxFw6LBaNC1WwN0QKzSkq4cdPOCtA2pI15D2HxCZKy3VNVzX8L8jxM53rpZIWt634bqe9h29WBzgoaWofX0FXHpaqh4eaIEa0sce0uh4+N79w2E0HOld1PgLGa5FbiKSBQEAAAAASUVORK5CYII=";

  // 2. Extract raw base64 (remove prefix)
  const base64String = ustLogoBase64.split(",")[1];

  // 3. Convert base64 to Uint8Array
  function base64ToUint8Array(base64) {
    const binaryString = atob(base64); // works in browser
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  const imageBytes = base64ToUint8Array(base64String);

  // 4. Create header table with proper vertical centering for both name and logo
  const headerTable = new Table({
    rows: [
      new TableRow({
        children: [
          // Logo cell - left side
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 0, after: 0 },
                children: [
                  new ImageRun({
                    data: imageBytes,
                    transformation: {
                      width: 40,
                      height: 40,
                    },
                  }),
                ],
              }),
            ],
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: "000000" },
            verticalAlign: VerticalAlign.CENTER,
            margins: { left: 600, right: 0, top: 0, bottom: 0 },
          }),
          // Name cell - center
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text: (
                      data.personal_details?.name || "Your Name"
                    ).toUpperCase(),
                    bold: true,
                    color: "FFFFFF",
                    size: 44,
                    font: "helvetica",
                  }),
                ],
              }),
            ],
            width: { size: 60, type: WidthType.PERCENTAGE },
            shading: { fill: "000000" },
            verticalAlign: VerticalAlign.CENTER,
          }),
          // Empty cell - right side for balance
          new TableCell({
            children: [new Paragraph("")],
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: "000000" },
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
        height: { value: 2000, rule: HeightRule.EXACT },
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
  });

  // === MAIN CONTENT SECTION WITH FULL-HEIGHT GREEN SIDEBAR ===
  const mainContent = [];

  // Create a table that fills the entire page content area
  const contentTable = new Table({
    rows: [
      new TableRow({
        children: [
          // LEFT SPACER - Creates gap between page edge and green sidebar
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            children: [new Paragraph("")],
            borders: {
              top: BorderStyle.NONE,
              bottom: BorderStyle.NONE,
              left: BorderStyle.NONE,
              right: BorderStyle.NONE,
            },
          }),
          // GREEN SIDEBAR - Full height
          new TableCell({
            width: { size: 32, type: WidthType.PERCENTAGE },
            shading: { fill: "166a6a" },
            children:
              leftContent.length > 0 ? leftContent : [new Paragraph("")],
            margins: {
              left: 300,
              right: 150,
              top: 300,
              bottom: 300,
            },
            borders: {
              top: BorderStyle.NONE,
              bottom: BorderStyle.NONE,
              left: BorderStyle.NONE,
              right: BorderStyle.NONE,
            },
            verticalAlign: VerticalAlign.TOP,
          }),
          // RIGHT CONTENT AREA
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            children:
              rightContent.length > 0 ? rightContent : [new Paragraph("")],
            margins: {
              top: 300,
              bottom: 300,
              left: 300,
              right: 300,
            },
            borders: {
              top: BorderStyle.NONE,
              bottom: BorderStyle.NONE,
              left: BorderStyle.NONE,
              right: BorderStyle.NONE,
            },
            verticalAlign: VerticalAlign.TOP,
          }),
        ],
        // CRITICAL: Set row height to fill entire page content area
        height: { value: 13500, rule: HeightRule.AT_LEAST }, // Approximately full page height
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
  });

  mainContent.push(contentTable);

  // === EXPERIENCE DETAIL SECTION ===
  const experienceDetail = [];

  if (Array.isArray(data.work_experience) && data.work_experience.length > 0) {
    experienceDetail.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Professional Experience",
            bold: true,
            size: 28,
            font: "helvetica",
            color: "000000",
          }),
        ],
      })
    );

    // Sort work_experience
    const isInvalid = (resps) => !Array.isArray(resps) || resps.length === 0;

    const sortedExperiences = data.work_experience.slice().sort((a, b) => {
      return isInvalid(a.responsibilities) - isInvalid(b.responsibilities);
    });

    sortedExperiences.forEach((exp) => {
      experienceDetail.push(
        trueBulletParagraph("Company: ", exp.company, {
          bulletColor: "000000",
          labelColor: "000000",
          valueColor: "000000",
          labelBold: true,
          lineSpacing: 276,
          alignment: AlignmentType.JUSTIFIED,
        })
      );

      if (exp.role) {
        experienceDetail.push(
          trueBulletParagraph("Role: ", exp.role, {
            bulletColor: "000000",
            labelColor: "000000",
            valueColor: "000000",
            labelBold: true,
            lineSpacing: 276,
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
      if (exp.start_date || exp.end_date) {
        experienceDetail.push(
          trueBulletParagraph(
            "Date: ",
            `${exp.start_date || ""} - ${exp.end_date || ""}`.trim(),
            {
              bulletColor: "000000",
              labelColor: "000000",
              valueColor: "000000",
              labelBold: false,
              valueBold: true,
              lineSpacing: 276,
              alignment: AlignmentType.JUSTIFIED,
            }
          )
        );
      }

      // Add client engagement
      if (exp.client_engagement) {
        experienceDetail.push(
          trueBulletParagraph("Client Engagement: ", exp.clientEngagement, {
            bulletColor: "000000",
            labelColor: "000000",
            valueColor: "000000",
            labelBold: true,
            lineSpacing: 276,
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }

      // Add program
      if (exp.program) {
        experienceDetail.push(
          trueBulletParagraph("Program: ", exp.program, {
            bulletColor: "000000",
            labelColor: "000000",
            valueColor: "000000",
            labelBold: true,
            lineSpacing: 276,
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }

      // Add responsibilities
      if (
        Array.isArray(exp.responsibilities) &&
        exp.responsibilities.length > 0
      ) {
        experienceDetail.push(
          trueBulletParagraph("RESPONSIBILITIES:", "", {
            bulletColor: "ffffff",
            labelColor: "000000",
            valueColor: "000000",
            labelBold: true,
            lineSpacing: 276,
            alignment: AlignmentType.JUSTIFIED,
          })
        );

        exp.responsibilities.forEach((res) => {
          if (res?.trim()) {
            experienceDetail.push(
              trueBulletParagraph("", res, {
                bulletColor: "000000",
                valueColor: "000000",
                lineSpacing: 276,
                alignment: AlignmentType.JUSTIFIED,
              })
            );
          }
        });
      }
      experienceDetail.push(new Paragraph("")); // spacer

      // Now push `experienceDetail` to your main content, wherever appropriate
    });
  }
  if (Array.isArray(data.education) && data.education.length > 0) {
    // Add Education section heading (just like "Professional Experience")
    experienceDetail.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "Education",
            bold: true,
            size: 28,
            font: "helvetica",
            color: "000000",
          }),
        ],
      })
    );

    data.education.forEach((edu) => {
      const degreeText = `${edu.degree} from ${edu.institution}`;

      experienceDetail.push(
        trueBulletParagraph("", degreeText, {
          bulletColor: "000000",
          valueColor: "000000",
          lineSpacing: 276,
          indent: { left: 400 }, // Keeps bullet indentation like before
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    });

    experienceDetail.push(new Paragraph("")); // spacer after education
  }

  // === SECTIONS STRUCTURE ===
  const sections = [
    // Header section
    {
      properties: {
        page: {
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [headerTable],
    },
    // Main content section with full-height green sidebar
    {
      properties: {
        type: SectionType.CONTINUOUS,
        page: {
          margin: { top: 720, bottom: 0, left: 0, right: 0 }, // Zero margins to allow full table control
        },
      },
      children: mainContent,
    },
  ];

  // Only add experience detail section if there's actual content
  if (experienceDetail.length > 1) {
    sections.push({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          margin: { top: 1000, bottom: 1000, left: 1200, right: 2400 },
        },
      },
      children: experienceDetail,
    });
  }

  return sections;
};

const createSectionHeading = (title, color = "000000") =>
  new Paragraph({
    spacing: { after: 150, before: 300 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        color: color,
        size: 28,
        font: "helvetica",
      }),
    ],
  });
