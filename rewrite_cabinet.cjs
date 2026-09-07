const fs = require('fs');
const file = 'src/components/UserProfileCabinet.tsx';
let content = fs.readFileSync(file, 'utf8');

// I'll extract all state and hooks, but replace the render logic.
const renderStart = content.indexOf('return (');
const logic = content.substring(0, renderStart);

const newRender = `  return (
    <div className="flex-1 min-h-0 flex flex-col w-full max-w-2xl mx-auto px-4 py-6 space-y-6 overflow-y-auto pb-24">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setActiveTab('home')} className="p-2 -ml-2 rounded-xl text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">Настройки</h1>
      </div>

      <section aria-labelledby="profile-title" className="app-card p-5 space-y-4">
        <h2 id="profile-title" className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wider">Мой профиль</h2>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-2xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <button onClick={handleSaveName} className="p-2 bg-[var(--accent)] text-white rounded-xl">
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-[var(--text)]">{currentUser.name}</div>
                  <div className="text-sm text-[var(--text-2)]">@{currentUser.login}</div>
                </div>
                <button onClick={() => setIsEditingName(true)} className="p-2 text-[var(--text-2)] hover:text-[var(--accent)] rounded-xl bg-[var(--surface-2)]">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="couple-title" className="app-card p-5 space-y-4">
        <h2 id="couple-title" className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wider">Наш союз</h2>
        
        {coupleProfile.partner2 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)]">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-[var(--accent)] fill-[var(--accent)]" />
                <div>
                  <div className="text-sm font-bold text-[var(--text)]">Вы в союзе с {coupleProfile.partner2.name}</div>
                  <div className="text-xs text-[var(--text-2)]">@{coupleProfile.partner2.login}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDisconnectModal(true)}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-semibold text-sm hover:bg-red-500/10 transition-colors"
            >
              Разорвать союз
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-center">
              <UserPlus className="w-8 h-8 mx-auto text-[var(--text-2)] mb-2" />
              <p className="text-sm font-medium text-[var(--text)] mb-4">Вы пока не в союзе.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Логин партнера"
                  value={targetPartnerLogin}
                  onChange={(e) => setTargetPartnerLogin(e.target.value)}
                  className="flex-1 bg-[var(--surface)] border border-[var(--divider)] rounded-xl px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={() => sendPairRequestByLogin(targetPartnerLogin)}
                  className="px-4 bg-[var(--accent)] text-white font-semibold text-sm rounded-xl"
                >
                  Связать
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="system-title" className="app-card p-5 space-y-3">
        <h2 id="system-title" className="text-sm font-semibold text-[var(--text-2)] uppercase tracking-wider mb-2">Система</h2>
        
        <button onClick={() => setShowPasswordChange(true)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] hover:bg-[var(--surface-3)] transition-colors active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface)] flex items-center justify-center border border-[var(--divider)] shadow-xs">
              <Lock className="w-5 h-5 text-[var(--text)]" />
            </div>
            <div className="text-sm font-semibold text-[var(--text)]">Изменить пароль</div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-2)]" />
        </button>

        <button onClick={authLogout} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] hover:bg-[var(--surface-3)] transition-colors active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-xs">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-sm font-semibold text-red-500">Выйти из аккаунта</div>
          </div>
        </button>
      </section>
    </div>
  );
};
`;

fs.writeFileSync(file, logic + newRender, 'utf8');
console.log('Cabinet rewritten');
