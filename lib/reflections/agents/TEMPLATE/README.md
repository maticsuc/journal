# TEMPLATE - Starting Point for New Agents

This folder contains a template for creating new agent personas.

## How to Create a New Agent

1. **Copy this folder**: Copy the TEMPLATE folder to a new name (e.g., `spartan-sage`, `zen-master`, `socrates`)
   ```bash
   cp -r agents/TEMPLATE agents/my-agent-name
   ```

2. **Edit the three files**:
   - `IDENTITY.md` - Who is this agent?
   - `SOUL.md` - What are its core values?
   - `INSTRUCTIONS.md` - How should it respond?

3. **Use the agent**:
   ```javascript
   import { loadAgent } from './core/agentLoader.js';
   
   const agent = await loadAgent('my-agent-name');
   const response = await agent.process('Your message here');
   ```

## Files Explained

### IDENTITY.md
- Who the agent is
- Basic personality traits and characteristics
- How the agent speaks/communicates
- Example: "I am a Stoic philosopher..." or "I am a Zen teacher..."

### SOUL.md
- Core philosophy and values
- Worldview and principles
- How the agent thinks and what it believes
- Example: "My values are compassion, wisdom, non-attachment..."

### INSTRUCTIONS.md
- How to respond to user input