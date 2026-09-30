/**
 * Seed Workload Generator Script
 * Populates initial processes into the SwapOS engine
 */
function seedInitialProcesses(scheduler) {
  console.log('[Seed] Populating baseline processes into SwapOS engine...');

  const sampleProcesses = [
    { name: 'OS_Kernel_Subsystem', memoryRequired: 1024, priority: 10 },
    { name: 'Graphics_Compositor', memoryRequired: 2048, priority: 8 },
    { name: 'Browser_Engine', memoryRequired: 4096, priority: 6 },
    { name: 'Database_Server', memoryRequired: 4096, priority: 7 },
    { name: 'Code_IDE', memoryRequired: 2048, priority: 5 }
  ];

  sampleProcesses.forEach(proc => {
    scheduler.createAndAllocateProcess(proc);
  });

  console.log(`[Seed] Seeded ${sampleProcesses.length} initial processes successfully.`);
}

module.exports = { seedInitialProcesses };
