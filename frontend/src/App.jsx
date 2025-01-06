import React, { useEffect ,useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Updated import
import Home from "./components/home";
import ScrollToHash from './components/ScrooltoHash';
import ScrollReveal from 'scrollreveal'; 
import LoginPage from "./pages/login";
import RegisterForm from './pages/register';
import Profile from './pages/complete_profile';
import "../src/Styles/index.css";
// import CodeRoom from './components/Editor/CodeRoom.jsx';
import CourseDetail from './components/Course/courseDeatils';
import EditorPage from "./components/Editor/EditorPage.jsx";
import CodeRoom from './components/Editor/codeRoom.jsx';
function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const scrollReveal = ScrollReveal({
      origin: "left",
      distance: "100px",
      duration: 2000,
      delay: 200,
    });

    scrollReveal.reveal(`.info_contain`);
    scrollReveal.reveal(`.glowing-bottom`, { origin: "right" });
    scrollReveal.reveal(`.box_1`, { origin: "right" });
    scrollReveal.reveal(`.heading_text`, { origin: "top" });
    scrollReveal.reveal(`.about-text`, { origin: "left" });
    scrollReveal.reveal(`.about-img`, { origin: "right" });
    scrollReveal.reveal(`.feature`, { origin: "bottom" });
    scrollReveal.reveal(`.course-section_new`, { origin: "right" });
    scrollReveal.reveal(`.contact-image`, { origin: "left" });
    scrollReveal.reveal(`.cont-form`, { origin: "right" });

    return () => {
      scrollReveal.destroy();
    };
  }, []);

  return (
    <Router>
     <ScrollToHash></ScrollToHash>
      <Routes>
        <Route path="/home" element={<Home />} />
      
        <Route path="/" element={<LoginPage />} />
        <Route path="/profile" element={<Profile {...user} />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/course/:id" element={<CourseDetail/>}  />
        <Route path="/editor_page/:roomId" element={<EditorPage/>}  />
        <Route path="/room" element={<CodeRoom/>}  />
      </Routes>
    
    </Router>
  );
}

export default App;
