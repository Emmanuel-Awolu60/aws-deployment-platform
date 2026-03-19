variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  default     = "aws-deployment-platform"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t2.micro"
}

variable "ami_id" {
  description = "Amazon Machine Image ID for EC2"
  default     = "ami-0c02fb55956c7d316"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
}