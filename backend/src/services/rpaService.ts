import prisma from "../prismaClient";
import { createOALLog } from "./oalService";
import { OALStatus } from "@prisma/client";

interface RPAWorkflowData {
  name: string;
  description?: string;
  trigger: any;
  actions: any;
  enabled?: boolean;
  createdById: string;
}

interface RPAExecutionData {
  workflowId: string;
  result?: Record<string, any>;
}

interface WorkflowAction {
  type: string;
  params: Record<string, any>;
}

interface ExecutionStep {
  action: string;
  status: string;
  result?: any;
  error?: string;
  timestamp: Date;
}

export async function createWorkflow(data: RPAWorkflowData) {
  return await prisma.rPAWorkflow.create({
    data: {
      name: data.name,
      description: data.description,
      trigger: data.trigger || {},
      actions: data.actions || [],
      enabled: data.enabled !== false,
      createdById: data.createdById,
    },
  });
}

export async function getWorkflows(filters: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, any> = {};
  if (filters.status) where.status = filters.status;

  const [items, count] = await Promise.all([
    prisma.rPAWorkflow.findMany({
      where,
      include: {
        _count: {
          select: { executions: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters.limit,
      skip: filters.offset,
    }),
    prisma.rPAWorkflow.count({ where }),
  ]);

  return { items, count };
}

export async function getWorkflowById(id: string) {
  return await prisma.rPAWorkflow.findUnique({
    where: { id },
    include: {
      executions: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function updateWorkflow(
  id: string,
  data: Partial<RPAWorkflowData>
) {
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  

  return await prisma.rPAWorkflow.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteWorkflow(id: string) {
  return await prisma.rPAWorkflow.delete({
    where: { id },
  });
}

export async function executeWorkflow(data: RPAExecutionData) {
  const workflow = await prisma.rPAWorkflow.findUnique({
    where: { id: data.workflowId },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  if (!workflow.enabled) {
    throw new Error("Workflow is disabled");
  }

  const execution = await prisma.rPAExecution.create({
    data: {
      workflowId: data.workflowId,
      status: "RUNNING", trigger: {}, steps: [], },
  });

  // Update workflow last run time
  await prisma.rPAWorkflow.update({
    where: { id: data.workflowId },
    data: {
      },
  });

  // Execute workflow asynchronously
  executeWorkflowSteps(
    execution.id,
    data.workflowId,
    // Default actions if not provided
    (data.result as any)?.actions || []
  ).catch(async (error: Error) => {
    await prisma.rPAExecution.update({
      where: { id: execution.id },
      data: {
        status: "FAILED",
        completedAt: new Date(), error: error.message,
        },
    });

    await prisma.rPAWorkflow.update({
      where: { id: data.workflowId },
      data: { },
    });
  });

  return execution;
}

async function executeWorkflowSteps(
  executionId: string,
  workflowId: string,
  actions: WorkflowAction[]
) {
  const steps: ExecutionStep[] = [];

  try {
    for (const action of actions) {
      const stepResult = await executeAction(action);
      steps.push({
        action: action.type,
        status: "SUCCESS",
        timestamp: new Date(),
      });
    }

    // Mark as completed
    await prisma.rPAExecution.update({
      where: { id: executionId },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        },
    });

    await prisma.rPAWorkflow.update({
      where: { id: workflowId },
      data: { },
    });
  } catch (error: any) {
    steps.push({
      action: "error",
      status: "FAILED",
      error: error.message || "Unknown error",
      timestamp: new Date(),
    });

    await prisma.rPAExecution.update({
      where: { id: executionId },
      data: {
        status: "FAILED",
        completedAt: new Date(), error: error.message,
        },
    });

    await prisma.rPAWorkflow.update({
      where: { id: workflowId },
      data: { },
    });

    throw error;
  }
}

async function executeAction(action: WorkflowAction): Promise<any> {
  switch (action.type) {
    case "create_oal_log":
      return await createOALLog({
        object: action.params.object,
        action: action.params.action,
        location: action.params.location || "rpa.automation",
        subjectId: action.params.subjectId,
        metadata: action.params.metadata || {},
        createdById: action.params.createdById || "system",
        status: action.params.status || OALStatus.PENDING,
      });

    case "approve_oal":
      return await prisma.oAL.update({
        where: { id: action.params.logId },
        data: { status: OALStatus.APPROVED },
      });

    case "reject_oal":
      return await prisma.oAL.update({
        where: { id: action.params.logId },
        data: { status: OALStatus.REJECTED },
      });

    case "send_notification":
      // Integrate with notification service
      return { sent: true, type: action.params.type };

    case "delay":
      await new Promise((resolve) =>
        setTimeout(resolve, action.params.milliseconds || 1000)
      );
      return { delayed: action.params.milliseconds || 1000 };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export async function checkOALTriggers(oalLog: Record<string, any>) {
  // Get all workflows that could be triggered
  const workflows = await prisma.rPAWorkflow.findMany({
    where: {
      },
  });

  for (const workflow of workflows) {
    // Check if workflow should be triggered (simplified logic)
    // In production, you'd store trigger conditions in the workflow
    if (shouldTriggerWorkflow(workflow, oalLog)) {
      executeWorkflow({
        workflowId: workflow.id,
        }).catch((error: Error) => {
        console.error(
          `[RPA] Failed to execute workflow ${workflow.id} for OAL trigger:`,
          error
        );
      });
    }
  }
}

function shouldTriggerWorkflow(
  workflow: any,
  oalLog: Record<string, any>
): boolean {
  // Simplified trigger logic - customize based on your needs
  // You might want to add a 'triggerConfig' JSON field to RPAWorkflow
  return workflow.name.toLowerCase().includes("oal");
}

export async function getExecutions(filters: {
  workflowId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, any> = {};
  if (filters.workflowId) where.workflowId = filters.workflowId;
  if (filters.status) where.status = filters.status;

  const [items, count] = await Promise.all([
    prisma.rPAExecution.findMany({
      where,
      include: {
        workflow: {
          select: { id: true, name: true, enabled: true },
        },
      },
      orderBy: { startedAt: "desc" },
      take: filters.limit,
      skip: filters.offset,
    }),
    prisma.rPAExecution.count({ where }),
  ]);

  return { items, count };
}
