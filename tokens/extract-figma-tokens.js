const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = 'm59x7ynQM7WukKN42cFDb4';
const API_URL = 'https://api.figma.com/v1/files/' + FILE_KEY;

async function main() {
  console.log('Fetching Figma file from API...');
  const { data } = await axios.get(API_URL, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });

  console.log('File name:', data.name);
  console.log('Last modified:', data.lastModified);
  console.log('Version:', data.version);
  console.log('\nPages in document:');
  if (data.document && data.document.children) {
    data.document.children.forEach((page, idx) => {
      console.log(`  [${idx}] ${page.name} (${page.type}) — ${page.children ? page.children.length : 0} children`);
    });
  }

  // Build flattened list of all nodes with their paths
  let allNodes = [];
  function walk(node, parentPath = '') {
    const currentPath = parentPath ? parentPath + '/' + node.name : node.name;
    if (node.fills) {
      allNodes.push({
        name: node.name,
        type: node.type,
        path: currentPath,
        fills: node.fills,
      });
    }
    if (node.children) {
      node.children.forEach(c => walk(c, currentPath));
    }
  }
  if (data.document) data.document.children.forEach(p => walk(p));

  console.log(`\nNodes with fills (color candidates): ${allNodes.length}`);
  
  // Extract hex colors
  const colors = {};
  allNodes.forEach(n => {
    for (const fill of n.fills) {
      if (fill.type === 'SOLID' && fill.visible !== false) {
        const r = Math.round(fill.color.r * 255);
        const g = Math.round(fill.color.g * 255);
        const b = Math.round(fill.color.b * 255);
        const a = fill.color.a !== undefined ? fill.color.a : 1;
        const hex = '#' + r.toString(16).padStart(2,'0') + g.toString(16).padStart(2,'0') + b.toString(16).padStart(2,'0');
        colors[n.name] = a < 1 ? hex + Math.round(a*255).toString(16).padStart(2,'0') : hex;
        break;
      }
    }
  });

  console.log('\nExtracted Colors:');
  Object.entries(colors).forEach(([k,v]) => console.log(`  ${k}: ${v}`));

  // Try styles API
  try {
    const stylesRes = await axios.get(
      'https://api.figma.com/v1/files/' + FILE_KEY + '/styles',
      { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
    );
    console.log('\nStyles API results:');
    if (stylesRes.data.meta && stylesRes.data.meta.styles) {
      stylesRes.data.meta.styles.forEach((s) => {
        console.log(`  ${s.name} — ${s.styleType} — key: ${s.key}`);
      });
    } else {
      console.log('No styles in meta');
    }
    // Save styles too
    fs.writeFileSync('spotics/tokens/figma-styles.json', JSON.stringify(stylesRes.data, null, 2));
  } catch(e) {
    console.log('Styles API error:', e.message);
  }

  // Save full file for manual inspection
  const output = {
    metadata: { name: data.name, fileKey: FILE_KEY, lastModified: data.lastModified },
    colors,
    nodesWithFills: allNodes,
  };
  fs.writeFileSync('spotics/tokens/figma-extracted.json', JSON.stringify(output, null, 2));
  console.log('\n✓ Saved tokens to spotics/tokens/figma-extracted.json');
  fs.writeFileSync('spotics/tokens/figma-raw.json', JSON.stringify(data, null, 2));
  console.log('✓ Saved full file to spotics/tokens/figma-raw.json');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  if (err.response) console.error('Response:', JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
