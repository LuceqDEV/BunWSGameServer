-- CreateTable
CREATE TABLE "Accounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Characters" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "currentLevel" INTEGER NOT NULL DEFAULT 0,
    "currentExp" INTEGER NOT NULL DEFAULT 0,
    "mapsId" INTEGER NOT NULL,
    "mapPosX" INTEGER NOT NULL DEFAULT 1,
    "mapPosY" INTEGER NOT NULL DEFAULT 1,
    "lastDirection" INTEGER NOT NULL DEFAULT 0,
    "accountsId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Characters_mapsId_fkey" FOREIGN KEY ("mapsId") REFERENCES "Maps" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Characters_accountsId_fkey" FOREIGN KEY ("accountsId") REFERENCES "Accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Maps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "mapSizeX" INTEGER NOT NULL DEFAULT 1,
    "mapSizeY" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_email_key" ON "Accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Characters_name_key" ON "Characters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Maps_name_key" ON "Maps"("name");
