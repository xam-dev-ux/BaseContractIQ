export function calculateEntropy(bytecode: string): number {
  if (!bytecode || bytecode.length <= 2) return 0;

  const hex = bytecode.replace("0x", "");
  const frequency: { [key: string]: number } = {};

  for (let i = 0; i < hex.length; i++) {
    const char = hex[i];
    frequency[char] = (frequency[char] || 0) + 1;
  }

  let entropy = 0;
  const length = hex.length;

  for (const char in frequency) {
    const p = frequency[char] / length;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

export function detectBytecodeRepetition(
  contracts: { bytecode: string; address: string }[]
): Map<string, string[]> {
  const bytecodeMap = new Map<string, string[]>();

  contracts.forEach((contract) => {
    const { bytecode, address } = contract;
    const normalizedBytecode = bytecode.toLowerCase();

    if (bytecodeMap.has(normalizedBytecode)) {
      bytecodeMap.get(normalizedBytecode)!.push(address);
    } else {
      bytecodeMap.set(normalizedBytecode, [address]);
    }
  });

  const repeated = new Map<string, string[]>();
  bytecodeMap.forEach((addresses, bytecode) => {
    if (addresses.length > 3) {
      repeated.set(bytecode, addresses);
    }
  });

  return repeated;
}

export function isSimilarBytecode(bytecode1: string, bytecode2: string): boolean {
  if (!bytecode1 || !bytecode2) return false;

  const b1 = bytecode1.replace("0x", "");
  const b2 = bytecode2.replace("0x", "");

  if (Math.abs(b1.length - b2.length) > 100) return false;

  let differences = 0;
  const minLength = Math.min(b1.length, b2.length);

  for (let i = 0; i < minLength; i++) {
    if (b1[i] !== b2[i]) {
      differences++;
    }
  }

  const similarity = 1 - differences / minLength;
  return similarity > 0.95;
}

export function analyzeBytecodePattern(bytecode: string): {
  isSmall: boolean;
  lowEntropy: boolean;
  entropy: number;
} {
  const size = bytecode.replace("0x", "").length / 2;
  const entropy = calculateEntropy(bytecode);

  return {
    isSmall: size < 200,
    lowEntropy: entropy < 3.5,
    entropy,
  };
}
