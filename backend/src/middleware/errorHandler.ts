import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TierNotFoundError extends AppError {
  constructor() {
    super('Tier not found', 404, 'TIER_NOT_FOUND');
  }
}

export class InsufficientInventoryError extends AppError {
  constructor() {
    super('Not enough seats available', 409, 'INSUFFICIENT_INVENTORY');
  }
}

export class PaymentFailedError extends AppError {
  constructor() {
    super('Payment declined', 402, 'PAYMENT_FAILED');
  }
}

export function errorHandler(
  error: FastifyError | AppError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
    });
    return;
  }

  if ('statusCode' in error && (error as FastifyError).statusCode === 400) {
    reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: error.message,
    });
    return;
  }

  console.error('[error] Unhandled exception:', error);
  reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
