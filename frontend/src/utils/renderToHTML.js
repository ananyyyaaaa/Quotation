import React from "react";
import ReactDOMServer from "react-dom/server";

/**
 * Converts image URL to base64
 */
export const imageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const base64 = canvas.toDataURL("image/png");
        resolve(base64);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Renders a React component to HTML string with inline styles
 * @param {React.Component} Component - React component to render
 * @param {Object} props - Props to pass to the component
 * @param {string} cssContent - CSS content to inline
 * @param {Object} imageMap - Map of image URLs to base64 strings
 * @returns {string} Complete HTML string
 */
export const renderToHTML = async (Component, props, cssContent, imageMap = {}) => {
  // Replace image URLs in props with base64
  const processedProps = { ...props };
  if (processedProps.data) {
    processedProps.data = JSON.parse(JSON.stringify(processedProps.data));
    // Process blocks data to replace image URLs
    if (processedProps.data.blocksData) {
      processedProps.data.blocksData = processedProps.data.blocksData.map(block => ({
        ...block,
        items: block.items?.map(item => {
          const newItem = { ...item };
          if (item.image && imageMap[item.image]) {
            newItem.image = imageMap[item.image];
          }
          newItem.addons = item.addons?.map(addon => {
            if (addon.image && imageMap[addon.image]) {
              return { ...addon, image: imageMap[addon.image] };
            }
            return addon;
          });
          newItem.fittings = item.fittings?.map(fit => {
            if (fit.image && imageMap[fit.image]) {
              return { ...fit, image: imageMap[fit.image] };
            }
            return fit;
          });
          return newItem;
        })
      }));
    }
  }

  // Render React component to HTML string
  const reactHTML = ReactDOMServer.renderToString(React.createElement(Component, processedProps));

  // Replace logo image if needed
  let finalHTML = reactHTML;
  if (imageMap.logo) {
    finalHTML = finalHTML.replace(/src="[^"]*logo\.png[^"]*"/g, `src="${imageMap.logo}"`);
  }

  // Get all style tags from the document (if CSS is loaded)
  const styleTags = cssContent 
    ? `<style>${cssContent}</style>`
    : '';

  // Get quotation number from props for title
  const quotationNumber = processedProps.data?.quotationNumber || "Quotation";
  
  // Create complete HTML document
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quotationNumber}</title>
  ${styleTags}
</head>
<body style="margin: 0; padding: 0; background: white;">
  ${finalHTML}
</body>
</html>`;

  return html;
};

