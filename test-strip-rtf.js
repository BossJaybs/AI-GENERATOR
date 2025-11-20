// Simple test for stripRtf function
function stripRtf(text) {
  // Remove RTF formatting if present
  if (text.startsWith('{\\rtf')) {
    // Find the matching closing brace for the outer RTF block
    let braceCount = 0;
    let endIndex = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '{') braceCount++;
      else if (text[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }
    if (endIndex !== -1 && endIndex > 1) {
      // Extract content inside the outer braces
      let rtfContent = text.slice(1, endIndex);

      // Find the start of the document content (usually after \viewkind or \pard)
      const pardIndex = rtfContent.indexOf('\\pard');
      if (pardIndex !== -1) {
        rtfContent = rtfContent.substring(pardIndex);
      } else {
        const viewkindIndex = rtfContent.indexOf('\\viewkind');
        if (viewkindIndex !== -1) {
          rtfContent = rtfContent.substring(viewkindIndex);
        }
      }

      // Handle Unicode escape sequences first (e.g., \'e9 -> é)
      rtfContent = rtfContent.replace(/\\'([0-9a-f]{2})/gi, (match, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );

      // Replace common RTF control symbols with plain text equivalents before removing other controls
      rtfContent = rtfContent.replace(/\\par/g, '\n'); // Paragraph breaks
      rtfContent = rtfContent.replace(/\\tab/g, '\t'); // Tabs
      rtfContent = rtfContent.replace(/\\line/g, '\n'); // Line breaks

      // Remove RTF control words (e.g., \rtf1, \ansi, \fs20, etc.)
      rtfContent = rtfContent.replace(/\\[a-z]+\d*\s?/gi, '');

      // Remove remaining braces (groups that don't contain text)
      rtfContent = rtfContent.replace(/[{}]/g, '');

      // Clean up multiple spaces and newlines
      rtfContent = rtfContent.replace(/\s+/g, ' ').replace(/\n\s+/g, '\n').trim();

      return rtfContent;
    }
  }
  return text;
}

// Test cases
const testCases = [
  "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\\viewkind4\\uc1\\pard\\f0\\fs20 Hello \\b world\\b0!\\par}",
  "Normal text without RTF",
  "{\\rtf1\\ansi\\ansicpg1252\\deff0\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}{\\f1\\fnil\\fcharset0 Arial;}}\\viewkind4\\uc1\\pard\\f0\\fs22 This is a test.\\par\\f1\\fs24 With formatting.\\par}",
  "{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\\viewkind4\\uc1\\pard\\f0\\fs20 H\\'e9llo w\\'f6rld\\par}"
];

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}:`);
  console.log('Input:', test);
  const output = stripRtf(test);
  console.log('Output:', JSON.stringify(output));
  console.log('---');
});