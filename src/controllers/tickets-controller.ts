import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTicketTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketTypes = await prisma.ticketType.findMany();
    res.status(200).send(ticketTypes);
  } catch (error) {
    next(error);
  }
};
export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollmentId = req.user?.id;
    const ticket = await prisma.ticket.findOne({
    where: { enrollmentId },
    include: { TicketType: true },
    });
    if (!ticket) {
      return res.status(404);
    }
    
    res.status(200).send(ticket);
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId } = req.user;
    const { ticketTypeId } = req.body;
    const ticket = await prisma.ticket.create({
      data: {
        ticketTypeId,
        enrollmentId,
        status: "RESERVED",
      },
      include: { TicketType: true },
    });
    
    res.status(201).send(ticket);
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.query;
    if (!ticketId) {
      return res.status(400).send({ message: "ticketId é obrigatório" });
    }
    try {
      const payment = await prisma.payment.findOne({ where: { ticketId } });
      if (!payment) {
      return res.status(404).send({ message: "Pagamento não encontrado" });
    }
    const ticket = await prisma.ticket.findOne({
      where: { id: ticketId, enrollmentId: req.userId },
    });
    if (!ticket) {
      return res.status(401).send({ message: "Usuário não autorizado" });
    }
    return res.status(200).send(payment);
  } catch (error) {
    return res.status(401).send({ message: "Falha na autenticação" });
  }
};

// router.post("/payments/process", async (req, res) => {
  export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId, cardData } = req.body;
    if (!ticketId) {
      return res.status(400).send({ message: "ticketId é obrigatório" });
    }
    if (!cardData) {
      return res.status(400).send({ message: "cardData é obrigatório" });
    }
    try {
      const ticket = await prisma.ticket.findOne({
        where: { id: ticketId, enrollmentId: req.userId },
      });
      if (!ticket) {
        return res.status(404).send({ message: "Bilhete não encontrado" });
      }
      const payment = await prisma.payment.create({
        data: {
          ticketId,
          cardIssuer: cardData.issuer,
          cardLastDigits: cardData.lastDigits,
          value: ticket.TicketType.price,
        },
      });
      return res.status(200).send(payment);
    } catch (error) {
      return res.status(401).send({ message: "Falha na autenticação" });
    }
}