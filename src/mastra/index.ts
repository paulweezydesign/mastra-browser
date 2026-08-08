import { Mastra } from '@mastra/core/mastra';
import { MastraCompositeStore } from '@mastra/core/storage';
import { DuckDBStore } from '@mastra/duckdb';
import { LibSQLStore } from '@mastra/libsql';
import {
  Observability,
  MastraStorageExporter,
  SensitiveDataFilter,
} from '@mastra/observability';
import { browserAgent } from './agents/browser-agent';
import { MastraEditor } from '@mastra/editor';

export const mastra = new Mastra({
  // LibSQL for app/memory data; DuckDB for traces/metrics/logs (LibSQL lacks metrics).
  storage: new MastraCompositeStore({
    id: 'composite-storage',
    default: new LibSQLStore({
      id: 'mastra-storage',
      url: 'file:./mastra.db',
    }),
    domains: {
      observability: new DuckDBStore({
        path: './mastra-observability.duckdb',
      }).observability,
    },
  }),
  agents: { browserAgent },
  editor: new MastraEditor(),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra-browser',
        exporters: [
          // Persists traces/metrics/logs so they show up in Studio → Observability
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
