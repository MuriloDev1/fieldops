import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "fieldops-secret-development";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

/**
 * POST /auth/register
 * Cria um novo usuário.
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "A senha deve possuir pelo menos 6 caracteres.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Já existe um usuário cadastrado com este e-mail.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const validRoles = ["ADMIN", "SUPERVISOR", "TECHNICIAN"];

    const selectedRole = validRoles.includes(role)
      ? role
      : "TECHNICIAN";

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: selectedRole,
      },
    });

    return res.status(201).json({
      message: "Usuário criado com sucesso.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    return res.status(500).json({
      message: "Erro interno ao cadastrar usuário.",
    });
  }
});

/**
 * POST /auth/login
 * Autentica um usuário.
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      message: "Login realizado com sucesso.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    return res.status(500).json({
      message: "Erro interno ao realizar login.",
    });
  }
});

/**
 * Middleware para verificar JWT.
 */
function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: Function
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Token não informado.",
    });
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Formato de token inválido.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: "",
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
}

/**
 * GET /auth/me
 * Retorna os dados do usuário autenticado.
 */
router.get(
  "/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          message: "Usuário não autenticado.",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "Usuário não encontrado.",
        });
      }

      return res.json({
        user,
      });
    } catch (error) {
      console.error("Erro ao consultar usuário:", error);

      return res.status(500).json({
        message: "Erro interno ao consultar usuário.",
      });
    }
  }
);

export default router;