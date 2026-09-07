const fs = require('fs');
const file = 'src/components/RelationshipRadar.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                  {/* Dual Comparison Progress Bar */}
                  <div className="space-y-1.5 my-2.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-2)]">
                      <span className="text-[var(--accent-blue)] font-bold">{p1Label}: {m.p1Score}%</span>
                      <span className="text-[var(--accent)] font-bold">{p2Label}: {m.p2Score}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--divider)] overflow-hidden flex">
                      <div
                        className="h-full rounded-l-full bg-[var(--accent-blue)] transition-all duration-500"
                        style={{ width: \`\${m.p1Score / 2}%\` }}
                      />
                      <div
                        className="h-full rounded-r-full bg-[var(--accent)] ml-0.5 transition-all duration-500"
                        style={{ width: \`\${m.p2Score / 2}%\` }}
                      />
                    </div>
                  </div>`;

const replacement = `                  {/* Bridge of 20 Steps Metaphor */}
                  <div className="space-y-2 my-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)]">
                      <span className="text-[var(--accent-blue)] truncate max-w-[120px]">{p1Label}: {m.p1Steps} {m.p1Steps === 1 ? 'шаг' : (m.p1Steps >= 2 && m.p1Steps <= 4 ? 'шага' : 'шагов')}</span>
                      {m.gapSteps === 0 ? (
                        <span className="text-emerald-500 font-extrabold px-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-2xs">Встретились!</span>
                      ) : (
                        <span className="text-[var(--text-2)]">{m.gapSteps} {m.gapSteps === 1 ? 'шаг' : (m.gapSteps >= 2 && m.gapSteps <= 4 ? 'шага' : 'шагов')} разрыв</span>
                      )}
                      <span className="text-[var(--accent)] truncate max-w-[120px] text-right">{m.p2Steps} {m.p2Steps === 1 ? 'шаг' : (m.p2Steps >= 2 && m.p2Steps <= 4 ? 'шага' : 'шагов')} :{p2Label}</span>
                    </div>
                    
                    <div className="w-full flex items-center justify-between gap-[2px] h-3.5 p-0.5 rounded-full overflow-hidden bg-[var(--surface-2)] border border-[var(--divider)] shadow-inner">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const isP1 = i < m.p1Steps;
                        const isP2 = i >= 20 - m.p2Steps;
                        
                        let bgColor = 'bg-transparent';
                        if (isP1) bgColor = 'bg-[var(--accent-blue)] shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-sm';
                        else if (isP2) bgColor = 'bg-[var(--accent)] shadow-[0_0_8px_rgba(239,68,68,0.6)] rounded-sm';

                        return (
                          <div 
                            key={i} 
                            className={\`flex-1 h-full transition-all duration-700 \${bgColor}\`} 
                          />
                        );
                      })}
                    </div>
                  </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Replaced successfully');
} else {
  console.log('Target not found');
}
