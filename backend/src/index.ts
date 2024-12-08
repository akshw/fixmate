import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from "dotenv";
import path from "path";
import readlineSync from "readline-sync";
dotenv.config();
const API_KEY = process.env.API_KEY;

const userPrompt = readlineSync.question("Enter your problem: ");
console.log(userPrompt);

const fileManager = new GoogleAIFileManager(API_KEY);
const img_path = path.join(__dirname, "../../img/");

async function main() {
  const uploadResult = await fileManager.uploadFile(`${img_path}/bill.png`, {
    mimeType: "image/png",
    displayName: "Bill",
  });

  console.log(
    `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  );

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an expert at analyzing bills, invoices and receipts.
                  Please analyze this bill and provide a JSON object with the following fields:{
                  'seller_name:"", 'seller_address:"",'invoice_number:"",'order_id:"",'order_date:"",'invoice_date:"",
                  'buyer_name:"", 'buyer_address:"",'ship_to_name:"", 'ship_to_address:"",'total_amount:"",
                 'category:"", 'product_description:"", 'quantity:"",'warranty_period:""}.
                  The output should be in JSON format. If any field is not present, please leave it blank do not make it null and continue.
                  ${
                    "UserPrompt:" + userPrompt
                  } Now based on the user prompt, write an detailed email with a subject line on the problem user is facing to the customer service team of the product. 
                  You should analyze the product company based on the product name in the bill.
                  Provide the email along with the subject line in the JSON object like this:
                  {
                    "subject": "subject line",
                    "email": "detailed email"
                  }`,
          },
          {
            fileData: {
              fileUri: uploadResult.file.uri,
              mimeType: uploadResult.file.mimeType,
            },
          },
        ],
      },
    ],
  });
  console.log(result.response.text());
}

main().catch(console.error);
