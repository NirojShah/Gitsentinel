CREATE TABLE "aiconfiguration" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiKey" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aiconfiguration_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "aiconfiguration_userId_createdAt_idx" ON "aiconfiguration"("userId", "createdAt");

ALTER TABLE "aiconfiguration"
ADD CONSTRAINT "aiconfiguration_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
