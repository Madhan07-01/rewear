import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './server/routes/auth';
import productsRouter from './server/routes/products';
import recommendationsRouter from './server/routes/recommendations';
import ordersRouter from './server/routes/orders';
import depositsRouter from './server/routes/deposits';
import disputesRouter from './server/routes/disputes';
import tryonRouter from './server/routes/tryon';
import chatRouter from './server/routes/chat';
import sellerRouter from './server/routes/seller';
import adminRouter from './server/routes/admin';
import demoRouter from './server/routes/demo';
import reviveRouter from './server/routes/revive';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/recommendations', recommendationsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/deposits', depositsRouter);
  app.use('/api/disputes', disputesRouter);
  app.use('/api/tryon', tryonRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/seller', sellerRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/demo', demoRouter);
  app.use('/api/revive', reviveRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'ReWear', timestamp: new Date().toISOString() });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`ReWear full-stack platform active on http://0.0.0.0:${port}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
