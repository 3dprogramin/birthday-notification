// create a function that makes a webhook request to discord
import axios from "axios";

async function sendNotification(webhookUrl, content) {
  try {
    const response = await axios.post(webhookUrl, {
      content: content,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to send message to Discord: ${error.message}`);
  }
}

export { sendNotification };