<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep all 9to5 game state in the Zustand store under `src/game`; this preserves resumable windows and one authoritative game loop.
- Keep the Windows XP shell as app-owned React/CSS rather than importing the legacy React 16 runtime; this avoids SSR and dependency conflicts.
