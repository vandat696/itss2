-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RequirementType" AS ENUM ('REQUIRED', 'PREFERRED', 'UNCLEAR');

-- CreateEnum
CREATE TYPE "Criterion" AS ENUM ('SKILL', 'MAJOR', 'EXPERIENCE', 'AVAILABILITY', 'OTHER');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('INTERNSHIP', 'PART_TIME');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('MET', 'GAP', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MilestoneType" AS ENUM ('CV', 'SKILL', 'PROJECT', 'RESEARCH', 'INTERVIEW', 'CLARIFY');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('OPEN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProgressKind" AS ENUM ('BASELINE', 'PROFILE', 'MILESTONE');

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "experience" TEXT NOT NULL,
    "months" INTEGER,
    "projects" TEXT NOT NULL,
    "availability" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvSnapshot" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "skills" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CvSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "description" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "applyUrl" TEXT,
    "sample" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequirement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" "RequirementType" NOT NULL,
    "kind" "Criterion" NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchAssessment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "jobRevision" INTEGER NOT NULL,
    "profileRevision" TIMESTAMP(3) NOT NULL,
    "percent" INTEGER,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MatchAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("jobId")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "MilestoneType" NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'OPEN',
    "learned" TEXT NOT NULL,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "dueDate" TEXT,
    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressRecord" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "kind" "ProgressKind" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "skills" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgressRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CvSnapshot_fileKey_key" ON "CvSnapshot"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "MatchAssessment_jobId_jobRevision_profileRevision_key" ON "MatchAssessment"("jobId", "jobRevision", "profileRevision");

-- AddForeignKey
ALTER TABLE "CvSnapshot" ADD CONSTRAINT "CvSnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchAssessment" ADD CONSTRAINT "MatchAssessment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRecord" ADD CONSTRAINT "ProgressRecord_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
