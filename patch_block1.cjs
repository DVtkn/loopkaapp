const fs = require('fs');
const content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const replacement = `
        {isPaired ? (
          <section
            id="block-1-partner-status"
            onClick={() => setShowPartnerDetailModal(true)}
            className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex items-center justify-between gap-3 transition-all hover:border-[var(--accent)]/40 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Partner Avatar with Online Indicator */}
              <div className="relative shrink-0">
                <ColoredAvatar
                  avatar={safeOtherPartner.avatar || 'heart'}
                  name={partnerName}
                  size="md"
                />
                <span
                  className={\`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-[var(--surface-solid)] \${
                    partnerStatusInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                  }\`}
                />
              </div>

              {/* Partner Name, Online Status, Mood & Days Together (3 lines) */}
              <div className="min-w-0 flex-1 space-y-0.5">
                {/* Line 1: Name + Online Status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm sm:text-base text-[var(--text)] leading-tight">
                    {partnerName}
                  </span>
                  <span className="text-[var(--text-3)] text-xs font-normal">•</span>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--text-2)] font-medium">
                    <span
                      className={\`w-1.5 h-1.5 rounded-full \${
                        partnerStatusInfo.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                      }\`}
                    />
                    <span className={partnerStatusInfo.isOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
                      {partnerStatusInfo.statusText}
                    </span>
                  </span>
                </div>

                {/* Line 2: Mood */}
                <div className="text-xs text-[var(--text-2)] flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[var(--accent)] font-semibold">Настроение:</span>
                  <span className="text-[var(--text)] font-medium">
                    {safeOtherPartner.currentMood?.label || 'Спокойствие'}
                  </span>
                </div>

                {/* Line 3: Days Together */}
                <div className="text-[11px] sm:text-xs text-[var(--text-2)] flex items-center gap-1.5 font-normal">
                  <span className="text-[var(--text)] font-medium">
                    {formatDaysTogetherDetailed(coupleProfile?.startDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tap Affordance */}
            <div className="flex items-center gap-1 text-xs font-semibold text-[var(--text-2)] group-hover:text-[var(--accent)] transition-colors shrink-0">
              <span className="hidden sm:inline">Подробнее</span>
              <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5" />
            </div>
          </section>
        ) : (
          <section
            id="block-1-partner-status-empty"
            onClick={() => setActiveTab('profile')}
            className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--divider)] shadow-xs flex items-center justify-between gap-3 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--surface-2)] cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="font-bold text-sm sm:text-base text-[var(--text)] leading-tight">
                  Пара не создана
                </div>
                <div className="text-xs sm:text-sm text-[var(--text-2)] font-medium">
                  Свяжите аккаунты, чтобы объединить тесты и аналитику
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-transform group-hover:translate-x-0.5 shrink-0" />
          </section>
        )}
`;

const regex = /<section\s+id="block-1-partner-status"[\s\S]*?<\/section>/;
const newContent = content.replace(regex, replacement.trim());

fs.writeFileSync('src/components/DashboardView.tsx', newContent);
console.log('patched dashboard');
