import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getTicketTypes, getTickets, createTicket, getPayments, processPayment } from "@/controllers";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/tickets/types", getTicketTypes, authenticateToken)
  .get("/tickets", getTickets, authenticateToken)
  .post("/tickets", createTicket, authenticateToken)
  .get("/payments?ticketId=:ticketId", getPayments, authenticateToken)
  .post("/payments/process", processPayment, authenticateToken);
export { ticketsRouter };
