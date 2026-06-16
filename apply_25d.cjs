
const fs = require('fs');
const path = require('path');

const vehiclesDir = './src/components/vehicles/';
const files = fs.readdirSync(vehiclesDir).filter(file => file.endsWith('.tsx') && file !== 'types.ts' && file !== 'VehicleDefs.tsx');

files.forEach(file => {
    const filePath = path.join(vehiclesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // This regex looks for <path {...getPartProps('...', '...')} d="..." ... />
    // It captures the props, the d attribute, and the rest of the attributes.
    const regex = /<path \{\.\.\.getPartProps\('(.*)', '(.*)'\)\} d="(.*)" (.*) \/>/g;

    content = content.replace(regex, (match, id, name, d, attrs) => {
        // Don't add if already added (simple check)
        if (attrs.includes('filter="url(#part-shadow)"')) return match;

        return `<path {...getPartProps('${id}', '${name}')} d="${d}" ${attrs} filter="url(#part-shadow)" />
      <path d="${d}" fill="url(#gloss-reflex)" pointerEvents="none" />`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`Processed ${file}`);
});
