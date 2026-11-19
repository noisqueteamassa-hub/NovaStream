// Contrato de criptografia do armazenamento offline.
// A implementação final de arquivos grandes deve usar criptografia AES-GCM
// em blocos no módulo nativo Android/iOS, evitando carregar a faixa inteira
// na RAM. Não substitua este contrato por uma cifra JS improvisada.
export const ENCRYPTION_FORMAT = 'novastream-aes-gcm-chunked-v1';

export function assertNativeCryptoAvailable(adapter) {
  if (!adapter || typeof adapter.encryptFile !== 'function' || typeof adapter.decryptToCache !== 'function') {
    throw new Error('O mecanismo nativo de criptografia em blocos ainda não foi integrado. O download offline protegido permanece desativado nesta versão.');
  }
  return adapter;
}
