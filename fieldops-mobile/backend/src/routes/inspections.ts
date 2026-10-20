
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /inspections
 * Lista todas as inspeÃ§Ãµes.
 */
router.get("/", async (_req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        equipment: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        answers: true,
      },
    });

    return res.json(inspections);
  } catch (error) {
    console.error("Erro ao listar inspeÃ§Ãµes:", error);
    return res.status(500).json({
      error: "Erro ao listar inspeÃ§Ãµes.",
    });
  }
});

/**
 * GET /inspections/:id
 * Busca uma inspeÃ§Ã£o especÃ­fica.
 */
router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        equipment: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        answers: true,
      },
    });

    if (!inspection) {
      return res.status(404).json({
        error: "InspeÃ§Ã£o nÃ£o encontrada.",
      });
    }

    return res.json(inspection);
  } catch (error) {
    console.error("Erro ao buscar inspeÃ§Ã£o:", error);
    return res.status(500).json({
      error: "Erro ao buscar inspeÃ§Ã£o.",
    });
  }
});

/**
 * POST /inspections
 * Cria uma nova inspeÃ§Ã£o e suas perguntas.
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      equipmentId,
      responsibleId,
      questions,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        error: "O tÃ­tulo da inspeÃ§Ã£o Ã© obrigatÃ³rio.",
      });
    }

    const perguntas =
      Array.isArray(questions) && questions.length > 0
        ? questions
        : [
            {
              type: "COMPLIANCE",
              title: "O equipamento estÃ¡ em boas condiÃ§Ãµes?",
              required: true,
              requireObservationOnFail: false,
              requirePhotoEvidence: false,
              order: 1,
            },
            {
              type: "MULTIPLE_CHOICE",
              title: "Qual o nÃ­vel de pressÃ£o?",
              required: true,
              requireObservationOnFail: false,
              requirePhotoEvidence: false,
              order: 2,
            },
            {
              type: "COMPLIANCE",
              title: "Existe algum vazamento?",
              required: false,
              requireObservationOnFail: false,
              requirePhotoEvidence: false,
              order: 3,
            },
          ];

    const inspection = await prisma.inspection.create({
      data: {
        title: String(title).trim(),
        description: description ? String(description) : null,
        equipmentId: equipmentId ? String(equipmentId) : null,
        responsibleId: responsibleId ? String(responsibleId) : null,
        status: "IN_PROGRESS",
        questions: {
          create: perguntas.map((question: any, index: number) => ({
            type: question.type,
            title: String(question.title),
            required: Boolean(question.required),
            requireObservationOnFail: Boolean(
              question.requireObservationOnFail
            ),
            requirePhotoEvidence: Boolean(
              question.requirePhotoEvidence
            ),
            order:
              typeof question.order === "number"
                ? question.order
                : index + 1,
          })),
        },
      },
      include: {
        equipment: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        answers: true,
      },
    });

    return res.status(201).json(inspection);
  } catch (error) {
    console.error("Erro ao criar inspeÃ§Ã£o:", error);
    return res.status(500).json({
      error: "Erro ao criar inspeÃ§Ã£o.",
      details:
        error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * POST /inspections/:id/answers
 * Salva ou atualiza uma resposta.
 */
router.post("/:id/answers", async (req, res) => {
  try {
    const inspectionId = String(req.params.id);

    const {
      questionId,
      userId,
      value,
      observation,
      photoUrl,
      signatureUrl,
    } = req.body;

    if (!questionId) {
      return res.status(400).json({
        error: "questionId Ã© obrigatÃ³rio.",
      });
    }

    const question = await prisma.question.findFirst({
      where: {
        id: String(questionId),
        inspectionId,
      },
    });

    if (!question) {
      return res.status(404).json({
        error: "Pergunta nÃ£o encontrada nesta inspeÃ§Ã£o.",
      });
    }

    const existingAnswer = await prisma.answer.findFirst({
      where: {
        inspectionId,
        questionId: String(questionId),
      },
    });

    const answerData = {
      userId: userId ? String(userId) : null,
      value:
        value !== undefined && value !== null
          ? String(value)
          : null,
      observation:
        observation !== undefined && observation !== null
          ? String(observation)
          : null,
      photoUrl:
        photoUrl !== undefined && photoUrl !== null
          ? String(photoUrl)
          : null,
      signatureUrl:
        signatureUrl !== undefined && signatureUrl !== null
          ? String(signatureUrl)
          : null,
    };

    const answer = existingAnswer
      ? await prisma.answer.update({
          where: { id: existingAnswer.id },
          data: answerData,
        })
      : await prisma.answer.create({
          data: {
            inspectionId,
            questionId: String(questionId),
            ...answerData,
          },
        });

    return res.json(answer);
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    return res.status(500).json({
      error: "Erro ao salvar resposta.",
      details:
        error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * PATCH /inspections/:id/complete
 * Finaliza uma inspeÃ§Ã£o.
 */
router.patch("/:id/complete", async (req, res) => {
  try {
    const inspectionId = String(req.params.id);
    const { responsibleId, observation } = req.body;

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        answers: true,
      },
    });

    if (!inspection) {
      return res.status(404).json({
        error: "InspeÃ§Ã£o nÃ£o encontrada.",
      });
    }

    if (inspection.status === "CANCELLED") {
      return res.status(400).json({
        error: "NÃ£o Ã© possÃ­vel concluir uma inspeÃ§Ã£o cancelada.",
      });
    }

    const perguntasObrigatorias = inspection.questions.filter(
      (question) => question.required
    );

    const perguntasRespondidas = new Set(
      inspection.answers.map((answer) => answer.questionId)
    );

    const perguntasNaoRespondidas = perguntasObrigatorias.filter(
      (question) => !perguntasRespondidas.has(question.id)
    );

    if (perguntasNaoRespondidas.length > 0) {
      return res.status(400).json({
        error: "Existem perguntas obrigatÃ³rias sem resposta.",
        questions: perguntasNaoRespondidas.map((question) => ({
          id: question.id,
          title: question.title,
        })),
      });
    }

    const updatedInspection = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        status: "COMPLETED",
        responsibleId: responsibleId
          ? String(responsibleId)
          : inspection.responsibleId,
        description:
          observation !== undefined && observation !== null
            ? String(observation)
            : inspection.description,
      },
      include: {
        equipment: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        answers: true,
      },
    });

    return res.json(updatedInspection);
  } catch (error) {
    console.error("Erro ao finalizar inspeÃ§Ã£o:", error);
    return res.status(500).json({
      error: "Erro ao finalizar inspeÃ§Ã£o.",
      details:
        error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * PATCH /inspections/:id/review
 * Aprova ou reprova uma inspeÃ§Ã£o concluÃ­da.
 */
router.patch("/:id/review", async (req, res) => {
  try {
    const inspectionId = String(req.params.id);
    const { status, reviewerId, observation } = req.body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return res.status(400).json({
        error: "A decisÃ£o deve ser APPROVED ou REJECTED.",
      });
    }

    if (!reviewerId || typeof reviewerId !== "string") {
      return res.status(400).json({
        error: "O identificador do supervisor Ã© obrigatÃ³rio.",
      });
    }

    if (
      status === "REJECTED" &&
      (!observation || !String(observation).trim())
    ) {
      return res.status(400).json({
        error: "Informe uma observaÃ§Ã£o para justificar a reprovaÃ§Ã£o.",
      });
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      return res.status(404).json({
        error: "InspeÃ§Ã£o nÃ£o encontrada.",
      });
    }

    if (inspection.status !== "COMPLETED") {
      return res.status(400).json({
        error: "Somente inspeÃ§Ãµes concluÃ­das podem ser revisadas.",
      });
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!reviewer) {
      return res.status(404).json({
        error: "UsuÃ¡rio responsÃ¡vel pela revisÃ£o nÃ£o encontrado.",
      });
    }

    if (
      reviewer.role !== "ADMIN" &&
      reviewer.role !== "SUPERVISOR"
    ) {
      return res.status(403).json({
        error:
          "Somente administradores e supervisores podem revisar inspeÃ§Ãµes.",
      });
    }

    const updatedInspection = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        reviewStatus: status,
        reviewerId: reviewer.id,
        reviewObservation:
          observation != null && String(observation).trim()
            ? String(observation).trim()
            : null,
        reviewedAt: new Date(),
      },
      include: {
        equipment: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        answers: true,
      },
    });

    return res.json({
      message:
        status === "APPROVED"
          ? "InspeÃ§Ã£o aprovada com sucesso."
          : "InspeÃ§Ã£o reprovada com sucesso.",
      inspection: updatedInspection,
    });
  } catch (error) {
    console.error("Erro ao revisar inspeÃ§Ã£o:", error);
    return res.status(500).json({
      error: "Erro ao registrar a revisÃ£o da inspeÃ§Ã£o.",
      details:
        error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * PATCH /inspections/:id/cancel
 * Cancela uma inspeÃ§Ã£o.
 */
router.patch("/:id/cancel", async (req, res) => {
  try {
    const inspectionId = String(req.params.id);

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      return res.status(404).json({
        error: "InspeÃ§Ã£o nÃ£o encontrada.",
      });
    }

    const updatedInspection = await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        status: "CANCELLED",
      },
      include: {
        equipment: true,
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        questions: {
          orderBy: { order: "asc" },
        },
        answers: true,
      },
    });

    return res.json(updatedInspection);
  } catch (error) {
    console.error("Erro ao cancelar inspeÃ§Ã£o:", error);
    return res.status(500).json({
      error: "Erro ao cancelar inspeÃ§Ã£o.",
      details:
        error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;

