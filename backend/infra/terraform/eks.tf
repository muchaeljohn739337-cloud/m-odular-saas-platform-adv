# ===========================================
# EKS Cluster Module
# AtlasAI Infrastructure
# ===========================================

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = var.project_name
  cluster_version = var.eks_cluster_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster endpoint access
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # Managed node groups
  eks_managed_node_groups = {
    # General purpose nodes
    general = {
      name           = "${var.project_name}-general"
      instance_types = var.eks_node_instance_types
      capacity_type  = "ON_DEMAND"

      min_size     = var.eks_node_min_size
      max_size     = var.eks_node_max_size
      desired_size = var.eks_node_desired_size

      labels = {
        Environment = var.environment
        NodeType    = "general"
      }

      tags = {
        Environment = var.environment
      }
    }

    # Spot instances for cost savings (non-critical workloads)
    spot = {
      name           = "${var.project_name}-spot"
      instance_types = var.eks_spot_instance_types
      capacity_type  = "SPOT"

      min_size     = 0
      max_size     = var.eks_spot_max_size
      desired_size = var.eks_spot_desired_size

      labels = {
        Environment = var.environment
        NodeType    = "spot"
      }

      taints = [
        {
          key    = "spot"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      tags = {
        Environment = var.environment
      }
    }
  }

  # Fargate profiles (optional)
  fargate_profiles = var.use_fargate ? {
    default = {
      name = "default"
      selectors = [
        {
          namespace = "kube-system"
        },
        {
          namespace = "default"
        }
      ]
    }
  } : {}

  # AWS auth configmap
  manage_aws_auth_configmap = true

  aws_auth_roles = [
    {
      rolearn  = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/AdminRole"
      username = "admin"
      groups   = ["system:masters"]
    }
  ]

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Terraform   = "true"
  }
}

# ===========================================
# Data Sources
# ===========================================

data "aws_caller_identity" "current" {}

# ===========================================
# EKS Variables
# ===========================================

variable "eks_cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.28"
}

variable "eks_node_instance_types" {
  description = "Instance types for EKS managed node group"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "eks_node_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2
}

variable "eks_node_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 10
}

variable "eks_node_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 3
}

variable "eks_spot_instance_types" {
  description = "Instance types for spot node group"
  type        = list(string)
  default     = ["t3.medium", "t3.large", "t3a.medium", "t3a.large"]
}

variable "eks_spot_max_size" {
  description = "Maximum number of spot nodes"
  type        = number
  default     = 5
}

variable "eks_spot_desired_size" {
  description = "Desired number of spot nodes"
  type        = number
  default     = 0
}

# ===========================================
# Outputs
# ===========================================

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}
