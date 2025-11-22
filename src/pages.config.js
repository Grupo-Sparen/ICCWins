import Home from './pages/Home';
import Premios from './pages/Premios';
import Ganadores from './pages/Ganadores';
import Podcast from './pages/Podcast';
import Gaming from './pages/Gaming';
import Participar from './pages/Participar';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Premios": Premios,
    "Ganadores": Ganadores,
    "Podcast": Podcast,
    "Gaming": Gaming,
    "Participar": Participar,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};