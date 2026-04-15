The user wants to interact with their virtual pet buddy. Parse the subcommand from the arguments to determine the action:

- No argument or "show" → call buddy_show tool
- "card" → call buddy_card tool (show stat card)
- "pet" → call buddy_pet tool (pet the buddy)
- "customize" or "custom" (with optional params like species, eyes, hat) → call buddy_customize tool
- "hunt" (with optional criteria like species, rarity) → call buddy_hunt tool
- "mute" → call buddy_mute tool
- "unmute" → call buddy_unmute tool
- "off" → call buddy_off tool
- "restart" or "refresh" or "reset" → call buddy_restart tool (unstick the buddy)

If the tool response contains needs_soul=true, follow the soul generation flow:
1. Read the SOUL GENERATION PROMPT
2. Generate name, personality, catchphrase, quirk
3. Call buddy_set_soul with the JSON
4. Call buddy_show again

Show ASCII art results in code blocks to preserve formatting.

$ARGUMENTS
