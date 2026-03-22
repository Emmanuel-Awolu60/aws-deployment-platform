#!/bin/bash

set -e

ECR_REPOSITORY_URL=$1
IMAGE_TAG=$2
AWS_REGION=${3:-us-east-1}

if [ -z "$ECR_REPOSITORY_URL" ] || [ -z "$IMAGE_TAG" ]; then
  echo "Usage: ./deploy.sh <ecr-repository-url> <image-tag>"
  exit 1
fi

echo "Starting deployment of $IMAGE_TAG"

echo "Authenticating with ECR..."
aws ecr get-login-password --region $AWS_REGION | sudo docker login --username AWS --password-stdin $ECR_REPOSITORY_URL

echo "Pulling new image..."
sudo docker pull $ECR_REPOSITORY_URL:$IMAGE_TAG

echo "Stopping old container..."
sudo docker stop app || true
sudo docker rm app || true

echo "Starting new container..."
sudo docker run -d \
  --name app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e GIT_COMMIT_SHA=$IMAGE_TAG \
  $ECR_REPOSITORY_URL:$IMAGE_TAG

echo "Deployment complete. Version $IMAGE_TAG is now running."