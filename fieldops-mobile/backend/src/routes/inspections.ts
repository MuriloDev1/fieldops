import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /inspections
 * Lista todas as inspeções.
 */
router.get("/", async (_req, res) => {
  try {
    const inspections = await prisma.inspection.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        equipment: true,
        responsible: true,
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        answers: true,
      },
    });

    res.json(inspections);
  } catch (error) {
    console.error("Erro ao listar inspeções:", error);

    res.status(500).json({
      error: "Erro ao listar inspeções.",
    });
  }
});

/**
 * GET /inspections/:id
 * Busca uma inspeção específica.
 */
router.get("/:id", async (req, res) => {
  try {
    const id = String(req.params.id);

    const inspection = await prisma.inspection.findUnique({
      where: {
        id,
      },
      include: {
        equipment: true,
        responsible: true,
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        answers: true,
      },
    });

    if (!inspection) {
      return res.status(404).json({
        error: "Inspeção não encontrada.",
      });
    }

    return res.json(inspection);
  } catch (error) {
    console.error("Erro ao buscar inspeção:", error);

    return res.status(500).json({
      error: "Erro ao buscar inspeção.",
    });
  }
});

/**
 * POST /inspections
 * Cria uma nova inspeção e suas perguntas.
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

    if (!title) {
      return res.status(400).json({
        error: "O título da inspeção é obrigatório.",
      });
    }

    const perguntas =
      Array.isArray(questions) && questions.length > 0
        ? questions
        : [
            {
              type: "COMPLIANCE",
              title: "O equipamento está em boas condições?",
              required: true,
              requireObservationOnFail: false,
              requirePhotoEvidence: false,
              order: 1,
            },
            {
              type: "MULTIPLE_CHOICE",
              title: "Qual o nível de pressão?",
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
        title: String(title),
        description: description
          ? String(description)
          : null,

        equipmentId: equipmentId
          ? String(equipmentId)
          : null,

        responsibleId: responsibleId
          ? String(responsibleId)
          : null,

        status: "IN_PROGRESS",

        questions: {
          create: perguntas.map(
            (question: any, index: number) => ({
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
            })
          ),
        },
      },

      include: {
        equipment: true,
        responsible: true,
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        answers: true,
      },
    });

    return res.status(201).json(inspection);
  } catch (error) {
    console.error("Erro ao criar inspeção:", error);

    return res.status(500).json({
      error: "Erro ao criar inspeção.",
      details:
        error instanceof Error
          ? error.message
          : String(error),
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
        error: "questionId é obrigatório.",
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
        error: "Pergunta não encontrada nesta inspeção.",
      });
    }

    const existingAnswer = await prisma.answer.findFirst({
      where: {
        inspectionId,
        questionId: String(questionId),
      },
    });

    let answer;

    if (existingAnswer) {
      answer = await prisma.answer.update({
        where: {
          id: existingAnswer.id,
        },
        data: {
          userId: userId ? String(userId) : null,
          value:
            value !== undefined && value !== null
              ? String(value)
              : null,
          observation:
            observation !== undefined &&
            observation !== null
              ? String(observation)
              : null,
          photoUrl:
            photoUrl !== undefined && photoUrl !== null
              ? String(photoUrl)
              : null,
          signatureUrl:
            signatureUrl !== undefined &&
            signatureUrl !== null
              ? String(signatureUrl)
              : null,
        },
      });
    } else {
      answer = await prisma.answer.create({
        data: {
          inspectionId,
          questionId: String(questionId),

          userId: userId
            ? String(userId)
            : null,

          value:
            value !== undefined && value !== null
              ? String(value)
              : null,

          observation:
            observation !== undefined &&
            observation !== null
              ? String(observation)
              : null,

          photoUrl:
            photoUrl !== undefined && photoUrl !== null
              ? String(photoUrl)
              : null,

          signatureUrl:
            signatureUrl !== undefined &&
            signatureUrl !== null
              ? String(signatureUrl)
              : null,
        },
      });
    }

    return res.json(answer);
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);

    return res.status(500).json({
      error: "Erro ao salvar resposta.",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

/**
 * PATCH /inspections/:id/complete
 * Finaliza uma inspeção.
 */
router.patch("/:id/complete", async (req, res) => {
  try {
    const inspectionId = String(req.params.id);

    const {
      responsibleId,
      observation,
    } = req.body;

    const inspection =
      await prisma.inspection.findUnique({
        where: {
          id: inspectionId,
        },
        include: {
          questions: {
            orderBy: {
              order: "asc",
            },
          },
          answers: true,
        },
      });

    if (!inspection) {
      return res.status(404).json({
        error: "Inspeção não encontrada.",
      });
    }

    const perguntasObrigatorias =
      inspection.questions.filter(
        (question) => question.required
      );

    const perguntasRespondidas =
      new Set(
        inspection.answers.map(
          (answer) => answer.questionId
        )
      );

    const perguntasNaoRespondidas =
      perguntasObrigatorias.filter(
        (question) =>
          !perguntasRespondidas.has(question.id)
      );

    if (perguntasNaoRespondidas.length > 0) {
      return res.status(400).json({
        error:
          "Existem perguntas obrigatórias sem resposta.",
        questions:
          perguntasNaoRespondidas.map(
            (question) => ({
              id: question.id,
              title: question.title,
            })
          ),
      });
    }

    const updatedInspection =
      await prisma.inspection.update({
        where: {
          id: inspectionId,
        },

        data: {
          status: "COMPLETED",

          responsibleId: responsibleId
            ? String(responsibleId)
            : inspection.responsibleId,

          description:
            observation !== undefined &&
            observation !== null
              ? String(observation)
              : inspection.description,
        },

        include: {
          equipment: true,
          responsible: true,
          questions: {
            orderBy: {
              order: "asc",
            },
          },
          answers: true,
        },
      });

    return res.json(updatedInspection);
  } catch (error) {
    console.error("Erro ao finalizar inspeção:", error);

    return res.status(500).json({
      error: "Erro ao finalizar inspeção.",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

/**
 * PATCH /inspections/:id/cancel
 * Cancela uma inspeção.
 */
router.patch("/:id/cancel", async (req, res) => {
  try {
    const inspectionId = String(req.params.id);

    const inspection =
      await prisma.inspection.findUnique({
        where: {
          id: inspectionId,
        },
      });

    if (!inspection) {
      return res.status(404).json({
        error: "Inspeção não encontrada.",
      });
    }

    const updatedInspection =
      await prisma.inspection.update({
        where: {
          id: inspectionId,
        },

        data: {
          status: "CANCELLED",
        },

        include: {
          equipment: true,
          responsible: true,
          questions: {
            orderBy: {
              order: "asc",
            },
          },
          answers: true,
        },
      });

    return res.json(updatedInspection);
  } catch (error) {
    console.error("Erro ao cancelar inspeção:", error);

    return res.status(500).json({
      error: "Erro ao cancelar inspeção.",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

export default router;