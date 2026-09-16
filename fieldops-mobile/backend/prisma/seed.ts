import { prisma } from "../src/lib/prisma";

async function main() {
  const equipamentos = [
    {
      name: "Compressor de Ar Industrial",
      code: "COMP-001",
      location: "Setor de Produção",
      description: "Compressor utilizado no sistema pneumático da linha de produção.",
      status: "ACTIVE" as const,
    },
    {
      name: "Esteira Transportadora",
      code: "EST-001",
      location: "Linha de Montagem",
      description: "Esteira responsável pelo transporte de componentes entre os postos.",
      status: "ACTIVE" as const,
    },
    {
      name: "Empilhadeira Elétrica",
      code: "EMP-001",
      location: "Almoxarifado",
      description: "Equipamento utilizado para movimentação de materiais.",
      status: "MAINTENANCE" as const,
    },
    {
      name: "Painel Elétrico Principal",
      code: "PAIN-001",
      location: "Sala Elétrica",
      description: "Painel responsável pela distribuição elétrica do setor.",
      status: "ACTIVE" as const,
    },
    {
      name: "Máquina de Solda",
      code: "SOLD-001",
      location: "Setor de Soldagem",
      description: "Equipamento utilizado nos processos de soldagem industrial.",
      status: "INACTIVE" as const,
    },
  ];

  for (const equipamento of equipamentos) {
    await prisma.equipment.upsert({
      where: {
        code: equipamento.code,
      },
      update: {
        name: equipamento.name,
        location: equipamento.location,
        description: equipamento.description,
        status: equipamento.status,
      },
      create: equipamento,
    });
  }

  console.log("Equipamentos cadastrados com sucesso!");

  const total = await prisma.equipment.count();

  console.log(`Total de equipamentos no banco: ${total}`);
}

main()
  .catch((error) => {
    console.error("Erro ao cadastrar equipamentos:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });