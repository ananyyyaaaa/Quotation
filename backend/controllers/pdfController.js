import puppeteer from "puppeteer";

export const generatePDF = async (req, res) => {
  try {
    const { html, filename = "quotation.pdf" } = req.body;

    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set viewport to match A4 dimensions
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI (210mm)
      height: 1123, // A4 height in pixels at 96 DPI (297mm)
    });

    // Set content with inline styles
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Wait for content to fully render and fonts to load
    await page.evaluateHandle(() => document.fonts.ready);
    await page.waitForTimeout(1000); // Give more time for rendering

    // Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      preferCSSPageSize: false, // Use A4 format instead of CSS page size
      displayHeaderFooter: false,
      scale: 1,
    });

    await browser.close();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF: " + error.message });
  }
};

