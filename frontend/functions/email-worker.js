// Cloudflare Email Worker
// Handles email routing with AI integration
// Zone ID: 0bff66558872c58ed5b8b7942acc34d9
// Account ID: 74ecde4d46d4b399c7295cf599d2886b

export default {
  async email(message, env, ctx) {
    // Email routing handler for Cloudflare Email Routing
    const { from, to, subject } = message;

    try {
      // Log email reception
      const emailLog = {
        id: crypto.randomUUID(),
        from,
        to,
        subject,
        receivedAt: new Date().toISOString(),
        cloudflareZone: "0bff66558872c58ed5b8b7942acc34d9",
        processed: false,
      };

      // Store in KV for AI processing
      await env.ADVANCIA_DATA.put(
        `email-received:${emailLog.id}`,
        JSON.stringify(emailLog),
        { expirationTtl: 604800 } // 7 days
      );

      // Route based on recipient
      if (to.includes("support@")) {
        await handleSupportEmail(message, env);
      } else if (to.includes("admin@")) {
        await handleAdminEmail(message, env);
      } else if (to.includes("ai@")) {
        await handleAIEmail(message, env);
      } else {
        await handleDefaultEmail(message, env);
      }

      // Forward to backend for processing
      await forwardToBackend(emailLog, env);

      return new Response("Email processed successfully");
    } catch (error) {
      console.error("Email processing failed:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};

// Support email handler
async function handleSupportEmail(message, env) {
  const supportTicket = {
    id: crypto.randomUUID(),
    type: "support",
    from: message.from,
    subject: message.subject,
    priority: "normal",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  await env.ADVANCIA_DATA.put(
    `support-ticket:${supportTicket.id}`,
    JSON.stringify(supportTicket),
    { expirationTtl: 2592000 } // 30 days
  );

  // Trigger AI support agent
  await triggerAIAgent("UserSupportAgent", supportTicket, env);
}

// Admin email handler
async function handleAdminEmail(message, env) {
  const adminAlert = {
    id: crypto.randomUUID(),
    type: "admin",
    from: message.from,
    subject: message.subject,
    priority: "high",
    createdAt: new Date().toISOString(),
  };

  await env.ADVANCIA_DATA.put(
    `admin-alert:${adminAlert.id}`,
    JSON.stringify(adminAlert),
    { expirationTtl: 604800 } // 7 days
  );

  // Trigger Guardian AI
  await triggerAIAgent("GuardianAI", adminAlert, env);
}

// AI-directed email handler
async function handleAIEmail(message, env) {
  const aiTask = {
    id: crypto.randomUUID(),
    type: "ai-task",
    from: message.from,
    subject: message.subject,
    priority: "high",
    createdAt: new Date().toISOString(),
  };

  await env.ADVANCIA_DATA.put(
    `ai-task:${aiTask.id}`,
    JSON.stringify(aiTask),
    { expirationTtl: 86400 } // 24 hours
  );

  // Trigger AI Orchestrator
  await triggerAIAgent("OrchestratorAI", aiTask, env);
}

// Default email handler
async function handleDefaultEmail(message, env) {
  const defaultLog = {
    id: crypto.randomUUID(),
    type: "general",
    from: message.from,
    to: message.to,
    subject: message.subject,
    createdAt: new Date().toISOString(),
  };

  await env.ADVANCIA_DATA.put(
    `email-general:${defaultLog.id}`,
    JSON.stringify(defaultLog),
    { expirationTtl: 604800 } // 7 days
  );
}

// Trigger AI agent
async function triggerAIAgent(agentName, data, env) {
  const task = {
    id: crypto.randomUUID(),
    agent: agentName,
    data,
    triggeredBy: "email-worker",
    timestamp: new Date().toISOString(),
    cloudflareZone: "0bff66558872c58ed5b8b7942acc34d9",
  };

  await env.ADVANCIA_DATA.put(
    `ai-trigger:${task.id}`,
    JSON.stringify(task),
    { expirationTtl: 86400 } // 24 hours
  );
}

// Forward to backend
async function forwardToBackend(emailLog, env) {
  const backendUrl =
    "https://advancia-backend-8xq5.onrender.com/api/email/process";

  try {
    await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailLog),
    });
  } catch (error) {
    console.error("Failed to forward to backend:", error);
    // Store for retry
    await env.ADVANCIA_DATA.put(
      `email-retry:${emailLog.id}`,
      JSON.stringify(emailLog),
      { expirationTtl: 86400 }
    );
  }
}
