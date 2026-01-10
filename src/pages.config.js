import Admin from './pages/Admin';
import Gaming from './pages/Gaming';
import Ganadores from './pages/Ganadores';
import Home from './pages/Home';
import MiSuscripcion from './pages/MiSuscripcion';
import Podcast from './pages/Podcast';
import Premios from './pages/Premios';
import Suscripcion from './pages/Suscripcion';
import Batallas from './pages/Batallas';
import Torneos from './pages/Torneos';
import CrearBatalla from './pages/CrearBatalla';
import CrearTorneo from './pages/CrearTorneo';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Gaming": Gaming,
    "Ganadores": Ganadores,
    "Home": Home,
    "MiSuscripcion": MiSuscripcion,
    "Podcast": Podcast,
    "Premios": Premios,
    "Suscripcion": Suscripcion,
    "Batallas": Batallas,
    "Torneos": Torneos,
    "CrearBatalla": CrearBatalla,
    "CrearTorneo": CrearTorneo,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};