import React from "react";
import EditorPage from "./pages/EditorPage";
import WelcomeModal from "./components/WelcomeModal";

function App() {
  return (
    <>
      <WelcomeModal />
      <EditorPage />
    </>
  );
}

export default App;
