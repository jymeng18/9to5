import { Fragment, useRef, useState, useEffect, useMemo } from "react";
import { getBoss } from "@/game/bosses";
import { getEvent } from "@/game/events";
import { useGameStore } from "@/game/store";

const AVATAR_COLORS = [
  "oklch(0.52 0.22 260)",   // Gary — blue
  "oklch(0.47 0.17 145)",   // Denise — green
  "oklch(0.50 0.20 20)",    // Richard — red
] as const;

function BossAvatar({ initials, bossIdx, isPlayer }: { initials: string; bossIdx: number; isPlayer?: boolean }) {
  return (
    <div className="teams-avatar" style={{ background: isPlayer ? "oklch(0.60 0.10 240)" : AVATAR_COLORS[bossIdx as 0|1|2] }}>
      {initials}
    </div>
  );
}

export function TeamsApp() {
  const teamsMessages = useGameStore((state) => state.teamsMessages);
  const teamsActiveDm = useGameStore((state) => state.teamsActiveDm);
  const setTeamsActiveDm = useGameStore((state) => state.setTeamsActiveDm);
  const sendTeamsMessage = useGameStore((state) => state.sendTeamsMessage);
  const bossIndex = useGameStore((state) => state.bossIndex);
  const activeQte = useGameStore((state) => state.activeQte);
  const activeEventId = useGameStore((state) => state.activeEventId);

  const activeEvent = useMemo(() => {
    const isReplyPrompt = activeQte === "message" && teamsActiveDm === bossIndex;
    return isReplyPrompt ? getEvent(activeEventId) : null;
  }, [activeQte, activeEventId, bossIndex, teamsActiveDm]);

  const suggestions = useMemo(() => {
    if (!activeEvent) return [];
    return [...activeEvent.answers].sort(() => Math.random() - 0.5);
  }, [activeEvent]);

  // Show DM rows for current boss + any who've messaged
  const dmBossIndexes = ([0, 1, 2] as const).filter(
    (idx) => idx <= bossIndex || teamsMessages.some((m) => m.bossIndex === idx),
  );

  const activeBoss = teamsActiveDm !== null ? getBoss(teamsActiveDm) : null;
  const activeMsgs = teamsActiveDm !== null
    ? teamsMessages.filter((m) => m.bossIndex === teamsActiveDm)
    : [];

  const [input, setInput] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMsgs.length, showReplies]);

  function handleSend() {
    if (!input.trim() || teamsActiveDm === null) return;
    sendTeamsMessage(teamsActiveDm, input.trim());
    setInput("");
    setShowReplies(false);
  }

  const unreadByBoss = ([0, 1, 2] as const).reduce<Record<number, number>>((acc, idx) => {
    acc[idx] = teamsMessages.filter((m) => m.bossIndex === idx && m.sender === "boss").length;
    return acc;
  }, {});

  return (
    <div className="teams-app">
      {/* Sidebar */}
      <nav className="teams-sidebar">
        <div className="teams-sidebar-header">
          <div className="teams-logo-icon">T</div>
          <div><strong>Microsoft Teams</strong><small>Corporate network</small></div>
        </div>
        <div className="teams-account"><span className="teams-status-dot" /> New Hire <small>Available</small></div>
        <div className="teams-nav-label">Direct Messages</div>
        {dmBossIndexes.map((idx) => {
          const boss = getBoss(idx);
          const count = teamsActiveDm === idx ? 0 : unreadByBoss[idx] ?? 0;
          return (
            <button
              key={idx}
              type="button"
              className={`teams-dm-row${teamsActiveDm === idx ? " active" : ""}`}
              onClick={() => setTeamsActiveDm(idx)}
            >
              <BossAvatar initials={boss.initials} bossIdx={idx} />
              <span className="teams-dm-name">
                <strong>{boss.name}</strong>
                <small>{boss.title}</small>
              </span>
              {count > 0 && <span className="teams-badge">{count}</span>}
            </button>
          );
        })}
        {dmBossIndexes.length === 0 && (
          <p className="teams-empty-sidebar">No messages yet.</p>
        )}
      </nav>

      {/* Main chat */}
      <div className="teams-chat">
        {activeBoss === null || teamsActiveDm === null ? (
          <div className="teams-welcome">
            <div className="teams-logo-large">T</div>
            <strong>Microsoft Teams</strong>
            <p>Select a direct message to view the conversation.</p>
          </div>
        ) : (
          <>
            <header className="teams-chat-header">
              <BossAvatar initials={activeBoss.initials} bossIdx={teamsActiveDm} />
              <div>
                <strong>{activeBoss.name}</strong>
                <small><span className="teams-status-dot" /> {activeBoss.title} · Direct message</small>
              </div>
              <div className="teams-chat-actions"><button type="button" aria-label="Start audio call">☎</button><button type="button" aria-label="More conversation options">•••</button></div>
            </header>

            <div className="teams-messages">
              {activeMsgs.length === 0 && (
                <p className="teams-no-msgs">No messages yet in this conversation.</p>
              )}
              {activeMsgs.map((msg, index) => {
                const d = new Date(msg.timestamp);
                const time = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
                const isPlayer = msg.sender === "player";
                const previous = activeMsgs[index - 1];
                const startsNewSession =
                  index > 0 &&
                  msg.session != null &&
                  previous?.session != null &&
                  msg.session !== previous.session;
                return (
                  <Fragment key={msg.id}>
                    {startsNewSession && <div className="teams-session-divider" />}
                    <div className={`teams-msg ${isPlayer ? "player" : ""}`}>
                      <BossAvatar 
                        initials={isPlayer ? "ME" : activeBoss.initials} 
                        bossIdx={teamsActiveDm} 
                        isPlayer={isPlayer} 
                      />
                      <div className="teams-msg-body">
                        <div className="teams-msg-meta">
                          <strong>{isPlayer ? "New Hire (You)" : activeBoss.name}</strong>
                          <time>{time}</time>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested replies */}
            {showReplies && suggestions.length > 0 && (
              <div className="teams-autocomplete">
                {suggestions.map((reply) => (
                  <button
                    key={reply.text}
                    type="button"
                    className="teams-autocomplete-item"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setInput(reply.text);
                      setShowReplies(false);
                    }}
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="teams-input-area">
              <div className="teams-compose">
                <div className="teams-compose-tools"><button type="button" aria-label="Format message">A</button><button type="button" aria-label="Attach file">📎</button><button type="button" aria-label="Add emoji">☺</button></div>
                <input
                  className="teams-input"
                  type="text"
                  placeholder={`Message ${activeBoss.name}…`}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setShowReplies(e.target.value === ""); }}
                  onFocus={() => setShowReplies(true)}
                  onBlur={() => setTimeout(() => setShowReplies(false), 150)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                />
              </div>
              <button type="button" className="teams-send" onClick={handleSend}>➤</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
