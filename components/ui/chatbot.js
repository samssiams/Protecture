import { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    // Create the first script tag (for chatbot config)
    const script1 = document.createElement('script');
    script1.innerHTML = `
      window.embeddedChatbotConfig = {
        chatbotId: "4iPn7ldfOTjEkJ5BXT2PY",
        domain: "www.chatbase.co"
      }
    `;
    document.body.appendChild(script1);

    // Create the second script tag (for embedding chatbot)
    const script2 = document.createElement('script');
    script2.src = 'https://www.chatbase.co/embed.min.js';
    script2.chatbotId = '4iPn7ldfOTjEkJ5BXT2PY';
    script2.domain = 'www.chatbase.co';
    script2.defer = true;
    document.body.appendChild(script2);

    // Cleanup scripts when component unmounts
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []); // Empty dependency array ensures this runs once when the component is mounted

  return null; // Chatbot is embedded in the body, no UI is needed in the component itself
};

export default Chatbot;
