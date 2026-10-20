import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth";
import equipmentRoutes from "./routes/equipment";
import inspectionRoutes from "./routes/inspections";
import userRoutes from "./routes/users";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "FieldOps Backend funcionando!",
  });
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "online",
      database: "connected",
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);

    res.status(500).json({
      status: "offline",
      database: "disconnected",
    });
  }
});

app.use("/auth", authRoutes);
app.use("/equipments", equipmentRoutes);
app.use("/inspections", inspectionRoutes);

app.listen(PORT, () => {
  console.log(`FieldOps Backend rodando na porta ${PORT}`);
});