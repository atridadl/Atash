import "dotenv/config";

export const isShit = (email: string) => {
  if (!process.env.SHIT_LIST) {
    return false;
  }

  const shitListString = process.env.SHIT_LIST as string;
  const shitList = shitListString.split(",");

  let result = false;

  shitList.forEach((shitItem) => {
    if (email.includes(shitItem)) {
      console.log(
        `🔴 BLOCKED USEREMAIL: ${email}\n🔴 FAILED CONDITION: ${shitItem}`
      );

      result = true;
    }
  });

  return result;
};
