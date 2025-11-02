// Test All Agents
// Run all agents once to verify they work correctly

import { PrismaClient } from "@prisma/client";
import { getAgentScheduler } from "../src/agents/scheduler";

const prisma = new PrismaClient();

async function testAllAgents() {
  console.log("\n🧪 Testing All Agents\n");
  
  const scheduler = getAgentScheduler(prisma);
  scheduler.initialize();
  
  const agents = [
    "MonitorAgent",
    "TransactionAuditAgent",
    "CryptoRecoveryAgent",
    "UserSupportAgent",
    "AdminInsightAgent",
    "SecurityFraudAgent",
    "CompliancePolicyAgent",
    "CostOptimizationAgent",
    "DeployOrchestratorAgent",
  ];
  
  const results: { agent: string; success: boolean; duration: number; error?: string }[] = [];
  
  for (const agentName of agents) {
    console.log(`\n▶️  Testing ${agentName}...`);
    
    try {
      const result = await scheduler.executeAgent(agentName);
      
      results.push({
        agent: agentName,
        success: result.success,
        duration: result.metrics.duration,
      });
      
      if (result.success) {
        console.log(`   ✅ Passed (${result.metrics.duration}ms) - ${result.metrics.itemsProcessed} items`);
      } else {
        console.log(`   ⚠️  Warning: ${result.message}`);
      }
      
    } catch (error: any) {
      results.push({
        agent: agentName,
        success: false,
        duration: 0,
        error: error.message,
      });
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  // Summary
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("Test Summary");
  console.log("═══════════════════════════════════════════════════════════════\n");
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Agents: ${agents.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log("\n⚠️  Failed Agents:");
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.agent}: ${r.error || "Unknown error"}`);
      });
  }
  
  console.log("\n═══════════════════════════════════════════════════════════════\n");
  
  scheduler.stop();
  await prisma.$disconnect();
  
  if (failed > 0) {
    process.exit(1);
  }
}

testAllAgents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test suite failed:");
    console.error(error);
    process.exit(1);
  });
