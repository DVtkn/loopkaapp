const fs = require('fs');
const file = 'src/components/RelationshipRadar.tsx';
let content = fs.readFileSync(file, 'utf8');

const headerTarget = `<div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-2)]">
            5 ключевых метрик союза
          </h4>
          <span className="text-[11px] text-[var(--text-2)] font-medium">
            Нажмите для разбора
          </span>
        </div>`;
const headerReplacement = `<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-2)]">
            5 ключевых метрик союза
          </h4>
          <span className="text-[11px] text-[var(--text-2)] font-medium">
            Нажмите для разбора
          </span>
        </div>`;

content = content.replace(headerTarget, headerReplacement);

const stepsTarget = `<div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)]">
                      <span className="text-[var(--accent-blue)] truncate max-w-[120px]">{p1Label}: {m.p1Steps} {m.p1Steps === 1 ? 'шаг' : (m.p1Steps >= 2 && m.p1Steps <= 4 ? 'шага' : 'шагов')}</span>
                      {m.gapSteps === 0 ? (
                        <span className="text-emerald-500 font-extrabold px-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-2xs">Встретились!</span>
                      ) : (
                        <span className="text-[var(--text-2)]">{m.gapSteps} {m.gapSteps === 1 ? 'шаг' : (m.gapSteps >= 2 && m.gapSteps <= 4 ? 'шага' : 'шагов')} разрыв</span>
                      )}
                      <span className="text-[var(--accent)] truncate max-w-[120px] text-right">{m.p2Steps} {m.p2Steps === 1 ? 'шаг' : (m.p2Steps >= 2 && m.p2Steps <= 4 ? 'шага' : 'шагов')} :{p2Label}</span>
                    </div>`;

const stepsReplacement = `<div className="flex items-end justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)] relative">
                      <div className="flex flex-col items-start min-w-0 max-w-[35%]">
                        <span className="text-[var(--accent-blue)] truncate w-full" title={p1Label}>{p1Label}</span>
                        <span className="text-[var(--accent-blue)]">{m.p1Steps}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-end px-1 shrink-0 absolute left-1/2 -translate-x-1/2 bottom-0">
                        {m.gapSteps === 0 ? (
                          <span className="text-emerald-500 font-extrabold px-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-2xs whitespace-nowrap">Встретились!</span>
                        ) : (
                          <span className="text-[var(--text-2)] whitespace-nowrap">{m.gapSteps} {m.gapSteps === 1 ? 'шаг' : (m.gapSteps >= 2 && m.gapSteps <= 4 ? 'шага' : 'шагов')} разрыв</span>
                        )}
                      </div>

                      <div className="flex flex-col items-end min-w-0 max-w-[35%] text-right">
                        <span className="text-[var(--accent)] truncate w-full" title={p2Label}>{p2Label}</span>
                        <span className="text-[var(--accent)]">{m.p2Steps}</span>
                      </div>
                    </div>`;

content = content.replace(stepsTarget, stepsReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Patch applied successfully');
