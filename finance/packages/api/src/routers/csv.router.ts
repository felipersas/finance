import { protectedProcedure, router } from "../index";
import { parse } from "csv-parse/sync";
import prisma from "@finance/db"
import { z } from "zod";




  function extractFieldsFromDescricao(descricao: string) {
    let tipoOperacao = null;
    let remetenteDestinatario = null;
    let documento = null;
    let instituicaoFinanceira = null;
    let codigoBanco = null;
    let agencia = null;
    let conta = null;

    if (!descricao) return { tipoOperacao, remetenteDestinatario, documento, instituicaoFinanceira, codigoBanco, agencia, conta };

    // Tipo de operação
    if (descricao.toLowerCase().includes("pix")) tipoOperacao = "Pix";
    else if (descricao.toLowerCase().includes("compra")) tipoOperacao = "Compra";
    else if (descricao.toLowerCase().includes("transferência")) tipoOperacao = "Transferência";
    else if (descricao.toLowerCase().includes("boleto")) tipoOperacao = "Boleto";
    else if (descricao.toLowerCase().includes("fatura")) tipoOperacao = "Fatura";

    // Remetente/Destinatário (exemplo para Pix)
    const pixMatch = descricao.match(/Pix - ([^-]+) - ([^-.]+)[-.]/);
    if (pixMatch) {
      remetenteDestinatario = pixMatch[1]?.trim();
      documento = pixMatch[2]?.trim();
    }

    // Instituição financeira, agência, conta (exemplo para transferências)
    const instMatch = descricao.match(/Agência: (\d+) Conta: ([\d\-]+)/);
    if (instMatch) {
      agencia = instMatch[1];
      conta = instMatch[2];
    }

    const bancoMatch = descricao.match(/\((\d{4})\)/);
    if (bancoMatch) {
      codigoBanco = bancoMatch[1];
    }

    const instFinMatch = descricao.match(/- ([A-Z\s\.]+) \(/);
    if (instFinMatch) {
      instituicaoFinanceira = instFinMatch[1]?.trim();
    }

    return { tipoOperacao, remetenteDestinatario, documento, instituicaoFinanceira, codigoBanco, agencia, conta };
  }

export const csvRouter = router({
  upload: protectedProcedure.input(z.instanceof(FormData)).mutation(async ({input, ctx}) => {

      const data = input;
      const csv = data.get("csv");
      if (!(csv instanceof File)) {
        throw new Error("O campo 'csv' não é um arquivo válido.");
      }
      const file = await csv?.arrayBuffer();
      const buffer = Buffer.from(file);
      const csvString = buffer.toString("utf8");

      let records;
      try {
        records = parse(csvString, {
          columns: true,
          skip_empty_lines: true,
        });
      } catch (err) {
        return {
          success: false,
          message: "Erro ao processar CSV",
        };
      }

      const extratoRecords = records.map((r: any) => {
        const { tipoOperacao, remetenteDestinatario, documento, instituicaoFinanceira, codigoBanco, agencia, conta } =
          extractFieldsFromDescricao(r.Descrição);

        return {
          data: new Date(r.Data.split("/").reverse().join("-")), // dd/mm/yyyy -> yyyy-mm-dd
          valor: r.Valor,
          identificador: r.Identificador,
          descricao: r.Descrição,
          tipoOperacao,
          remetenteDestinatario,
          documento,
          instituicaoFinanceira,
          codigoBanco,
          agencia,
          conta,
          userId: ctx.session.user.id,
        };
      });

      // Insere em lote
      await prisma.extratoRecord.createMany({
        data: extratoRecords,
        skipDuplicates: true,
      });

      return {
        success: true,
        message: "CSV processado com sucesso",
      }
  })
});
