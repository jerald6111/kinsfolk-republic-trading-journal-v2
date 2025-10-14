const fs = require('fs');

const files = [
  'src/pages/VisionBoard.tsx',
  'src/pages/Journal.tsx',
  'src/pages/Charts.tsx'
];

const emojiMap = {
  'ðŸŽ‰': '🎉',
  'ðŸ†': '🏆',
  'â­': '⭐',
  'ðŸ'ª': '💪',
  'ðŸš€': '🚀',
  'ðŸŽ¯': '🎯',
  'âœï¸': '✏️',
  'âž•': '➕',
  'ðŸ"': '📝',
  'ðŸ'°': '💰',
  'ðŸ"…': '📅',
  'ðŸ'¾': '💾',
  'âœ¨': '✨',
  'âœ"': '✓',
  'ðŸ"Š': '📊',
  'ðŸ"ˆ': '📈'
};

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    Object.keys(emojiMap).forEach(bad => {
      const good = emojiMap[bad];
      content = content.split(bad).join(good);
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✓ Fixed emojis in ${file}`);
  } catch (err) {
    console.error(`✗ Error processing ${file}:`, err.message);
  }
});

console.log('Done!');
