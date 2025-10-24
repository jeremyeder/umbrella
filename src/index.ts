#!/usr/bin/env node

/**
 * MCP Server entry point with stdio transport
 */
import { ACPMCPServer } from './server.js';

async function main() {
  const server = new ACPMCPServer();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.shutdown();
    process.exit(0);
  });

  // Initialize and run
  try {
    await server.initialize();
    await server.run();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
