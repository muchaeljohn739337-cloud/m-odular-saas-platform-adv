import express from "express";
import prisma from "../prismaClient";

const router = express.Router();

// ============================================
// HEALTH READINGS ENDPOINTS (MEDBED INTEGRATION)
// ============================================

/**
 * POST /api/health/readings
 * Add a new health reading
 */
router.post("/readings", async (req, res) => {
  try {
    const {
      userId,
      heartRate,
      bloodPressureSys,
      bloodPressureDia,
      steps,
      sleepHours,
      sleepQuality,
      weight,
      temperature,
      oxygenLevel,
      stressLevel,
      mood,
      deviceId,
      deviceType,
      notes,
      metadata,
      recordedAt,
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    
    const reading = await prisma.healthReading.create({
      data: {
        userId,
        heartRate: heartRate ? parseInt(heartRate) : null,
        bloodPressureSys: bloodPressureSys ? parseInt(bloodPressureSys) : null,
        bloodPressureDia: bloodPressureDia ? parseInt(bloodPressureDia) : null,
        steps: steps ? parseInt(steps) : null,
        sleepHours: sleepHours ? parseFloat(sleepHours) : null,
        sleepQuality,
        weight: weight ? parseFloat(weight) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        oxygenLevel: oxygenLevel ? parseInt(oxygenLevel) : null,
        stressLevel,
        mood,
        deviceId,
        deviceType,
        notes,
        metadata,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    });
    
    console.log(`❤️ Health reading recorded for user ${userId}`);
    
    res.json({
      success: true,
      reading,
    });
  } catch (error) {
    console.error("Error creating health reading:", error);
    res.status(500).json({ error: "Failed to create health reading" });
  }
});

/**
 * GET /api/health/readings/:userId
 * Get all health readings for a user
 */
router.get("/readings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    const readings = await prisma.healthReading.findMany({
      where: {
        userId,
        ...(startDate && endDate && {
          recordedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      orderBy: { recordedAt: "desc" },
      take: limit,
    });
    
    res.json({ readings, count: readings.length });
  } catch (error) {
    console.error("Error fetching health readings:", error);
    res.status(500).json({ error: "Failed to fetch health readings" });
  }
});

/**
 * GET /api/health/latest/:userId
 * Get the most recent health reading
 */
router.get("/latest/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reading = await prisma.healthReading.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    });
    
    if (!reading) {
      return res.status(404).json({ error: "No health readings found" });
    }
    
    res.json({ reading });
  } catch (error) {
    console.error("Error fetching latest reading:", error);
    res.status(500).json({ error: "Failed to fetch latest reading" });
  }
});

/**
 * GET /api/health/summary/:userId
 * Get health summary statistics
 */
router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const readings = await prisma.healthReading.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: "desc" },
    });
    
    if (readings.length === 0) {
      return res.json({
        message: "No data available",
        period: `Last ${days} days`,
        count: 0,
      });
    }
    
    // Calculate averages and stats
    const heartRates = readings.filter(r => r.heartRate).map(r => r.heartRate!);
    const avgHeartRate = heartRates.length > 0
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null;
    
    const steps = readings.filter(r => r.steps).map(r => r.steps!);
    const avgSteps = steps.length > 0
      ? Math.round(steps.reduce((a, b) => a + b, 0) / steps.length)
      : null;
    const totalSteps = steps.reduce((a, b) => a + b, 0);
    
    const sleepHours = readings.filter(r => r.sleepHours).map(r => Number(r.sleepHours));
    const avgSleepHours = sleepHours.length > 0
      ? (sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length).toFixed(1)
      : null;
    
    const weights = readings.filter(r => r.weight).map(r => Number(r.weight));
    const avgWeight = weights.length > 0
      ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
      : null;
    
    const bpReadings = readings.filter(r => r.bloodPressureSys && r.bloodPressureDia);
    const avgBPSys = bpReadings.length > 0
      ? Math.round(bpReadings.reduce((sum, r) => sum + r.bloodPressureSys!, 0) / bpReadings.length)
      : null;
    const avgBPDia = bpReadings.length > 0
      ? Math.round(bpReadings.reduce((sum, r) => sum + r.bloodPressureDia!, 0) / bpReadings.length)
      : null;
    
    const oxygenLevels = readings.filter(r => r.oxygenLevel).map(r => r.oxygenLevel!);
    const avgOxygen = oxygenLevels.length > 0
      ? Math.round(oxygenLevels.reduce((a, b) => a + b, 0) / oxygenLevels.length)
      : null;
    
    // Count mood occurrences
    const moodCounts = readings
      .filter(r => r.mood)
      .reduce((acc, r) => {
        acc[r.mood!] = (acc[r.mood!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const mostCommonMood = Object.keys(moodCounts).length > 0
      ? Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;
    
    // Health score calculation (0-100)
    let healthScore = 70; // Base score
    
    if (avgHeartRate) {
      // Optimal: 60-80 bpm
      if (avgHeartRate >= 60 && avgHeartRate <= 80) healthScore += 10;
      else if (avgHeartRate > 80 && avgHeartRate <= 100) healthScore += 5;
    }
    
    if (avgSleepHours) {
      // Optimal: 7-9 hours
      const sleep = parseFloat(avgSleepHours);
      if (sleep >= 7 && sleep <= 9) healthScore += 10;
      else if (sleep >= 6 && sleep <= 10) healthScore += 5;
    }
    
    if (avgSteps && avgSteps >= 8000) healthScore += 10;
    else if (avgSteps && avgSteps >= 5000) healthScore += 5;
    
    if (avgOxygen && avgOxygen >= 95) healthScore += 10;
    
    healthScore = Math.min(100, Math.max(0, healthScore));
    
    res.json({
      period: `Last ${days} days`,
      count: readings.length,
      healthScore,
      averages: {
        heartRate: avgHeartRate,
        bloodPressure: avgBPSys && avgBPDia ? `${avgBPSys}/${avgBPDia}` : null,
        steps: avgSteps,
        totalSteps,
        sleepHours: avgSleepHours,
        weight: avgWeight,
        oxygenLevel: avgOxygen,
      },
      mostCommonMood,
      moodDistribution: moodCounts,
    });
  } catch (error) {
    console.error("Error fetching health summary:", error);
    res.status(500).json({ error: "Failed to fetch health summary" });
  }
});

/**
 * GET /api/health/chart/:userId/:metric
 * Get chart data for a specific metric
 */
router.get("/chart/:userId/:metric", async (req, res) => {
  try {
    const { userId, metric } = req.params;
    const days = parseInt(req.query.days as string) || 7;
    
    const validMetrics = [
      "heartRate",
      "bloodPressure",
      "steps",
      "sleepHours",
      "weight",
      "temperature",
      "oxygenLevel",
    ];
    
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({ error: "Invalid metric" });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const readings = await prisma.healthReading.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: "asc" },
    });
    
    let chartData: any[] = [];
    
    if (metric === "bloodPressure") {
      chartData = readings
        .filter(r => r.bloodPressureSys && r.bloodPressureDia)
        .map(r => ({
          date: r.recordedAt.toISOString(),
          systolic: r.bloodPressureSys,
          diastolic: r.bloodPressureDia,
        }));
    } else {
      chartData = readings
        .filter(r => (r as any)[metric] != null)
        .map(r => ({
          date: r.recordedAt.toISOString(),
          value: (r as any)[metric],
        }));
    }
    
    res.json({
      metric,
      period: `Last ${days} days`,
      data: chartData,
      count: chartData.length,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

/**
 * DELETE /api/health/readings/:id
 * Delete a health reading
 */
router.delete("/readings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const reading = await prisma.healthReading.findUnique({
      where: { id },
    });
    
    if (!reading) {
      return res.status(404).json({ error: "Reading not found" });
    }
    
    if (reading.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    await prisma.healthReading.delete({
      where: { id },
    });
    
    res.json({ success: true, message: "Reading deleted" });
  } catch (error) {
    console.error("Error deleting reading:", error);
    res.status(500).json({ error: "Failed to delete reading" });
  }
});

/**
 * GET /api/health/alerts/:userId
 * Get health alerts based on abnormal readings
 */
router.get("/alerts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const latest = await prisma.healthReading.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    });
    
    if (!latest) {
      return res.json({ alerts: [] });
    }
    
    const alerts: any[] = [];
    
    // Heart rate alerts
    if (latest.heartRate) {
      if (latest.heartRate > 100) {
        alerts.push({
          type: "warning",
          metric: "heartRate",
          message: "Heart rate is elevated",
          value: latest.heartRate,
          normal: "60-100 bpm",
        });
      } else if (latest.heartRate < 60) {
        alerts.push({
          type: "info",
          metric: "heartRate",
          message: "Heart rate is below normal",
          value: latest.heartRate,
          normal: "60-100 bpm",
        });
      }
    }
    
    // Blood pressure alerts
    if (latest.bloodPressureSys && latest.bloodPressureDia) {
      if (latest.bloodPressureSys > 140 || latest.bloodPressureDia > 90) {
        alerts.push({
          type: "warning",
          metric: "bloodPressure",
          message: "Blood pressure is high",
          value: `${latest.bloodPressureSys}/${latest.bloodPressureDia}`,
          normal: "< 120/80",
        });
      } else if (latest.bloodPressureSys < 90 || latest.bloodPressureDia < 60) {
        alerts.push({
          type: "info",
          metric: "bloodPressure",
          message: "Blood pressure is low",
          value: `${latest.bloodPressureSys}/${latest.bloodPressureDia}`,
          normal: "90-120/60-80",
        });
      }
    }
    
    // Oxygen level alerts
    if (latest.oxygenLevel) {
      if (latest.oxygenLevel < 95) {
        alerts.push({
          type: "warning",
          metric: "oxygenLevel",
          message: "Oxygen saturation is low",
          value: `${latest.oxygenLevel}%`,
          normal: "> 95%",
        });
      }
    }
    
    // Temperature alerts
    if (latest.temperature) {
      const temp = Number(latest.temperature);
      if (temp > 37.5) {
        alerts.push({
          type: "warning",
          metric: "temperature",
          message: "Body temperature is elevated",
          value: `${latest.temperature}°C`,
          normal: "36.5-37.2°C",
        });
      } else if (temp < 36) {
        alerts.push({
          type: "info",
          metric: "temperature",
          message: "Body temperature is low",
          value: `${latest.temperature}°C`,
          normal: "36.5-37.2°C",
        });
      }
    }
    
    res.json({
      alerts,
      count: alerts.length,
      timestamp: latest.recordedAt,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

export default router;
