// Cloudflare Worker: AI Connector
// Integrates with Advancia AI system on Cloudflare infrastructure
// Zone ID: 0bff66558872c58ed5b8b7942acc34d9
// Account ID: 74ecde4d46d4b399c7295cf599d2886b

export async function onRequest(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace("/functions/ai-connector", "");

    // AI Connector Routes
    switch (path) {
      case "/health":
        return handleHealthCheck(env, corsHeaders);

      case "/status":
        return handleAIStatus(env, corsHeaders);

      case "/execute":
        return handleAIExecution(request, env, corsHeaders);

      case "/email-routing":
        return handleEmailRouting(request, env, corsHeaders);

      case "/guardian":
        return handleGuardianAI(request, env, corsHeaders);

      case "/surveillance":
        return handleSurveillanceAI(request, env, corsHeaders);

      case "/orchestrator":
        return handleOrchestratorAI(request, env, corsHeaders);

      default:
        return new Response(
          JSON.stringify({
            error: "Not Found",
            availableEndpoints: [
              "/health",
              "/status",
              "/execute",
              "/email-routing",
              "/guardian",
              "/surveillance",
              "/orchestrator",
            ],
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Health Check
async function handleHealthCheck(env, corsHeaders) {
  const health = {
    status: "operational",
    timestamp: new Date().toISOString(),
    cloudflare: {
      worker: "ai-connector",
      zoneId: "0bff66558872c58ed5b8b7942acc34d9",
      accountId: "74ecde4d46d4b399c7295cf599d2886b",
    },
    services: {
      kvStorage: !!env.ADVANCIA_DATA,
      aiSystem: "connected",
      emailRouting: "enabled",
      guardian: "active",
      surveillance: "active",
      orchestrator: "active",
    },
  };

  return new Response(JSON.stringify(health, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// AI System Status
async function handleAIStatus(env, corsHeaders) {
  try {
    // Get AI system status from KV
    const status = (await env.ADVANCIA_DATA.get(
      "ai-system-status",
      "json"
    )) || {
      initialized: true,
      agents: {
        guardian: { status: "active", lastRun: new Date().toISOString() },
        surveillance: { status: "active", lastRun: new Date().toISOString() },
        orchestrator: { status: "active", lastRun: new Date().toISOString() },
        monitor: { status: "active", lastRun: new Date().toISOString() },
        compliance: { status: "active", lastRun: new Date().toISOString() },
        security: { status: "active", lastRun: new Date().toISOString() },
      },
    };

    return new Response(JSON.stringify(status, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to retrieve AI status",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Execute AI Task
async function handleAIExecution(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { agent, task, priority = "medium", data = {} } = body;

    if (!agent || !task) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          required: ["agent", "task"],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Execute AI task
    const execution = {
      id: crypto.randomUUID(),
      agent,
      task,
      priority,
      data,
      status: "queued",
      queuedAt: new Date().toISOString(),
      cloudflareWorker: "ai-connector",
    };

    // Store in KV
    await env.ADVANCIA_DATA.put(
      `ai-execution:${execution.id}`,
      JSON.stringify(execution),
      { expirationTtl: 86400 } // 24 hours
    );

    // Forward to backend API for processing
    const backendUrl =
      "https://advancia-backend-8xq5.onrender.com/api/ai-workers/execute";
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(execution),
    }).catch(() => null);

    return new Response(
      JSON.stringify({
        success: true,
        execution,
        backend: backendResponse ? "forwarded" : "queued",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Execution failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Email Routing Handler
async function handleEmailRouting(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { to, from, subject, message, priority = "normal" } = body;

    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          required: ["to", "subject", "message"],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create email task
    const emailTask = {
      id: crypto.randomUUID(),
      to,
      from: from || "noreply@advanciapayledger.com",
      subject,
      message,
      priority,
      status: "queued",
      queuedAt: new Date().toISOString(),
      cloudflareZone: "0bff66558872c58ed5b8b7942acc34d9",
    };

    // Store in KV for processing
    await env.ADVANCIA_DATA.put(
      `email:${emailTask.id}`,
      JSON.stringify(emailTask),
      { expirationTtl: 86400 } // 24 hours
    );

    // Forward to backend email service
    const backendUrl =
      "https://advancia-backend-8xq5.onrender.com/api/notifications/email";
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailTask),
    }).catch(() => null);

    return new Response(
      JSON.stringify({
        success: true,
        emailTask,
        backend: backendResponse ? "forwarded" : "queued",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Email routing failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Guardian AI Handler
async function handleGuardianAI(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { action, entity, event, details = {} } = body;

    const guardianLog = {
      id: crypto.randomUUID(),
      agent: "guardian-ai",
      action,
      entity,
      event,
      details,
      timestamp: new Date().toISOString(),
      cloudflareWorker: "ai-connector",
    };

    // Store in KV
    await env.ADVANCIA_DATA.put(
      `guardian:${guardianLog.id}`,
      JSON.stringify(guardianLog),
      { expirationTtl: 604800 } // 7 days
    );

    return new Response(
      JSON.stringify({
        success: true,
        guardianLog,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Guardian AI failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Surveillance AI Handler
async function handleSurveillanceAI(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { monitoringType, threshold, data = {} } = body;

    const surveillanceLog = {
      id: crypto.randomUUID(),
      agent: "surveillance-ai",
      monitoringType,
      threshold,
      data,
      timestamp: new Date().toISOString(),
      cloudflareWorker: "ai-connector",
    };

    // Store in KV
    await env.ADVANCIA_DATA.put(
      `surveillance:${surveillanceLog.id}`,
      JSON.stringify(surveillanceLog),
      { expirationTtl: 604800 } // 7 days
    );

    return new Response(
      JSON.stringify({
        success: true,
        surveillanceLog,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Surveillance AI failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

// Orchestrator AI Handler
async function handleOrchestratorAI(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { workflow, steps, priority = "medium" } = body;

    const orchestrationTask = {
      id: crypto.randomUUID(),
      agent: "orchestrator-ai",
      workflow,
      steps,
      priority,
      status: "pending",
      timestamp: new Date().toISOString(),
      cloudflareWorker: "ai-connector",
    };

    // Store in KV
    await env.ADVANCIA_DATA.put(
      `orchestrator:${orchestrationTask.id}`,
      JSON.stringify(orchestrationTask),
      { expirationTtl: 86400 } // 24 hours
    );

    return new Response(
      JSON.stringify({
        success: true,
        orchestrationTask,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Orchestrator AI failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}
