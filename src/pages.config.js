import Gaming from './pages/Gaming';
import Ganadores from './pages/Ganadores';
import Home from './pages/Home';
import MiSuscripcion from './pages/MiSuscripcion';
import Participar from './pages/Participar';
import Podcast from './pages/Podcast';
import Premios from './pages/Premios';
import Suscripcion from './pages/Suscripcion';
import Admin from './pages/Admin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Gaming": Gaming,
    "Ganadores": Ganadores,
    "Home": Home,
    "MiSuscripcion": MiSuscripcion,
    "Participar": Participar,
    "Podcast": Podcast,
    "Premios": Premios,
    "Suscripcion": Suscripcion,
    "Admin": Admin,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};