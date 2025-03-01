// src/App.tsx
import Chat from "./Chat";
import Aside from "./components/Aside";

const App: React.FC = () => {
  return (
    <div className="flex">
      <Aside />
      <Chat />
    </div>
  );
};

export default App;
