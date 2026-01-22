import { Decimal } from '@prisma/client/runtime/library';

/**
 * Converte Decimal do Prisma para número
 */
export function decimalToNumber(decimal: Decimal | number): number {
  return typeof decimal === 'number' ? decimal : parseFloat(decimal.toString());
}

/**
 * Serializa produto para JSON compatível
 */
export function serializeProduto<T extends { preco: Decimal | number }>(produto: T) {
  return {
    ...produto,
    preco: decimalToNumber(produto.preco),
  };
}

/**
 * Serializa array de produtos
 */
export function serializeProdutos<T extends { preco: Decimal | number }>(produtos: T[]) {
  return produtos.map(serializeProduto);
}
