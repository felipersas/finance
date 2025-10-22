-- CreateEnum
CREATE TYPE "public"."ExtratoType" AS ENUM ('Empresa', 'Pessoal');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('financeiro', 'estoque', 'fiscal', 'contrato', 'lembrete');

-- CreateTable
CREATE TABLE "public"."extrato_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "identificador" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "tipo_operacao" VARCHAR(100),
    "remetente_destinatario" VARCHAR(255),
    "documento" VARCHAR(50),
    "instituicao_financeira" VARCHAR(255),
    "codigo_banco" VARCHAR(10),
    "agencia" VARCHAR(20),
    "conta" VARCHAR(50),
    "tipo" "public"."ExtratoType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extrato_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."NotificationType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "isReminder" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extrato_records_identificador_key" ON "public"."extrato_records"("identificador");

-- CreateIndex
CREATE INDEX "idx_data" ON "public"."extrato_records"("data");

-- CreateIndex
CREATE INDEX "idx_identificador" ON "public"."extrato_records"("identificador");

-- CreateIndex
CREATE INDEX "idx_tipo_operacao" ON "public"."extrato_records"("tipo_operacao");

-- CreateIndex
CREATE INDEX "idx_documento" ON "public"."extrato_records"("documento");

-- CreateIndex
CREATE INDEX "idx_codigo_banco" ON "public"."extrato_records"("codigo_banco");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- AddForeignKey
ALTER TABLE "public"."extrato_records" ADD CONSTRAINT "extrato_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
