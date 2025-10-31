-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admission', 'registrar', 'dean', 'professor');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('new', 'current', 'transferee', 'irregular', 'dropped');

-- CreateEnum
CREATE TYPE "AssignedBy" AS ENUM ('system', 'registrar', 'dean');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('pending', 'enrolled', 'completed');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('major', 'minor');

-- CreateEnum
CREATE TYPE "IncStatus" AS ENUM ('pending', 'for_registrar', 'resolved', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "student_number" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sex" VARCHAR(10),
    "address" TEXT,
    "contact_no" VARCHAR(30),
    "course_id" INTEGER,
    "year_level" INTEGER,
    "status" "StudentStatus" NOT NULL DEFAULT 'new',
    "documents" JSONB,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "dean_id" INTEGER,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "units" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "year_level" INTEGER,
    "semester" INTEGER,
    "subject_type" "SubjectType" NOT NULL,
    "prerequisite_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "course_id" INTEGER NOT NULL,
    "year_level" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "professor_id" INTEGER,
    "slots" INTEGER NOT NULL DEFAULT 30,
    "is_special" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assigned_subjects" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "term" VARCHAR(20),
    "year" VARCHAR(9),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assigned_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "section_id" INTEGER,
    "assigned_by" "AssignedBy" NOT NULL DEFAULT 'system',
    "term" VARCHAR(20),
    "year" VARCHAR(9),
    "grade" DECIMAL(3,2),
    "remarks" VARCHAR(50),
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'pending',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inc_records" (
    "id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "issued_by" INTEGER NOT NULL,
    "issued_at" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "status" "IncStatus" NOT NULL DEFAULT 'pending',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "archived_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trail" (
    "id" SERIAL NOT NULL,
    "actor_id" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "table_name" VARCHAR(50),
    "record_id" INTEGER,
    "old_value" TEXT,
    "new_value" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_terms" (
    "id" SERIAL NOT NULL,
    "school_year" VARCHAR(9),
    "semester" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_terms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_number_key" ON "students"("student_number");

-- CreateIndex
CREATE INDEX "students_course_id_idx" ON "students"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE INDEX "subjects_course_id_idx" ON "subjects"("course_id");

-- CreateIndex
CREATE INDEX "sections_course_id_idx" ON "sections"("course_id");

-- CreateIndex
CREATE INDEX "sections_professor_id_idx" ON "sections"("professor_id");

-- CreateIndex
CREATE INDEX "assigned_subjects_professor_id_idx" ON "assigned_subjects"("professor_id");

-- CreateIndex
CREATE INDEX "assigned_subjects_section_id_idx" ON "assigned_subjects"("section_id");

-- CreateIndex
CREATE INDEX "assigned_subjects_subject_id_idx" ON "assigned_subjects"("subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "assigned_subjects_section_id_subject_id_term_year_key" ON "assigned_subjects"("section_id", "subject_id", "term", "year");

-- CreateIndex
CREATE INDEX "enrollments_student_id_idx" ON "enrollments"("student_id");

-- CreateIndex
CREATE INDEX "enrollments_subject_id_idx" ON "enrollments"("subject_id");

-- CreateIndex
CREATE INDEX "enrollments_section_id_idx" ON "enrollments"("section_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_subject_id_term_year_key" ON "enrollments"("student_id", "subject_id", "term", "year");

-- CreateIndex
CREATE INDEX "inc_records_enrollment_id_idx" ON "inc_records"("enrollment_id");

-- CreateIndex
CREATE INDEX "audit_trail_actor_id_idx" ON "audit_trail"("actor_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_dean_id_fkey" FOREIGN KEY ("dean_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_subjects" ADD CONSTRAINT "assigned_subjects_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_subjects" ADD CONSTRAINT "assigned_subjects_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_subjects" ADD CONSTRAINT "assigned_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assigned_subjects" ADD CONSTRAINT "assigned_subjects_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inc_records" ADD CONSTRAINT "inc_records_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inc_records" ADD CONSTRAINT "inc_records_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inc_records" ADD CONSTRAINT "inc_records_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inc_records" ADD CONSTRAINT "inc_records_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trail" ADD CONSTRAINT "audit_trail_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

