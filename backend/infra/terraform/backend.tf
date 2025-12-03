# ===========================================
# Terraform Backend Configuration (S3 + DynamoDB)
# AtlasAI Infrastructure
# ===========================================

terraform {
  backend "s3" {
    bucket         = "atlasai-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "atlasai-terraform-locks"
  }
}

# Note: Before using this backend, create the S3 bucket and DynamoDB table:
#
# aws s3api create-bucket \
#   --bucket atlasai-terraform-state \
#   --region us-east-1
#
# aws s3api put-bucket-versioning \
#   --bucket atlasai-terraform-state \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-bucket-encryption \
#   --bucket atlasai-terraform-state \
#   --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
#
# aws dynamodb create-table \
#   --table-name atlasai-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
#   --region us-east-1
