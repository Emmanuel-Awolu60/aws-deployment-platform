# AWS Deployment Platform

A complete automated deployment pipeline built on AWS. This project demonstrates 
that infrastructure is the real engineering challenge — not the application it deploys.

Push a commit to main. Everything else happens automatically.

## What this system does

When a commit is pushed to the main branch, this happens with zero human involvement:

1. **Tests run** — Jest tests gate the pipeline. If any test fails, nothing deploys.
2. **Terraform provisions infrastructure** — VPC, subnet, security groups, EC2 instance, 
   and ECR repository are created or updated.
3. **Docker image builds** — tagged with the exact git commit SHA, not latest.
4. **Pipeline deploys to EC2** — pulls the new image, stops the old container, 
   starts the new one. The gap is milliseconds.
5. **Health check runs** — hits /health five times with 10 second intervals. 
   All five must return 200 or the pipeline fails.
6. **Monitoring confirms** — Prometheus and Grafana show CPU, memory, request 
   rate, and error rate in real time.

## Architecture
```
GitHub → GitHub Actions → ECR → EC2
                ↓
           Terraform → AWS (VPC, Subnet, Security Group, IAM)
                ↓
           EC2 Instance → Docker → App Container
                       → Prometheus → Grafana
```

## Tech stack

- **Application** — Node.js with Express
- **Containerisation** — Docker
- **Container Registry** — Amazon ECR
- **Infrastructure** — Terraform
- **Cloud** — AWS (EC2, VPC, IAM, S3, DynamoDB)
- **CI/CD** — GitHub Actions
- **Monitoring** — Prometheus, Grafana, Node Exporter

## Project structure
```
aws-deployment-platform/
  app/                    # Node.js API
    src/
      index.js            # Application with 4 endpoints
      app.test.js         # Jest tests — the pipeline gate
    Dockerfile
    package.json
  terraform/              # All AWS infrastructure as code
    main.tf               # VPC, subnet, EC2, IAM
    variables.tf          
    outputs.tf            
    security-groups.tf    
    ecr.tf                
  .github/
    workflows/
      deploy.yml          # Full deployment pipeline
      destroy.yml         # Tear down infrastructure
  monitoring/
    docker-compose.yml    # Prometheus, Grafana, Node Exporter
    prometheus.yml        # Scrape configuration
  scripts/
    deploy.sh             # Standalone deploy script
  README.md
```

## API endpoints

| Endpoint | Method | Response |
|----------|--------|----------|
| /health | GET | `{"status":"ok"}` |
| /version | GET | `{"version":"<commit-sha>"}` |
| /items | GET | `{"items":[...]}` |
| /metrics | GET | Prometheus metrics |

## Key decisions and why

**SHA tagging over latest**
Every Docker image is tagged with the git commit SHA. This means you always 
know exactly which version is running anywhere. Rolling back means redeploying 
a previous SHA — the image still exists in ECR.

**Remote state in S3 with DynamoDB locking**
Terraform state lives in S3, not on a local machine. The pipeline runs on 
GitHub's servers which have no local state. DynamoDB locking prevents two 
pipeline runs from corrupting state simultaneously.

**Zero downtime deployment**
The deploy order is: pull new image → stop old container → start new container. 
Pulling happens while the old container serves traffic. The gap between stop 
and start is milliseconds.

**Tests as the first gate**
Tests run before any infrastructure or build job. A failing test means nothing 
deploys. Ever. This is enforced by the job dependency chain in GitHub Actions.

**Least privilege IAM**
The terraform-deployer IAM user has only the permissions it needs. 
The EC2 instance role has read-only ECR access — it can pull images but 
cannot push or delete them.

## How to use this

**Deploy**
Go to Actions → Deploy Pipeline → Run workflow

**Destroy**
Go to Actions → Destroy Infrastructure → Run workflow

**Required GitHub secrets**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SSH_PUBLIC_KEY`
- `SSH_PRIVATE_KEY`
- `ECR_REPOSITORY_URL`

## What I learned building this

This project taught me that infrastructure is not configuration — it is 
engineering. Every decision has a consequence. Remote state exists because 
pipelines have no memory. SHA tagging exists because latest is ambiguous. 
Health checks exist because up and healthy are not the same thing.

A working system on Monday can break on Tuesday when you make a change. 
Understanding why it broke and fixing it is the real skill.
