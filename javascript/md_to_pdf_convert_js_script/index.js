#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");
const puppeteer = require("puppeteer");

async function convertMarkdownToPDF(filePath) {
  if (!filePath.endsWith(".md")) {
    console.error("Please provide a .md file");
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  const dir = path.dirname(absolutePath);
  const fileName = path.basename(absolutePath, ".md");
  const outputPath = path.join(dir, `${fileName}.pdf`);

  const markdown = fs.readFileSync(absolutePath, "utf-8");

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  const htmlContent = md.render(markdown);

  const styledHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 40px;
            line-height: 1.6;
            font-size: 14px;
          }
          h1, h2, h3 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          pre {
            background: #f4f4f4;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
          }
          code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 4px;
          }
          blockquote {
            border-left: 4px solid #ccc;
            padding-left: 12px;
            color: #555;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(styledHtml, { waitUntil: "networkidle0" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  console.log(`PDF generated at: ${outputPath}`);
}

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Usage: node md-to-pdf.js file.md");
  process.exit(1);
}

convertMarkdownToPDF(inputFile);
