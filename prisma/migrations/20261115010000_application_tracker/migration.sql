CREATE TABLE "JobApplication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'APPLIED',
  "appliedOn" TEXT NOT NULL,
  "interviewAt" DATETIME,
  "followUpOn" TEXT,
  "contact" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "applyUrl" TEXT,
  "jobId" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "JobApplication_jobId_key" ON "JobApplication"("jobId");
CREATE INDEX "JobApplication_status_updatedAt_idx" ON "JobApplication"("status", "updatedAt");
CREATE TABLE "ApplicationEvent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "applicationId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ApplicationEvent_applicationId_createdAt_idx" ON "ApplicationEvent"("applicationId", "createdAt");
