import { Router, Request, Response } from 'express'
import { getAuditLogs, createAuditLog } from '../utils/auditLog'

const router = Router()

/**
 * GET /api/audit-logs
 * Get audit logs with optional filters
 * Query params: userId, resourceType, resourceId, startDate, endDate, limit, skip
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      resourceType,
      resourceId,
      startDate,
      endDate,
      limit,
      skip,
    } = req.query

    const filters = {
      userId: userId as string | undefined,
      resourceType: resourceType as string | undefined,
      resourceId: resourceId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50,
      skip: skip ? parseInt(skip as string) : 0,
    }

    const logs = await getAuditLogs(filters)

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    })
  } catch (error: any) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
      message: error.message,
    })
  }
})

/**
 * GET /api/audit-logs/:id
 * Get a specific audit log by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const log = await prisma.auditLog.findUnique({
      where: { id },
    })

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Audit log not found',
      })
    }

    res.json({
      success: true,
      data: log,
    })
  } catch (error: any) {
    console.error('Error fetching audit log:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log',
      message: error.message,
    })
  }
})

/**
 * GET /api/audit-logs/user/:userId
 * Get all audit logs for a specific user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { limit, skip } = req.query

    const logs = await getAuditLogs({
      userId,
      limit: limit ? parseInt(limit as string) : 50,
      skip: skip ? parseInt(skip as string) : 0,
    })

    res.json({
      success: true,
      count: logs.length,
      userId,
      data: logs,
    })
  } catch (error: any) {
    console.error('Error fetching user audit logs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user audit logs',
      message: error.message,
    })
  }
})

/**
 * GET /api/audit-logs/resource/:resourceType/:resourceId
 * Get all audit logs for a specific resource
 */
router.get('/resource/:resourceType/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId } = req.params
    const { limit, skip } = req.query

    const logs = await getAuditLogs({
      resourceType,
      resourceId,
      limit: limit ? parseInt(limit as string) : 50,
      skip: skip ? parseInt(skip as string) : 0,
    })

    res.json({
      success: true,
      count: logs.length,
      resourceType,
      resourceId,
      data: logs,
    })
  } catch (error: any) {
    console.error('Error fetching resource audit logs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resource audit logs',
      message: error.message,
    })
  }
})

/**
 * POST /api/audit-logs (Admin only - for manual audit log creation)
 * Create a new audit log entry
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      changes,
      previousValues,
      newValues,
      metadata,
    } = req.body

    // Validate required fields
    if (!action || !resourceType || !resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: action, resourceType, resourceId',
      })
    }

    const log = await createAuditLog({
      userId: userId || 'system',
      action,
      resourceType,
      resourceId,
      changes,
      previousValues,
      newValues,
      metadata: {
        ...metadata,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        manualEntry: true,
      },
    })

    res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: log,
    })
  } catch (error: any) {
    console.error('Error creating audit log:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create audit log',
      message: error.message,
    })
  }
})

/**
 * GET /api/audit-logs/stats/summary
 * Get audit log statistics
 */
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query

    const whereClause: any = {}
    if (startDate || endDate) {
      whereClause.timestamp = {}
      if (startDate) whereClause.timestamp.gte = new Date(startDate as string)
      if (endDate) whereClause.timestamp.lte = new Date(endDate as string)
    }

    const [
      totalLogs,
      uniqueUsers,
      actionsByType,
      resourcesByType,
    ] = await Promise.all([
      prisma.auditLog.count({ where: whereClause }),
      prisma.auditLog.findMany({
        where: whereClause,
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: whereClause,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.groupBy({
        by: ['resourceType'],
        where: whereClause,
        _count: { resourceType: true },
        orderBy: { _count: { resourceType: 'desc' } },
        take: 10,
      }),
    ])

    res.json({
      success: true,
      data: {
        totalLogs,
        uniqueUsers: uniqueUsers.length,
        topActions: actionsByType.map(a => ({
          action: a.action,
          count: a._count.action,
        })),
        topResources: resourcesByType.map(r => ({
          resourceType: r.resourceType,
          count: r._count.resourceType,
        })),
      },
    })
  } catch (error: any) {
    console.error('Error fetching audit log stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log statistics',
      message: error.message,
    })
  }
})

// Import prisma client
import prisma from '../prismaClient'

export default router
