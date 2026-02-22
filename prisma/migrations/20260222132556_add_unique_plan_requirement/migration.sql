-- Add uniqueness constraints to prevent duplicate canonical records
CREATE UNIQUE INDEX "Plan_projectId_key" ON "Plan"("projectId");
CREATE UNIQUE INDEX "Requirement_projectId_versionInt_key" ON "Requirement"("projectId", "versionInt");
