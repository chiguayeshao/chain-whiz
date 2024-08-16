import "../styles/globals.css"
import { ThemeProvider } from "next-themes"

import { Web3Provider } from "providers/Web3"

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <Web3Provider>
        <Component {...pageProps} />
      </Web3Provider>
    </ThemeProvider>
  )
}

export default MyApp
