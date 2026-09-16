import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /users
 * Lista todos os usuários
 */
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);

    res.status(500).json({
      error: "Erro ao listar usuários.",
    });
  }
});

/**
 * GET /users/:id
 * Busca um usuário específico
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado.",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);

    res.status(500).json({
      error: "Erro ao buscar usuário.",
    });
  }
});

/**
 * POST /users
 * Cria um novo usuário
 */
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    const emailNormalizado = String(email)
      .trim()
      .toLowerCase();

    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        error: "Já existe um usuário com este e-mail.",
      });
    }

    const rolesValidos = [
      "ADMIN",
      "SUPERVISOR",
      "TECHNICIAN",
    ];

    const roleFinal = role || "TECHNICIAN";

    if (!rolesValidos.includes(roleFinal)) {
      return res.status(400).json({
        error: "Perfil de usuário inválido.",
      });
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: emailNormalizado,
        password: String(password),
        role: roleFinal,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    res.status(500).json({
      error: "Erro ao criar usuário.",
    });
  }
});

/**
 * PATCH /users/:id
 * Atualiza um usuário
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    const usuarioExistente = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        error: "Usuário não encontrado.",
      });
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: "ADMIN" | "SUPERVISOR" | "TECHNICIAN";
    } = {};

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({
          error: "O nome não pode ficar vazio.",
        });
      }

      data.name = String(name).trim();
    }

    if (email !== undefined) {
      const emailNormalizado = String(email)
        .trim()
        .toLowerCase();

      const outroUsuario = await prisma.user.findFirst({
        where: {
          email: emailNormalizado,
          NOT: {
            id,
          },
        },
      });

      if (outroUsuario) {
        return res.status(409).json({
          error: "Já existe outro usuário com este e-mail.",
        });
      }

      data.email = emailNormalizado;
    }

    if (password !== undefined && String(password).trim()) {
      data.password = String(password);
    }

    if (role !== undefined) {
      const rolesValidos = [
        "ADMIN",
        "SUPERVISOR",
        "TECHNICIAN",
      ];

      if (!rolesValidos.includes(role)) {
        return res.status(400).json({
          error: "Perfil de usuário inválido.",
        });
      }

      data.role = role;
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);

    res.status(500).json({
      error: "Erro ao atualizar usuário.",
    });
  }
});

/**
 * DELETE /users/:id
 * Remove um usuário
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado.",
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Usuário removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);

    res.status(500).json({
      error: "Não foi possível remover o usuário.",
    });
  }
});

export default router;