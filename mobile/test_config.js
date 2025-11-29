try {
  const config = require('./metro.config.js');
  console.log('Config loaded successfully');
} catch (error) {
  console.error('Error loading config:', error);
}
