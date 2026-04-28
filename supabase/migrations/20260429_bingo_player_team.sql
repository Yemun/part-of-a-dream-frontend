-- Add required team column to bingo_players for the 2026-04-29 event.
-- Pre-condition: existing rows in bingo_players/checks/lines were truncated
-- before applying this migration (see ops note in the corresponding plan).
ALTER TABLE bingo_players
  ADD COLUMN team text NOT NULL
  CHECK (team IN ('AX팀','BX팀','앱전략팀','코어디자인팀','프로덕트디자인팀'));
