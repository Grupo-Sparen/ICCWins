import Admin from './pages/Admin';
import Gaming from './pages/Gaming';
import Ganadores from './pages/Ganadores';
import Home from './pages/Home';
import Participar from './pages/Participar';
import Podcast from './pages/Podcast';
import Premios from './pages/Premios';
import Suscripcion from './pages/Suscripcion';
import MiSuscripcion from './pages/MiSuscripcion';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Gaming": Gaming,
    "Ganadores": Ganadores,
    "Home": Home,
    "Participar": Participar,
    "Podcast": Podcast,
    "Premios": Premios,
    "Suscripcion": Suscripcion,
    "MiSuscripcion": MiSuscripcion,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};