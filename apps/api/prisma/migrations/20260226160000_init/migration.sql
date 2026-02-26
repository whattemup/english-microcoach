-- Baseline schema for English MicroCoach (production-ready baseline)

CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lesson" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LessonPhrase" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "expected" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonPhrase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "expectedText" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "score" INTEGER NOT NULL,
    "missing" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "extra" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Mistake" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mistake_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReviewItem" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE INDEX "Lesson_categoryId_idx" ON "Lesson"("categoryId");
CREATE INDEX "LessonPhrase_lessonId_idx" ON "LessonPhrase"("lessonId");
CREATE UNIQUE INDEX "LessonPhrase_lessonId_order_key" ON "LessonPhrase"("lessonId", "order");

CREATE INDEX "Attempt_userId_createdAt_idx" ON "Attempt"("userId", "createdAt");
CREATE INDEX "Attempt_phraseId_idx" ON "Attempt"("phraseId");
CREATE INDEX "Attempt_lessonId_idx" ON "Attempt"("lessonId");

CREATE UNIQUE INDEX "Mistake_userId_phraseId_word_key" ON "Mistake"("userId", "phraseId", "word");
CREATE INDEX "Mistake_userId_lastSeen_idx" ON "Mistake"("userId", "lastSeen");

CREATE UNIQUE INDEX "ReviewItem_userId_phraseId_key" ON "ReviewItem"("userId", "phraseId");
CREATE INDEX "ReviewItem_userId_dueDate_idx" ON "ReviewItem"("userId", "dueDate");

ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LessonCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LessonPhrase" ADD CONSTRAINT "LessonPhrase_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "LessonPhrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Mistake" ADD CONSTRAINT "Mistake_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "LessonPhrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ReviewItem" ADD CONSTRAINT "ReviewItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReviewItem" ADD CONSTRAINT "ReviewItem_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "LessonPhrase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
