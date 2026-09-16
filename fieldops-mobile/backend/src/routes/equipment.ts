import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * LISTAR EQUIPAMENTOS
 * GET /equipments
 */
router.get("/", async (_req, res) => {
  try {
    const equipamentos = await prisma.equipment.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(equipamentos);
  } catch (error) {
    console.error("Erro ao listar equipamentos:", error);

    return res.status(500).json({
      message: "Não foi possível carregar os equipamentos.",
    });
  }
});

/**
 * BUSCAR EQUIPAMENTO POR ID
 * GET /equipments/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const equipamento = await prisma.equipment.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!equipamento) {
      return res.status(404).json({
        message: "Equipamento não encontrado.",
      });
    }

    return res.json(equipamento);
  } catch (error) {
    console.error("Erro ao buscar equipamento:", error);

    return res.status(500).json({
      message: "Não foi possível buscar o equipamento.",
    });
  }
});

/**
 * CADASTRAR EQUIPAMENTO
 * POST /equipments
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      code,
      location,
      description,
      status,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof code !== "string" ||
      !code.trim() ||
      typeof location !== "string" ||
      !location.trim()
    ) {
      return res.status(400).json({
        message: "Nome, código e localização são obrigatórios.",
      });
    }

    const codigo = code.trim().toUpperCase();

    const equipamentoExistente =
      await prisma.equipment.findUnique({
        where: {
          code: codigo,
        },
      });

    if (equipamentoExistente) {
      return res.status(409).json({
        message: `Já existe um equipamento cadastrado com o código ${codigo}.`,
      });
    }

    const statusValido =
      status === "ACTIVE" ||
      status === "MAINTENANCE" ||
      status === "INACTIVE"
        ? status
        : "ACTIVE";

    const equipamento = await prisma.equipment.create({
      data: {
        name: name.trim(),
        code: codigo,
        location: location.trim(),
        description:
          typeof description === "string" &&
          description.trim()
            ? description.trim()
            : null,
        status: statusValido,
      },
    });

    return res.status(201).json(equipamento);
  } catch (error) {
    console.error("Erro ao cadastrar equipamento:", error);

    return res.status(500).json({
      message: "Não foi possível cadastrar o equipamento.",
    });
  }
});

/**
 * EDITAR EQUIPAMENTO
 * PATCH /equipments/:id
 */
router.patch("/:id", async (req, res) => {
  try {
    const {
      name,
      code,
      location,
      description,
      status,
    } = req.body;

    const existente = await prisma.equipment.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!existente) {
      return res.status(404).json({
        message: "Equipamento não encontrado.",
      });
    }

    let codigo: string | undefined;

    if (typeof code === "string" && code.trim()) {
      codigo = code.trim().toUpperCase();

      const equipamentoComMesmoCodigo =
        await prisma.equipment.findFirst({
          where: {
            code: codigo,
            id: {
              not: req.params.id,
            },
          },
        });

      if (equipamentoComMesmoCodigo) {
        return res.status(409).json({
          message: `O código ${codigo} já está sendo utilizado por outro equipamento.`,
        });
      }
    }

    const data: {
      name?: string;
      code?: string;
      location?: string;
      description?: string | null;
      status?:
        | "ACTIVE"
        | "MAINTENANCE"
        | "INACTIVE";
    } = {};

    if (
      typeof name === "string" &&
      name.trim()
    ) {
      data.name = name.trim();
    }

    if (codigo) {
      data.code = codigo;
    }

    if (
      typeof location === "string" &&
      location.trim()
    ) {
      data.location = location.trim();
    }

    if (description === null) {
      data.description = null;
    } else if (typeof description === "string") {
      data.description =
        description.trim() || null;
    }

    if (
      status === "ACTIVE" ||
      status === "MAINTENANCE" ||
      status === "INACTIVE"
    ) {
      data.status = status;
    }

    const equipamento = await prisma.equipment.update({
      where: {
        id: req.params.id,
      },
      data,
    });

    return res.json(equipamento);
  } catch (error) {
    console.error("Erro ao atualizar equipamento:", error);

    return res.status(500).json({
      message: "Não foi possível atualizar o equipamento.",
    });
  }
});

export default router;