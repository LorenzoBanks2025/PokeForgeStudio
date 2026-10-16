/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  app.use(compression());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure projects directory exists for server-backed project archives
  const projectsDir = path.join(__dirname, 'projects');
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  // API Endpoints for project file management
  app.post('/api/project/save', (req, res) => {
    try {
      const { projectName, projectData } = req.body;
      if (!projectName) {
        return res.status(400).json({ error: 'Project name is required' });
      }
      const filePath = path.join(projectsDir, `${projectName}.pokeforge.json`);
      fs.writeFileSync(filePath, JSON.stringify(projectData, null, 2));
      res.json({ success: true, path: filePath });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/projects', (req, res) => {
    try {
      const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.pokeforge.json'));
      const projects = files.map(f => {
        const stats = fs.statSync(path.join(projectsDir, f));
        return {
          name: f.replace('.pokeforge.json', ''),
          size: stats.size,
          updatedAt: stats.mtime
        };
      });
      res.json({ success: true, projects });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/project/:name', (req, res) => {
    try {
      const filePath = path.join(projectsDir, `${req.params.name}.pokeforge.json`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Project not found' });
      }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json({ success: true, project: data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite development middleware vs Static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[PokéForge Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
