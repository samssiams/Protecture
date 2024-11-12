
import "@/styles/globals.css";  // Import global styles
import { Chakra_Petch } from "next/font/google";  // Import Google Font

// Configure the Google Font with weights and subsets
const chakraPetch = Chakra_Petch({
  subsets: ["latin"],  // Specify the language subset
  weight: ["300", "400", "500", "700"],  // Specify the font weights you want to use
});

export default function App({ Component, pageProps }) {
  return (
    <div className={chakraPetch.className}>  {/* Apply the Google Font globally */}
      <Component {...pageProps} />
    </div>
  );
}
