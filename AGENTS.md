# Phase 10 - Game Rules & Development Guide

## Overview
Phase 10 is a commercial variant of Contract Rummy—a set-collection card game driven by hand management, sequential progression, and race conditions. First player to complete Phase 10 wins.

## Deck & Cards

### 108-Card Custom Deck
- **Number Cards:** Numbers 1–12 in four colors (Red, Yellow, Green, Blue), two copies of each = 96 cards
- **Wild Cards:** 8 total (2 per color)
- **Skip Cards:** 4 total (1 per color)

### Card Types
- **Set:** Matching numbers (colors ignored)
- **Run:** Consecutive numbers, any color (colors do NOT matter for runs)

## The 10 Phase Contracts

| Phase | Required Combination |
|-------|---------------------|
| 1 | 2 sets of 3 |
| 2 | 1 set of 3 + 1 run of 4 |
| 3 | 1 set of 4 + 1 run of 4 |
| 4 | 1 run of 7 |
| 5 | 1 run of 8 |
| 6 | 1 run of 9 |
| 7 | 2 sets of 4 |
| 8 | 7 cards of 1 color |
| 9 | 1 set of 5 + 1 set of 2 |
| 10 | 1 set of 5 + 1 set of 3 |

## Turn Structure

Every turn follows a strict sequence:

1. **Draw (Mandatory):** Take 1 card from either the face-down Draw Pile or top of the Discard Pile.
2. **Meld Phase (Optional):** Lay down the current round's required combination all at once. Partial melds are illegal.
3. **Hit (Optional):** Attach matching cards from your hand onto *any* completed Phase on the table (yours or opponents'). Only available *after* you have laid down your own Phase.
4. **Discard (Mandatory):** Place 1 card face-up on the Discard Pile to terminate your turn. Exception: if you played every card in your hand, round ends immediately.

## Disruption Mechanics

### Wild Cards
- Substitute for any number or color required in a Phase
- **Natural Card Requirement:** Every set or run must contain at least one natural (non-wild) card
- **Permanent Lock-in:** Once placed on the table, cannot be replaced or retrieved
- **Color Substitution:** Wilds can represent any color to satisfy Phase 8

### Skip Cards
- **Discard Pile Restriction:** May NEVER be picked up from the discard pile
- **Targeting:** Can target any player, not just the next in turn order
- **Stacking Limit:** A player cannot be skipped twice in the same round until they have actually missed their assigned turn
- **Phase Ineligibility:** Cannot be used as a card to complete any Phase (including Phase 8)
- Played during the discard step to force a targeted opponent to miss their upcoming turn

## Laying & Hitting Edge Cases

- **All-at-Once Laydown:** Full Phase requirement must be laid down simultaneously; partial sets/runs on the board are illegal
- **Immediate Hitting:** You may hit on your own or opponents' Phases during the exact same turn you lay down your initial Phase
- **Hand Depletion:** If you play every card in your hand onto valid Phase combinations, you go out immediately—final discard is not mandatory

## Round End & Scoring

### Round End
Triggers immediately when one player empties their hand.

### Phase Advancement
- Players who successfully laid down their Phase advance to the next Phase in the following round
- Players who failed remain on their current Phase

### Penalty Points (remaining hand cards)
- Cards 1–9: 5 points each
- Cards 10–12: 10 points each
- Skip Cards: 15 points each
- Wild Cards: 25 points each

## Draw Pile Exhaustion

- If the draw pile empties, shuffle the discard pile (except the top face-up card) to create a new draw pile

## Victory Condition

- First player to complete Phase 10 wins
- **Tie-Breaker:** Lowest accumulated penalty score
- If scores are identical, tied players play a single tie-breaker round attempting Phase 10 again

## Opening Deal

- Every player receives 10 cards to start each round
- If the dealer flips a Wild card to start the discard pile, the first player may claim it
- If a Skip card is flipped, the first player's turn is skipped immediately

## Birthday Configuration

- `src/react/birthday/birthdayConfig.ts` contains all customizable strings
- Player names, welcome message, bot quips are all editable from one file
- Currently: Kimberly (player), Christopher (bot), Ahmad (bot)

## Development Guidelines

### Architecture
- Game engine (`src/engine/`) must be pure TypeScript with zero UI dependencies
- React layer (`src/react/`) handles only rendering and user interaction
- All game logic must be testable independently

### Key Rules to Never Violate
1. Partial melds are NEVER allowed - all-or-nothing laydown
2. Wilds ALWAYS need at least one natural card in the meld
3. Skips CANNOT be picked from discard pile
4. Skips CANNOT complete any phase
5. Hitting is ONLY available after you've laid down your own phase
6. Round ends IMMEDIATELY when a player empties their hand (no mandatory final discard)
7. Cards 1-9 = 5pts penalty, 10-12 = 10pts, Skip = 15pts, Wild = 25pts
8. Runs are consecutive numbers, any color (color does NOT matter)
9. Sets must be same number, different colors (or wilds filling gaps)
10. Phase 8 is 7 cards of one color (no consecutive requirement)

### Tech Stack
- React 19 + TypeScript + Vite 8
- `motion/react` for animations (Reorder, AnimatePresence, spring physics)
- `canvas-confetti` for celebration effects
- Web Audio API for procedural sounds
- Web Speech API for bot voice synthesis

---

## Tier 3 Backlog (Future Features)

### Physical Phase Peg Board
- Replace text-based phase tracker with a visual peg board
- Animated pegs step forward from Phase 1→10 as rounds finish
- Brass/wood aesthetic mounted on the side of the table

### End-of-Match Recap Screen
- Victory podium with custom awards:
  - "Most Skipped Player" — tracked via skip count per player
  - "Wild Card Hoarder" — who played/discarded the most wilds
  - "Phase Speedrunner" — fewest rounds to complete current phase
- Requires engine stat tracking (skips received, wilds used, rounds per phase)

### Atmospheric Audio Toggle
- Optional low-key jazz lounge background track
- Subtle casino table ambiance
- Toggle button in header
- Needs royalty-free audio asset or complex procedural synth

### Advanced Card Physics
- Cloth/felt simulation on card landing
- Card collision detection during fan layout
- Physics-based card spring when released from drag
