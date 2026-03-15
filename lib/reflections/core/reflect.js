import { loadDefaultAgent } from './agentLoader.js';

async function main() {
  const agent = await loadDefaultAgent();
  console.log('\n📖 Reflections System\n');
  console.log('Status:', agent.getStatus());
  console.log('\n---\n');
  const journalEntry = `Today was difficult. I had a conflict with a colleague at work. 
They disagreed with my approach on a project, and I felt frustrated and even angry. 
I wanted to prove I was right, but later in the day I realized I might have been defensive. 
I'm not sure how to move forward or if I handled it well. I feel conflicted about whether 
to apologize or stand my ground.`;
  console.log('Journal Entry:');
  console.log(journalEntry);
  console.log('\n---\n');
  console.log('Reflecting...\n');
  try {
    const reflection = await agent.process(journalEntry);
    console.log('Response:\n');
    console.log(reflection);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
