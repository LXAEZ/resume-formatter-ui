import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Divider,
} from "@mui/material";
import { Copy, CheckLine } from "lucide-react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import ReactJson from "react-json-view";

const JsonViewer = ({ data }) => {
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleTabChange = (_, newValue) => setTabValue(newValue);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = {
    personal: ["name", "email", "phone", "location", "summary"],
    experience: ["work_experience", "employment_history", "jobs"],
    education: ["education", "degrees", "certifications"],
    skills: ["skills", "technologies", "languages", "tools"],
  };

  const organizedData = {};
  if (data) {
    Object.keys(data).forEach((key) => {
      let found = false;
      for (const category in categories) {
        if (
          categories[category].some((term) => key.toLowerCase().includes(term))
        ) {
          found = true;
          break;
        }
      }
    });

    for (const category in categories) {
      organizedData[category] = {};
      categories[category].forEach((keyword) => {
        Object.entries(data).forEach(([key, value]) => {
          if (key.toLowerCase().includes(keyword)) {
            organizedData[category][key] = value;
          }
        });
      });
      if (Object.keys(organizedData[category]).length === 0)
        delete organizedData[category];
    }
  }

  const categoryTitles = {
    personal: "Personal Info",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          startIcon={copied ? <CheckLine size={16} /> : <Copy size={16} />}
          onClick={handleCopyJson}
          color={copied ? "success" : "primary"}
        >
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, boxShadow: 0 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="resume json tabs"
          sx={{ px: 2, pt: 1 }}
        >
          <Tab label="All Data" />
          {Object.keys(organizedData).map((key) => (
            <Tab key={key} label={categoryTitles[key] || key} />
          ))}
        </Tabs>

        <Box
          sx={{
            p: 2,
            minHeight: "400px",
            boxShadow: 0,
            overflow: "auto",
            borderRadius: 2,
          }}
        >
          <ReactJson
            src={
              tabValue === 0
                ? data
                : organizedData[Object.keys(organizedData)[tabValue - 1]]
            }
            name={null}
            theme="summerfruit:inverted"
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            collapsed={false}
            style={{ backgroundColor: "transparent" }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default JsonViewer;
