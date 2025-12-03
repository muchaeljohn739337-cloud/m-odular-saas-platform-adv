# ===========================================
# AWS Infrastructure Variables
# AtlasAI / Modular SaaS Platform
# ===========================================

# -----------------------------
# General Configuration
# -----------------------------

variable "project_name" {
  description = "Name of the project (used for resource naming)"
  type        = string
  default     = "atlas-ai"
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use for authentication"
  type        = string
  default     = "default"
}

# -----------------------------
# Tagging
# -----------------------------

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "AtlasAI"
    Environment = "production"
    ManagedBy   = "Terraform"
    Owner       = "DevOps"
  }
}

# -----------------------------
# VPC Configuration
# -----------------------------

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT Gateway (cost savings for non-prod)"
  type        = bool
  default     = false
}

# -----------------------------
# EC2 Configuration
# -----------------------------

variable "instance_type" {
  description = "EC2 instance type for application servers"
  type        = string
  default     = "t3.medium"
}

variable "ami_id" {
  description = "AMI ID for EC2 instances (leave empty for latest Amazon Linux 2)"
  type        = string
  default     = ""
}

variable "key_pair_name" {
  description = "Name of the SSH key pair for EC2 access"
  type        = string
  default     = "atlas-ai-keypair"
}

variable "enable_detailed_monitoring" {
  description = "Enable detailed CloudWatch monitoring for EC2"
  type        = bool
  default     = true
}

# -----------------------------
# Auto Scaling Configuration
# -----------------------------

variable "asg_min_size" {
  description = "Minimum number of instances in the Auto Scaling Group"
  type        = number
  default     = 2
}

variable "asg_max_size" {
  description = "Maximum number of instances in the Auto Scaling Group"
  type        = number
  default     = 10
}

variable "asg_desired_capacity" {
  description = "Desired number of instances in the Auto Scaling Group"
  type        = number
  default     = 3
}

variable "scale_up_threshold" {
  description = "CPU threshold percentage to trigger scale up"
  type        = number
  default     = 70
}

variable "scale_down_threshold" {
  description = "CPU threshold percentage to trigger scale down"
  type        = number
  default     = 30
}

# -----------------------------
# RDS Database Configuration
# -----------------------------

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_engine" {
  description = "Database engine (postgres, mysql)"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "15.4"
}

variable "db_name" {
  description = "Name of the database to create"
  type        = string
  default     = "atlasai_production"
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
  default     = "atlasai_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Master password for the database"
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Maximum storage for autoscaling in GB"
  type        = number
  default     = 500
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment for RDS"
  type        = bool
  default     = true
}

variable "db_backup_retention_period" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 30
}

variable "db_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}

# -----------------------------
# ElastiCache (Redis) Configuration
# -----------------------------

variable "redis_node_type" {
  description = "ElastiCache node type for Redis"
  type        = string
  default     = "cache.t3.medium"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes in the Redis cluster"
  type        = number
  default     = 2
}

variable "redis_engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "redis_port" {
  description = "Port for Redis connections"
  type        = number
  default     = 6379
}

# -----------------------------
# S3 Configuration
# -----------------------------

variable "s3_bucket_prefix" {
  description = "Prefix for S3 bucket names"
  type        = string
  default     = "atlasai"
}

variable "enable_s3_versioning" {
  description = "Enable versioning for S3 buckets"
  type        = bool
  default     = true
}

variable "s3_lifecycle_days" {
  description = "Days before transitioning objects to Glacier"
  type        = number
  default     = 90
}

# -----------------------------
# CloudFront Configuration
# -----------------------------

variable "enable_cloudfront" {
  description = "Enable CloudFront distribution"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "cloudfront_ssl_certificate_arn" {
  description = "ARN of the ACM certificate for CloudFront"
  type        = string
  default     = ""
}

# -----------------------------
# ALB Configuration
# -----------------------------

variable "alb_internal" {
  description = "Whether the ALB is internal"
  type        = bool
  default     = false
}

variable "enable_alb_access_logs" {
  description = "Enable access logs for ALB"
  type        = bool
  default     = true
}

variable "health_check_path" {
  description = "Health check path for the target group"
  type        = string
  default     = "/api/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

# -----------------------------
# Domain Configuration
# -----------------------------

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "advanciapayledger.com"
}

variable "api_subdomain" {
  description = "API subdomain"
  type        = string
  default     = "api"
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
  default     = ""
}

# -----------------------------
# Security Configuration
# -----------------------------

variable "allowed_ssh_cidr_blocks" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = []
}

variable "enable_waf" {
  description = "Enable AWS WAF for the ALB"
  type        = bool
  default     = true
}

variable "enable_guard_duty" {
  description = "Enable AWS GuardDuty"
  type        = bool
  default     = true
}

# -----------------------------
# Logging & Monitoring
# -----------------------------

variable "log_retention_days" {
  description = "CloudWatch Logs retention period in days"
  type        = number
  default     = 30
}

variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for RDS"
  type        = bool
  default     = true
}

variable "alarm_email" {
  description = "Email address for CloudWatch alarms"
  type        = string
  default     = ""
}

# -----------------------------
# Secrets Manager
# -----------------------------

variable "secrets_prefix" {
  description = "Prefix for AWS Secrets Manager secrets"
  type        = string
  default     = "atlasai"
}

# -----------------------------
# ECS / Fargate (Optional)
# -----------------------------

variable "use_fargate" {
  description = "Use ECS Fargate instead of EC2"
  type        = bool
  default     = false
}

variable "fargate_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 512
}

variable "fargate_memory" {
  description = "Fargate task memory in MB"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Port exposed by the container"
  type        = number
  default     = 4000
}

# -----------------------------
# Cost Management
# -----------------------------

variable "enable_cost_allocation_tags" {
  description = "Enable cost allocation tags"
  type        = bool
  default     = true
}

variable "budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 1000
}

variable "budget_alert_threshold" {
  description = "Percentage of budget to trigger alert"
  type        = number
  default     = 80
}
