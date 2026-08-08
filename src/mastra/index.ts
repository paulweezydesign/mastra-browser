import { Mastra } from '@mastra/core/mastra';
import { LibSQLStore } from '@mastra/libsql';
import {
  Observability,
  MastraStorageExporter,
  SensitiveDataFilter,
} from '@mastra/observability';
import { browserAgent } from './agents/browser-agent';
import { MastraEditor } from '@mastra/editor';

export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),
  agents: { browserAgent },
  editor: new MastraEditor(),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra-browser',
        exporters: [
          // Persists traces to LibSQL so they show up in Studio → Observability
          new MastraStorageExporter(),
        ],
        spanOutputProcessors: [
          // Redacts passwords, tokens, keys, etc. from span payloads
          new SensitiveDataFilter(),
        ],
      },
    },
  }),
});
