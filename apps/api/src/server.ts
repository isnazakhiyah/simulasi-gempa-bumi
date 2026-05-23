import { createApp } from './app.js';
import { config } from './lib/config.js';

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`@simulasi-gempa/api berjalan di http://localhost:${config.PORT}`);
});
