# ===========================================
# Terraform Variables
# AtlasAI Infrastructure
# ===========================================

# -----------------------------
# General
# -----------------------------

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "atlasai"
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "dr_region" {
  description = "Disaster recovery region"
  type        = string
  default     = "us-west-2"
}

variable "aws_profile" {
  description = "AWS CLI profile"
  type        = string
  default     = "default"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "AtlasAI"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

# -----------------------------
# VPC
# -----------------------------

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use single NAT Gateway (cost savings)"
  type        = bool
  default     = false
}

# -----------------------------
# RDS Database
# -----------------------------

variable "db_engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.4"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "atlasai"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "atlasai_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Allocated storage (GB)"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Max allocated storage for autoscaling (GB)"
  type        = number
  default     = 500
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "db_backup_retention_period" {
  description = "Backup retention period (days)"
  type        = number
  default     = 30
}

variable "db_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring"
  type        = bool
  default     = true
}

# -----------------------------
# EKS / Fargate
# -----------------------------

variable "use_fargate" {
  description = "Use EKS Fargate"
  type        = bool
  default     = false
}

# -----------------------------
# Secrets
# -----------------------------

variable "secrets_prefix" {
  description = "Prefix for Secrets Manager secrets"
  type        = string
  default     = "atlasai"
}
