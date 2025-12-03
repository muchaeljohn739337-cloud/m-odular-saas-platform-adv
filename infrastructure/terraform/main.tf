# Advancia Pay Ledger - Terraform Infrastructure
# ================================================
# This module provisions core Azure/AWS infrastructure for the platform

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  # Uncomment for remote state management
  # backend "azurerm" {
  #   resource_group_name  = "advancia-tfstate"
  #   storage_account_name = "advanciatfstate"
  #   container_name       = "tfstate"
  #   key                  = "prod.terraform.tfstate"
  # }
}

# ================================================
# Variables
# ================================================

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
  default     = "prod"
}

variable "region" {
  type        = string
  description = "Primary deployment region"
  default     = "eastus"
}

variable "domain" {
  type        = string
  description = "Primary domain name"
  default     = "advanciapayledger.com"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare Zone ID"
  sensitive   = true
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token"
  sensitive   = true
}

# ================================================
# Provider Configuration
# ================================================

provider "azurerm" {
  features {}
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ================================================
# Resource Group
# ================================================

resource "azurerm_resource_group" "main" {
  name     = "advancia-${var.environment}-rg"
  location = var.region

  tags = {
    Environment = var.environment
    Project     = "advancia-pay-ledger"
    ManagedBy   = "terraform"
  }
}

# ================================================
# PostgreSQL Database (Azure Flexible Server)
# ================================================

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "advancia-${var.environment}-db"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "15"
  administrator_login    = "advanciaadmin"
  administrator_password = var.db_password
  storage_mb             = 32768
  sku_name               = var.environment == "prod" ? "GP_Standard_D2s_v3" : "B_Standard_B1ms"
  zone                   = "1"

  tags = {
    Environment = var.environment
    Project     = "advancia-pay-ledger"
  }
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Database administrator password"
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "advancia_${var.environment}"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# ================================================
# Redis Cache
# ================================================

resource "azurerm_redis_cache" "main" {
  name                = "advancia-${var.environment}-redis"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  capacity            = var.environment == "prod" ? 1 : 0
  family              = var.environment == "prod" ? "P" : "C"
  sku_name            = var.environment == "prod" ? "Premium" : "Basic"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_policy = "allkeys-lru"
  }

  tags = {
    Environment = var.environment
    Project     = "advancia-pay-ledger"
  }
}

# ================================================
# Storage Account (for backups, assets)
# ================================================

resource "azurerm_storage_account" "main" {
  name                     = "advancia${var.environment}storage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = var.environment == "prod" ? "GRS" : "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true
    delete_retention_policy {
      days = 30
    }
  }

  tags = {
    Environment = var.environment
    Project     = "advancia-pay-ledger"
  }
}

# ================================================
# Cloudflare DNS Records
# ================================================

resource "cloudflare_record" "root" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  value   = "76.76.21.21" # Vercel IP
  type    = "A"
  proxied = true
}

resource "cloudflare_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = var.domain
  type    = "CNAME"
  proxied = true
}

resource "cloudflare_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  value   = "advancia-pay-ledger-backend.onrender.com"
  type    = "CNAME"
  proxied = true
}

# ================================================
# Cloudflare Page Rules / Security
# ================================================

resource "cloudflare_page_rule" "api_cache" {
  zone_id  = var.cloudflare_zone_id
  target   = "api.${var.domain}/api/*"
  priority = 1

  actions {
    cache_level = "bypass"
  }
}

resource "cloudflare_page_rule" "static_cache" {
  zone_id  = var.cloudflare_zone_id
  target   = "${var.domain}/_next/static/*"
  priority = 2

  actions {
    cache_level = "cache_everything"
    edge_cache_ttl = 604800 # 1 week
  }
}

# ================================================
# Outputs
# ================================================

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "database_host" {
  value     = azurerm_postgresql_flexible_server.main.fqdn
  sensitive = true
}

output "redis_host" {
  value     = azurerm_redis_cache.main.hostname
  sensitive = true
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}
