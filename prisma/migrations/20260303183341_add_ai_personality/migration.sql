-- CreateTable
CREATE TABLE "AiPersonality" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "ragPrompt" TEXT NOT NULL,
    "doctorId" INTEGER,
    "doctorName" TEXT,
    "doctorCrm" INTEGER,
    "doctorSpecialty" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiPersonality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiPersonality_key_key" ON "AiPersonality"("key");
