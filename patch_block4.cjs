const fs = require('fs');
const content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const replacement = `{isPaired && (
        <section id="block-4-hug-cta" className="relative">`;

const regex = /<section id="block-4-hug-cta" className="relative">/;
let newContent = content.replace(regex, replacement);

const endReplacement = `          </motion.button>
        </section>
        )}`;
const endRegex = /          <\/motion.button>\n        <\/section>/;
newContent = newContent.replace(endRegex, endReplacement);

fs.writeFileSync('src/components/DashboardView.tsx', newContent);
console.log('patched block 4');
