import prisma from "../prismaClient";
import { createNotification } from "../services/notificationService";
import { vaultService } from "../services/VaultService";
import { BaseAgent } from "./BaseAgent";

export class VaultRotationAgent extends BaseAgent {
  constructor(context: any) {
    super(
      "VaultRotationAgent",
      "0 2 * * *", // Daily at 2 AM UTC
      context,
      true, // enabled
      "high", // priority
      300000 // timeout: 5 minutes
    );
  }

  async execute(): Promise<void> {
    console.log("🔄 [VaultRotationAgent] Starting secret rotation check...");

    try {
      // Get secrets that need rotation
      const secretsDue = await vaultService.getSecretsForRotation();

      if (secretsDue.length === 0) {
        console.log("✅ [VaultRotationAgent] No secrets due for rotation");
        return;
      }

      console.log(
        `⚠️  [VaultRotationAgent] Found ${secretsDue.length} secret(s) due for rotation:`
      );

      secretsDue.forEach((secret) => {
        const policy = secret.rotationPolicy as {
          enabled: boolean;
          intervalDays: number;
        };
        console.log(
          `   - ${secret.key}: Last rotated ${
            secret.lastRotated?.toISOString() || "never"
          }, ` + `interval: ${policy.intervalDays} days`
        );
      });

      // Find all admin users
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true, email: true },
      });

      if (admins.length === 0) {
        console.warn("⚠️  [VaultRotationAgent] No admin users found to notify");
        return;
      }

      console.log(
        `📨 [VaultRotationAgent] Notifying ${admins.length} admin(s)...`
      );

      // Notify each admin
      for (const admin of admins) {
        try {
          // Emit real-time Socket.IO alert
          if (this.context?.socketIO) {
            this.context.socketIO
              .to(`user-${admin.id}`)
              .emit("vault:rotation-alert", {
                count: secretsDue.length,
                secrets: secretsDue.map((s) => ({
                  key: s.key,
                  lastRotated: s.lastRotated,
                  rotationPolicy: s.rotationPolicy,
                })),
                timestamp: new Date(),
              });
          }

          // Create notification in database
          await createNotification(
            admin.id,
            "vault_rotation_due",
            `🔄 Secret Rotation Alert: ${secretsDue.length} secret(s) require rotation`,
            {
              count: secretsDue.length,
              keys: secretsDue.map((s) => s.key),
              timestamp: new Date().toISOString(),
            }
          );

          console.log(`✅ [VaultRotationAgent] Notified admin: ${admin.email}`);
        } catch (notifyError) {
          console.error(
            `❌ [VaultRotationAgent] Failed to notify admin ${admin.email}:`,
            notifyError
          );
        }
      }

      // Create audit logs for each secret
      for (const secret of secretsDue) {
        try {
          await vaultService.createAuditLog({
            userId: admins[0].id, // System action attributed to first admin
            action: "ROTATION_CHECK_DUE",
            secretKey: secret.key,
            ipAddress: "system",
            userAgent: "VaultRotationAgent",
            success: true,
            mfaVerified: false,
          });
        } catch (auditError) {
          console.error(
            `❌ [VaultRotationAgent] Failed to create audit log for ${secret.key}:`,
            auditError
          );
        }
      }

      console.log(
        `✅ [VaultRotationAgent] Rotation check completed. ${secretsDue.length} alert(s) sent.`
      );
    } catch (error) {
      console.error("❌ [VaultRotationAgent] Execution failed:", error);
      throw error;
    }
  }
}

export default VaultRotationAgent;
