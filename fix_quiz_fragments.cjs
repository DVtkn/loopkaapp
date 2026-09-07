const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                {dailyQuiz.isMatch ? (
                  <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Совпадение! Вы отлично чувствуете друг друга</span>
                  </>
                  <>
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  </>
                    <span>Разные взгляды делают вас уникальной парой!</span>
                     
              </span>`;

const replacement = `                {dailyQuiz.isMatch ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Совпадение! Вы отлично чувствуете друг друга</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-500">Разные взгляды делают вас уникальной парой!</span>
                  </>
                )}
              </span>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
