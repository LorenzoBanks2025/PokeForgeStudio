/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { RomBuilder } from './src/packages/pokecompiler/romBuilder.ts';
import { STARTER_HOENN_PROJECT } from './src/packages/pokedcomp/starterHoenn.ts';
import { STARTER_KANTO_PROJECT } from './src/packages/pokedcomp/starterKanto.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

function sanitizeProjectName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'pokeproject';
}

/**
 * Creates or overwrites a PokéProject directory with manifest.json, data/, assets/, and base_rom.gba
 */
function writeProjectDirectory(
  projectDir: string,
  projectName: string,
  game: 'emerald' | 'firered',
  project: any,
  manifestData?: any,
  dataFiles?: Record<string, any>,
  assetFiles?: Record<string, any>,
  baseRomBuffer?: Buffer
) {
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }

  const dataDir = path.join(projectDir, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const assetsDir = path.join(projectDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Write Manifest
  const manifest = manifestData || {
    format: 'pokeproject-v1',
    projectName,
    displayName: projectName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    game,
    version: project.version || '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    entryMap: Object.keys(project.maps || {})[0] || 'MAP_LITTLEROOT_TOWN',
    baseRom: {
      fileName: 'base_rom.gba',
      gameTitle: game === 'emerald' ? 'POKEMON EMER' : 'POKEMON FIRE',
      gameCode: game === 'emerald' ? 'BPEE' : 'BPRE',
      size: baseRomBuffer ? baseRomBuffer.length : 16777216,
      checksum: '0xBD'
    },
    dataFiles: {
      maps: 'data/maps.json',
      events: 'data/events.json',
      species: 'data/species.json',
      wildEncounters: 'data/wild_encounters.json',
      trainers: 'data/trainers.json',
      items: 'data/items.json',
      moves: 'data/moves.json',
      scripts: 'data/scripts.json',
      shops: 'data/shops.json'
    },
    assetFiles: {
      tilesets: 'assets/tilesets.json',
      palettes: 'assets/palettes.json'
    }
  };
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(projectDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // 2. Write Data Files
  const mapsData = dataFiles?.['maps.json'] || project.maps || {};
  const eventsData = dataFiles?.['events.json'] || {};
  if (!dataFiles?.['events.json'] && project.maps) {
    for (const [mId, mObj] of Object.entries(project.maps as Record<string, any>)) {
      eventsData[mId] = mObj.events || { npcs: [], warps: [], triggers: [], signs: [] };
    }
  }

  const dataMap: Record<string, any> = {
    'maps.json': mapsData,
    'events.json': eventsData,
    'species.json': dataFiles?.['species.json'] || project.species || {},
    'wild_encounters.json': dataFiles?.['wild_encounters.json'] || project.wildEncounters || {},
    'trainers.json': dataFiles?.['trainers.json'] || project.trainers || {},
    'items.json': dataFiles?.['items.json'] || project.items || {},
    'moves.json': dataFiles?.['moves.json'] || project.moves || {},
    'scripts.json': dataFiles?.['scripts.json'] || project.scripts || {},
    'shops.json': dataFiles?.['shops.json'] || {
      SHOP_MAIN_MART: {
        shopId: 'SHOP_MAIN_MART',
        name: `${projectName} Mart`,
        items: ['ITEM_POKE_BALL', 'ITEM_POTION', 'ITEM_ANTIDOTE', 'ITEM_ESCAPE_ROPE']
      }
    }
  };

  for (const [fileName, content] of Object.entries(dataMap)) {
    fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(content, null, 2), 'utf8');
  }

  // 3. Write Asset Files
  const assetsMap: Record<string, any> = {
    'tilesets.json': assetFiles?.['tilesets.json'] || [
      { tilesetId: 'tileset_general', metatilesCount: 256 },
      { tilesetId: 'tileset_overworld', metatilesCount: 128 }
    ],
    'palettes.json': assetFiles?.['palettes.json'] || [
      { name: 'palette_outdoor_day', colors: ['#000000', '#206020', '#40A040', '#80E080', '#D08030', '#F8E8A0', '#4080D0', '#FFFFFF'] },
      { name: 'palette_building_roofs', colors: ['#000000', '#B02020', '#E04040', '#F88080', '#606060', '#A0A0A0', '#E0E0E0', '#FFFFFF'] }
    ]
  };

  for (const [fileName, content] of Object.entries(assetsMap)) {
    fs.writeFileSync(path.join(assetsDir, fileName), JSON.stringify(content, null, 2), 'utf8');
  }

  // 4. Write Base ROM binary
  const baseRomPath = path.join(projectDir, 'base_rom.gba');
  if (baseRomBuffer) {
    fs.writeFileSync(baseRomPath, baseRomBuffer);
  } else if (!fs.existsSync(baseRomPath)) {
    // Generate valid base ROM binary
    const generatedRom = RomBuilder.buildGbaRom(project, []);
    fs.writeFileSync(baseRomPath, Buffer.from(generatedRom));
  }
}

/**
 * Seeds starter projects if projects/ is empty
 */
function seedStarterProjects(projectsDir: string) {
  try {
    const emeraldDir = path.join(projectsDir, 'pokeemerald_starter');
    if (!fs.existsSync(emeraldDir)) {
      console.log('[PokéForge Studio] Seeding starter project: pokeemerald_starter...');
      writeProjectDirectory(
        emeraldDir,
        'pokeemerald_starter',
        'emerald',
        STARTER_HOENN_PROJECT
      );
    }

    const fireredDir = path.join(projectsDir, 'pokefirered_starter');
    if (!fs.existsSync(fireredDir)) {
      console.log('[PokéForge Studio] Seeding starter project: pokefirered_starter...');
      writeProjectDirectory(
        fireredDir,
        'pokefirered_starter',
        'firered',
        STARTER_KANTO_PROJECT
      );
    }
  } catch (err: any) {
    console.warn('[PokéForge Studio] Seeding notice:', err.message);
  }
}

async function startServer() {
  const app = express();
  app.use(compression());
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Ensure projects directory exists
  const projectsDir = path.join(__dirname, 'projects');
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  // Seed default starter projects
  seedStarterProjects(projectsDir);

  // -------------------------------------------------------------
  // API: List all PokéProjects
  // -------------------------------------------------------------
  app.get('/api/projects', (req, res) => {
    try {
      const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
      const projects: any[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const projectDir = path.join(projectsDir, entry.name);
          const manifestPath = path.join(projectDir, 'manifest.json');
          const baseRomPath = path.join(projectDir, 'base_rom.gba');

          if (fs.existsSync(manifestPath)) {
            try {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
              const stats = fs.statSync(manifestPath);

              let mapsCount = 0;
              let speciesCount = 0;
              let trainersCount = 0;

              const mapsPath = path.join(projectDir, 'data', 'maps.json');
              if (fs.existsSync(mapsPath)) {
                try {
                  const mapsData = JSON.parse(fs.readFileSync(mapsPath, 'utf8'));
                  mapsCount = Object.keys(mapsData).length;
                } catch {}
              }

              const speciesPath = path.join(projectDir, 'data', 'species.json');
              if (fs.existsSync(speciesPath)) {
                try {
                  const speciesData = JSON.parse(fs.readFileSync(speciesPath, 'utf8'));
                  speciesCount = Object.keys(speciesData).length;
                } catch {}
              }

              const trainersPath = path.join(projectDir, 'data', 'trainers.json');
              if (fs.existsSync(trainersPath)) {
                try {
                  const trainersData = JSON.parse(fs.readFileSync(trainersPath, 'utf8'));
                  trainersCount = Object.keys(trainersData).length;
                } catch {}
              }

              let baseRomSize = 0;
              const hasBaseRom = fs.existsSync(baseRomPath);
              if (hasBaseRom) {
                baseRomSize = fs.statSync(baseRomPath).size;
              }

              projects.push({
                name: entry.name,
                displayName: manifest.displayName || entry.name,
                game: manifest.game || 'emerald',
                version: manifest.version || '1.0.0',
                mapsCount,
                speciesCount,
                trainersCount,
                hasBaseRom,
                baseRomSize,
                updatedAt: manifest.updatedAt || stats.mtime,
                path: `projects/${entry.name}`,
                isFolder: true
              });
            } catch (err) {
              console.warn(`Error reading manifest for ${entry.name}:`, err);
            }
          }
        } else if (entry.name.endsWith('.pokeforge.json')) {
          // Legacy single JSON project file
          const filePath = path.join(projectsDir, entry.name);
          const stats = fs.statSync(filePath);
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            projects.push({
              name: entry.name.replace('.pokeforge.json', ''),
              displayName: data.projectName || entry.name.replace('.pokeforge.json', ''),
              game: data.game || 'emerald',
              version: data.version || '1.0.0',
              mapsCount: Object.keys(data.maps || {}).length,
              speciesCount: Object.keys(data.species || {}).length,
              trainersCount: Object.keys(data.trainers || {}).length,
              hasBaseRom: false,
              updatedAt: stats.mtime,
              path: `projects/${entry.name}`,
              isFolder: false
            });
          } catch {}
        }
      }

      res.json({ success: true, projects });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: Create new project directory from uploaded ROM or starter
  // -------------------------------------------------------------
  app.post('/api/project/create', (req, res) => {
    try {
      const { projectName, game, project, manifest, data, assets, baseRomBase64 } = req.body;
      if (!projectName) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const safeName = sanitizeProjectName(projectName);
      const projectDir = path.join(projectsDir, safeName);

      let baseRomBuffer: Buffer | undefined;
      if (baseRomBase64) {
        baseRomBuffer = Buffer.from(baseRomBase64, 'base64');
      }

      writeProjectDirectory(
        projectDir,
        safeName,
        game || 'emerald',
        project,
        manifest,
        data,
        assets,
        baseRomBuffer
      );

      res.json({
        success: true,
        projectName: safeName,
        path: `projects/${safeName}`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: Load project directory
  // -------------------------------------------------------------
  app.get('/api/project/:name', (req, res) => {
    try {
      const safeName = sanitizeProjectName(req.params.name);
      const projectDir = path.join(projectsDir, safeName);

      // Check directory first
      if (fs.existsSync(projectDir) && fs.statSync(projectDir).isDirectory()) {
        const manifestPath = path.join(projectDir, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
          return res.status(404).json({ error: 'Project manifest not found' });
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const dataDir = path.join(projectDir, 'data');

        const readJson = (file: string, fallback: any = {}) => {
          const p = path.join(dataDir, file);
          if (fs.existsSync(p)) {
            try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
          }
          return fallback;
        };

        const mapsData = readJson('maps.json', {});
        const eventsData = readJson('events.json', {});
        const speciesData = readJson('species.json', {});
        const encountersData = readJson('wild_encounters.json', {});
        const trainersData = readJson('trainers.json', {});
        const itemsData = readJson('items.json', {});
        const movesData = readJson('moves.json', {});
        const scriptsData = readJson('scripts.json', {});

        // Reassemble maps + events
        const maps: Record<string, any> = {};
        for (const [mapId, mapVal] of Object.entries(mapsData as Record<string, any>)) {
          maps[mapId] = {
            layout: mapVal.layout || mapVal,
            events: eventsData[mapId] || mapVal.events || { npcs: [], warps: [], triggers: [], signs: [] }
          };
        }

        const project = {
          game: manifest.game || 'emerald',
          projectName: manifest.projectName || safeName,
          version: manifest.version || '1.0.0',
          maps,
          wildEncounters: encountersData,
          species: speciesData,
          items: itemsData,
          moves: movesData,
          trainers: trainersData,
          scripts: scriptsData
        };

        const hasBaseRom = fs.existsSync(path.join(projectDir, 'base_rom.gba'));

        return res.json({
          success: true,
          project,
          manifest,
          hasBaseRom
        });
      }

      // Check legacy single-file .pokeforge.json
      const legacyPath = path.join(projectsDir, `${req.params.name}.pokeforge.json`);
      if (fs.existsSync(legacyPath)) {
        const data = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
        return res.json({
          success: true,
          project: data,
          hasBaseRom: false
        });
      }

      res.status(404).json({ error: `Project "${req.params.name}" not found` });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: Save project directory
  // -------------------------------------------------------------
  app.post('/api/project/:name/save', (req, res) => {
    try {
      const safeName = sanitizeProjectName(req.params.name);
      const projectDir = path.join(projectsDir, safeName);
      const { project, manifest, data, assets } = req.body;

      if (!project) {
        return res.status(400).json({ error: 'Project data is required' });
      }

      writeProjectDirectory(
        projectDir,
        safeName,
        project.game || 'emerald',
        project,
        manifest,
        data,
        assets
      );

      res.json({
        success: true,
        projectName: safeName,
        path: `projects/${safeName}`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: Fetch base ROM binary
  // -------------------------------------------------------------
  app.get('/api/project/:name/base-rom', (req, res) => {
    try {
      const safeName = sanitizeProjectName(req.params.name);
      const baseRomPath = path.join(projectsDir, safeName, 'base_rom.gba');

      if (!fs.existsSync(baseRomPath)) {
        return res.status(404).json({ error: 'Base ROM binary not found in project directory' });
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}_base_rom.gba"`);
      fs.createReadStream(baseRomPath).pipe(res);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: Recompile project into ROM binary & save to project dir
  // -------------------------------------------------------------
  app.post('/api/project/:name/recompile', (req, res) => {
    try {
      const safeName = sanitizeProjectName(req.params.name);
      const projectDir = path.join(projectsDir, safeName);
      if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project directory not found' });
      }

      const { project } = req.body;
      const baseRomPath = path.join(projectDir, 'base_rom.gba');
      let baseRomBuffer: Uint8Array | undefined;

      if (fs.existsSync(baseRomPath)) {
        baseRomBuffer = new Uint8Array(fs.readFileSync(baseRomPath));
      }

      const logs: string[] = [];
      const compiledRom = RomBuilder.buildGbaRom(project, logs, baseRomBuffer);

      // Write compiled_rom.gba to project directory
      const compiledRomPath = path.join(projectDir, 'compiled_rom.gba');
      fs.writeFileSync(compiledRomPath, Buffer.from(compiledRom));

      res.json({
        success: true,
        size: compiledRom.length,
        logs,
        compiledRomPath: `projects/${safeName}/compiled_rom.gba`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: Download compiled ROM binary
  // -------------------------------------------------------------
  app.get('/api/project/:name/compiled-rom', (req, res) => {
    try {
      const safeName = sanitizeProjectName(req.params.name);
      const compiledRomPath = path.join(projectsDir, safeName, 'compiled_rom.gba');

      if (!fs.existsSync(compiledRomPath)) {
        // Fallback to base ROM if compiled ROM hasn't been built yet
        const baseRomPath = path.join(projectsDir, safeName, 'base_rom.gba');
        if (fs.existsSync(baseRomPath)) {
          res.setHeader('Content-Type', 'application/octet-stream');
          res.setHeader('Content-Disposition', `attachment; filename="${safeName}_rom.gba"`);
          return fs.createReadStream(baseRomPath).pipe(res);
        }
        return res.status(404).json({ error: 'Compiled ROM not found' });
      }

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}_compiled.gba"`);
      fs.createReadStream(compiledRomPath).pipe(res);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: List files in project directory
  // -------------------------------------------------------------
  app.get('/api/project/:name/files', (req, res) => {
    try {
      const safeName = sanitizeProjectName(req.params.name);
      const projectDir = path.join(projectsDir, safeName);

      if (!fs.existsSync(projectDir)) {
        return res.status(404).json({ error: 'Project directory not found' });
      }

      const filesList: any[] = [];

      function walk(currentDir: string, relativePrefix = '') {
        const items = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const item of items) {
          const itemRel = path.join(relativePrefix, item.name);
          const itemFull = path.join(currentDir, item.name);
          const stats = fs.statSync(itemFull);

          filesList.push({
            name: item.name,
            relativePath: itemRel,
            size: stats.size,
            mtime: stats.mtime,
            isDirectory: item.isDirectory()
          });

          if (item.isDirectory()) {
            walk(itemFull, itemRel);
          }
        }
      }

      walk(projectDir);
      res.json({ success: true, files: filesList });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // API: Read individual file content in project directory
  // -------------------------------------------------------------
  app.get('/api/project/:name/file-content', (req, res) => {
    try {
      const safeName = sanitizeProjectName(req.params.name);
      const fileRel = req.query.path as string;
      if (!fileRel) {
        return res.status(400).json({ error: 'File path parameter is required' });
      }

      // Prevent path traversal
      const safeRel = path.normalize(fileRel).replace(/^(\.\.[\/\\])+/, '');
      const fullPath = path.join(projectsDir, safeName, safeRel);

      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
        return res.status(404).json({ error: 'File not found' });
      }

      // If it's a binary file like .gba
      if (safeRel.endsWith('.gba')) {
        return res.json({
          binary: true,
          size: fs.statSync(fullPath).size,
          path: safeRel
        });
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      res.json({ success: true, path: safeRel, content });
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
