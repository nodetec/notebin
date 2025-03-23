export const parseUint8Array = (secretKeyString: string | undefined) => {
  console.log("secretKeyString", secretKeyString);
  if (!secretKeyString) {
    return undefined;
  }

  if (secretKeyString === "0") {
    return undefined;
  }

  const numbersArray = secretKeyString.split(",").map((num) =>
    Number.parseInt(num, 10)
  );
  const uint8Array = new Uint8Array(numbersArray);

  console.log("secretKey parsed", uint8Array);

  return uint8Array;
};
