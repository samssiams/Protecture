export default async function handler(req, res) {
    if (req.method === "GET") {
      const { userId } = req.query;
  
      // Log the userId to the console
      console.log("Received user ID:", userId);
  
      // Mocked response for testing purposes
      const userData = {
        id: userId,
        name: "Sample User",
        username: "sample_user",
      };
  
      return res.status(200).json(userData);
    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
  