const fs = require('fs');

const chatFile = 'src/components/ChatView.tsx';
let chatContent = fs.readFileSync(chatFile, 'utf8');
chatContent = chatContent.replace(/    <\/div>\n  \);\n};\n?$/, '      </div>\n    </PageLayout>\n  );\n};\n');
fs.writeFileSync(chatFile, chatContent, 'utf8');

const datesFile = 'src/components/DatesView.tsx';
let datesContent = fs.readFileSync(datesFile, 'utf8');
datesContent = datesContent.replace(/    <\/PageLayout>\n  \);\n};\n?$/, '      </div>\n    </PageLayout>\n  );\n};\n');
fs.writeFileSync(datesFile, datesContent, 'utf8');

