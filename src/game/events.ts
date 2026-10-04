import type { BossId } from "./bosses";

export type AnswerQuality = "best" | "ok" | "bad";

export interface EventAnswer {
  text: string;
  quality: AnswerQuality;
  reply: string;
}

export interface CorporateEvent {
  id: string;
  boss: BossId;
  when?: "afk";
  prompt: string;
  answers: EventAnswer[];
}

export const EVENTS: CorporateEvent[] = [
  {
    id: "gary-deadline",
    boss: "manager",
    prompt:
      "Can you get me the expense report by 10? I know that's tight but leadership is asking.",
    answers: [
      {
        text: "Yes. I'll drop everything else and make 10 work.",
        quality: "bad",
        reply:
          "Perfect. That's the ownership I like to see. Everything else is still due today.",
      },
      {
        text: "I can do a partial cut by 10 and the full report by lunch — would that unblock leadership?",
        quality: "best",
        reply:
          "Hm. Fine. Send the partial by 10 and I'll manage up from there.",
      },
      {
        text: "10 is tight but I'll try my best.",
        quality: "ok",
        reply: "I'd rather have a real time than a brave one. Keep me posted.",
      },
      {
        text: "Honestly the finance system is the reason these take so long. Nothing I can do.",
        quality: "bad",
        reply: "Noted. I'll remember that when I write the review.",
      },
    ],
  },
  {
    id: "gary-credit",
    boss: "manager",
    prompt:
      "I'm going to present your forecast findings to the regional call. You don't mind if I take the lead?",
    answers: [
      {
        text: "Of course, it's a team effort.",
        quality: "ok",
        reply:
          "That's the spirit. I'll make sure they know it came from within the team.",
      },
      {
        text: "Happy to — want me to build the slides so the numbers land the way I found them?",
        quality: "best",
        reply: "Good thinking. Send the slides. I'll present.",
      },
      {
        text: "I'd prefer to present my own work, actually.",
        quality: "bad",
        reply: "Bold. Let's revisit that at your next check-in.",
      },
      {
        text: "Sure, but the C3 correction is the whole story — make sure that's front and center.",
        quality: "ok",
        reply: "Fine, fine. I'll lead with the correction.",
      },
    ],
  },
  {
    id: "gary-blame",
    boss: "manager",
    prompt:
      "The onboarding form is still sitting in the wrong folder. Did you forget it?",
    answers: [
      {
        text: "I filed it where I was told. Can we check the folder together?",
        quality: "best",
        reply: "…Ah. HR moved the folder. My mistake. Carry on.",
      },
      {
        text: "Sorry, that's on me. I'll fix it right now.",
        quality: "ok",
        reply: "Appreciate the accountability. Get it sorted.",
      },
      {
        text: "It's probably HR's process. Nothing I can control.",
        quality: "bad",
        reply:
          "Interesting. I'll pass that along to HR, who asked me to ask you.",
      },
      {
        text: "I'll look into it.",
        quality: "ok",
        reply: "Let me know what you find. Soon would be better.",
      },
    ],
  },
  {
    id: "gary-sync",
    boss: "manager",
    prompt:
      "Quick sync? Should take five minutes. I have some thoughts on how you're tracking.",
    answers: [
      {
        text: "Sure, my calendar is wide open.",
        quality: "bad",
        reply: "Great! It's a 45-minute block. I'll send the invite.",
      },
      {
        text: "Yes — can you send an agenda so I can come prepared?",
        quality: "best",
        reply: "Agenda? It's just a chat. But sure, I'll write something down.",
      },
      {
        text: "I'm mid-deliverable. Can it wait until I hit a stopping point?",
        quality: "ok",
        reply:
          "Alright, but 'mid-deliverable' isn't a status I can report upward.",
      },
      {
        text: "Can we do it async? Just send notes.",
        quality: "ok",
        reply: "I'd rather see your face while I explain the tracking problem.",
      },
    ],
  },
  {
    id: "denise-operationalize",
    boss: "seniorManager",
    prompt:
      "Let's operationalize the learnings from the revenue model before we socialize the next iteration.",
    answers: [
      {
        text: "Absolutely — which learnings are we operationalizing?",
        quality: "best",
        reply:
          "Good question. I'll send a note. Actually, you write it. That's the learning.",
      },
      {
        text: "Understood. I'll operationalize the learnings immediately.",
        quality: "bad",
        reply: "Perfect. I look forward to seeing whatever that means.",
      },
      {
        text: "Can we define the scope before we socialize it? I don't want to over-rotate.",
        quality: "ok",
        reply:
          "Reasonable. Define the scope, then we operationalize. Keep it tight.",
      },
      {
        text: "I think we should pause and align on the pre-read first.",
        quality: "ok",
        reply:
          "Now you're speaking my language. Pre-read to align on the pre-read.",
      },
    ],
  },
  {
    id: "denise-red-rows",
    boss: "seniorManager",
    prompt:
      "Can you just delete the red rows before the workstream review? They're confusing people.",
    answers: [
      {
        text: "Done. Consider them deleted.",
        quality: "bad",
        reply: "Lovely. The numbers look so much healthier already.",
      },
      {
        text: "I can hide them, but I'd rather flag why they're red — that's the actual signal.",
        quality: "best",
        reply:
          "…Fine. Keep them, but put a one-line summary on top so nobody panics.",
      },
      {
        text: "Delete them? That feels like it changes the record.",
        quality: "ok",
        reply:
          "It's a working file, not the record. But noted, thank you for the rigor.",
      },
      {
        text: "Which rows are red? I can look.",
        quality: "ok",
        reply: "The ones you'd expect. Use your judgment.",
      },
    ],
  },
  {
    id: "denise-socialize",
    boss: "seniorManager",
    prompt:
      "Can you socialize this across the workstream and collect the feedback by EOD?",
    answers: [
      {
        text: "Sure, I'll chase everyone personally until it's done.",
        quality: "bad",
        reply: "Excellent. I'll add the adjacent workstream too, for coverage.",
      },
      {
        text: "Happy to — who are the three people whose feedback actually changes the decision?",
        quality: "best",
        reply: "Smart. I'll name them. Ignore the rest.",
      },
      {
        text: "That's a big group. Can I send a form instead of chasing?",
        quality: "ok",
        reply:
          "A form is fine. Make sure it has a deadline or nobody opens it.",
      },
      {
        text: "I don't own that workstream, so I'm not sure I'm the right person.",
        quality: "bad",
        reply: "You are now. Congratulations on the expanded remit.",
      },
    ],
  },
  {
    id: "denise-bus",
    boss: "seniorManager",
    prompt:
      "In the review, I'm going to note that the model slipped because the data team was slow. Sound right?",
    answers: [
      {
        text: "Yes, that's accurate.",
        quality: "bad",
        reply:
          "Good. I'll cc their lead. This is exactly the sort of clarity we need.",
      },
      {
        text: "I'd frame it as a dependency we had, not a delay they caused — keeps the room on the model.",
        quality: "best",
        reply: "Hm. Diplomatic. I'll steal that phrasing.",
      },
      {
        text: "I don't think the data team was the problem.",
        quality: "ok",
        reply:
          "Noted. I'll present it as 'shared velocity challenges' then. Everyone wins.",
      },
      {
        text: "Can I review the wording before it goes out?",
        quality: "ok",
        reply: "Of course. It's your workstream. Mostly.",
      },
    ],
  },
  {
    id: "richard-deck",
    boss: "vp",
    prompt: "Visibility is accountability. Where is the executive-ready deck?",
    answers: [
      {
        text: "It's 80% there. I wanted to get the story right before I showed anyone.",
        quality: "ok",
        reply: "The story is irrelevant if nobody can see it. Send the 80%.",
      },
      {
        text: "It's ready. I'll send the one-pager now and the appendix by end of day.",
        quality: "best",
        reply:
          "Good. Executives read one page. The appendix is for your own comfort.",
      },
      {
        text: "I'm still waiting on legal feedback before it's board-safe.",
        quality: "ok",
        reply:
          "Then send a draft marked DRAFT. Visibility first, precision second.",
      },
      {
        text: "It's not ready yet. I'll send it when it's good.",
        quality: "bad",
        reply:
          "By the time it's good, the decision will be made without you. Resend when it's visible.",
      },
    ],
  },
  {
    id: "richard-red-rows",
    boss: "vp",
    prompt:
      "Before the board meeting, remove the risk flags from the outlook. We don't want noise in the narrative.",
    answers: [
      {
        text: "Understood. Removing them now.",
        quality: "bad",
        reply:
          "Excellent. The narrative is clean. If anyone asks, the model always looked like this.",
      },
      {
        text: "I'll keep the flags but move them to an appendix so the main view stays clean.",
        quality: "best",
        reply:
          "…Acceptable. An appendix is where risks go to be forgotten gracefully.",
      },
      {
        text: "Is that appropriate for a board document?",
        quality: "ok",
        reply:
          "It's a presentation, not a filing. But I appreciate you asking. Once.",
      },
      {
        text: "I'll delete the rows, but I'd like it minuted that I flagged them.",
        quality: "ok",
        reply: "Noted and denied. Just clean the deck.",
      },
    ],
  },
  {
    id: "richard-volunteer",
    boss: "vp",
    prompt:
      "I need someone to own the transformation workstream. I thought of you. It's high visibility.",
    answers: [
      {
        text: "I'd be honored. I'll take the whole thing.",
        quality: "bad",
        reply:
          "Excellent. I'll announce it. Scope to follow. So will the scrutiny.",
      },
      {
        text: "I'd like to own a defined slice of it. Which workstream is actually orphaned?",
        quality: "best",
        reply:
          "The orphaned one. Good instinct — that's the one that needs a name on it.",
      },
      {
        text: "What would success look like in the first 30 days?",
        quality: "ok",
        reply: "Visibility. If people don't know you own it, you don't own it.",
      },
      {
        text: "I'm at capacity, but I can support whoever owns it.",
        quality: "bad",
        reply: "'Support' isn't an owner. Find capacity.",
      },
    ],
  },
  {
    id: "richard-legal",
    boss: "vp",
    prompt:
      "Those contract comments are sensitive. Just archive them somewhere quiet until this blows over.",
    answers: [
      {
        text: "Sure, I'll tuck them away.",
        quality: "bad",
        reply:
          "Good. Quiet is a strategy. Let's keep this between us, legally speaking.",
      },
      {
        text: "I can archive them, but we should keep a dated copy in the retention folder — in case legal asks.",
        quality: "best",
        reply: "Fine. Retention it is. You didn't hear me suggest otherwise.",
      },
      {
        text: "Are we required to preserve these? I don't want to be on the wrong side of retention.",
        quality: "ok",
        reply:
          "Careful. You're starting to sound like compliance. Archive them properly and we're fine.",
      },
      {
        text: "Where exactly is 'somewhere quiet'?",
        quality: "ok",
        reply: "You know. The folder nobody opens until the auditors do.",
      },
    ],
  },
  {
    id: "gary-afk-1",
    boss: "manager",
    when: "afk",
    prompt:
      "No activity from your workstation for a while now. Are you still at your desk?",
    answers: [
      {
        text: "I stepped away for a moment — I'm back now and returning to the expense report.",
        quality: "best",
        reply:
          "Good. I'd hate to report that your chair was the only thing working.",
      },
      {
        text: "Yes, I've been working the whole time. The tracker must be off.",
        quality: "bad",
        reply: "The tracker is fine. I can see the tracker fine.",
      },
      {
        text: "I took a short personal break. It won't affect the deliverable.",
        quality: "ok",
        reply:
          "Fine. Just narrate your breaks to me next time and we're aligned.",
      },
      {
        text: "How long have you been monitoring my desk?",
        quality: "bad",
        reply:
          "That is not the question, and now it's also a documented question.",
      },
    ],
  },
  {
    id: "gary-afk-2",
    boss: "manager",
    when: "afk",
    prompt: "Your status shows Away. Should I assume you've stepped out?",
    answers: [
      {
        text: "I was reading through the forecast away from the screen — typing up the correction now.",
        quality: "best",
        reply: "Good. Thinking is allowed. Silent thinking is a risk.",
      },
      {
        text: "I'm here. Just thinking before I start.",
        quality: "ok",
        reply: "Alright. Think faster, visibly.",
      },
      {
        text: "Away status means nothing. I'm always working.",
        quality: "bad",
        reply: "Then fix the status. Perception is the product.",
      },
      {
        text: "I'll reset my status so it's accurate from now on.",
        quality: "ok",
        reply: "That's the spirit. Managing perception is the job.",
      },
    ],
  },
  {
    id: "denise-afk-1",
    boss: "seniorManager",
    when: "afk",
    prompt:
      "The workstream has shown you as idle. Can you clarify your availability for the next hour?",
    answers: [
      {
        text: "I'm available and back at the desk — I stepped away briefly.",
        quality: "best",
        reply: "Appreciated. Availability is a deliverable too.",
      },
      {
        text: "I'll be heads-down reading the model, so the tracker may show idle while I review.",
        quality: "best",
        reply:
          "Good call. Set your status so the narrative matches the workstream.",
      },
      {
        text: "Idle doesn't mean unavailable.",
        quality: "bad",
        reply: "To an observer it does. Manage the observer.",
      },
      {
        text: "I can share a status so my availability is visible.",
        quality: "ok",
        reply: "Yes. Visibility is a shared responsibility. Mostly yours.",
      },
    ],
  },
  {
    id: "denise-afk-2",
    boss: "seniorManager",
    when: "afk",
    prompt:
      "No keystrokes for a stretch. Should I assume you've disengaged from the workstream?",
    answers: [
      {
        text: "I was reviewing the revenue model offline — typing the update now.",
        quality: "best",
        reply:
          "Understood. Next time, review it where the keystrokes can see you.",
      },
      {
        text: "I stepped away. Back and re-engaged.",
        quality: "ok",
        reply: "Good. I'll note the re-engagement.",
      },
      {
        text: "Keystrokes aren't a measure of my thinking.",
        quality: "bad",
        reply: "They're the measure we have. Work with it.",
      },
      {
        text: "Let's align on what 'engaged' looks like so we're not guessing.",
        quality: "ok",
        reply: "Reasonable. I'll define engagement and socialize it.",
      },
    ],
  },
  {
    id: "richard-afk-1",
    boss: "vp",
    when: "afk",
    prompt:
      "Visibility is accountability, and right now I see neither. Are you at your post?",
    answers: [
      {
        text: "I'm here and actioning the deck now.",
        quality: "best",
        reply: "Good. Send proof of action within the hour.",
      },
      {
        text: "I stepped away briefly. It won't be visible going forward.",
        quality: "ok",
        reply: "Make sure it isn't. The leadership team notices patterns.",
      },
      {
        text: "Away status is not an accurate measure of output.",
        quality: "bad",
        reply: "It's the only measure that made it to the board pack.",
      },
      {
        text: "Define 'at my post'.",
        quality: "bad",
        reply: "At your post. At your keyboard. Visible. Next question.",
      },
    ],
  },
  {
    id: "richard-afk-2",
    boss: "vp",
    when: "afk",
    prompt:
      "Your station has gone quiet. Confirm you are working, not wandering.",
    answers: [
      {
        text: "I'm working through the board numbers — correction coming now.",
        quality: "best",
        reply: "Good. I'll hold the narrative until it lands.",
      },
      {
        text: "I was away for a moment. Back at the station.",
        quality: "ok",
        reply: "Moments add up. I do the math quarterly.",
      },
      {
        text: "I don't need to prove I'm working.",
        quality: "bad",
        reply: "You just did. For the record: not ideal.",
      },
      {
        text: "I'll keep my status visible while I'm heads-down.",
        quality: "ok",
        reply: "Do. Visibility is the whole strategy.",
      },
    ],
  },
];

export function getEvent(id: string | null): CorporateEvent | null {
  return EVENTS.find((event) => event.id === id) ?? null;
}

export function pickEvent(
  boss: BossId,
  recent: string[],
  context?: "afk",
): CorporateEvent {
  const byBoss = EVENTS.filter((event) => event.boss === boss);
  const byContext = byBoss.filter((event) =>
    context === "afk" ? event.when === "afk" : event.when !== "afk",
  );
  const pool = byContext.filter((event) => !recent.includes(event.id));
  const source =
    pool.length > 0 ? pool : byContext.length > 0 ? byContext : byBoss;
  const picked = source[Math.floor(Math.random() * source.length)] ?? EVENTS[0];
  return picked!;
}
