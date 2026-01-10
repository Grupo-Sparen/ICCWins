import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import Batallas from './pages/Batallas';
import CrearBatalla from './pages/CrearBatalla';
import CrearTorneo from './pages/CrearTorneo';
import DetalleBatalla from './pages/DetalleBatalla';
import DetalleTorneo from './pages/DetalleTorneo';
import Gaming from './pages/Gaming';
import Ganadores from './pages/Ganadores';
import Home from './pages/Home';
import MiSuscripcion from './pages/MiSuscripcion';
import Podcast from './pages/Podcast';
import Premios from './pages/Premios';
import Suscripcion from './pages/Suscripcion';
import Torneos from './pages/Torneos';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminDashboard": AdminDashboard,
    "Batallas": Batallas,
    "CrearBatalla": CrearBatalla,
    "CrearTorneo": CrearTorneo,
    "DetalleBatalla": DetalleBatalla,
    "DetalleTorneo": DetalleTorneo,
    "Gaming": Gaming,
    "Ganadores": Ganadores,
    "Home": Home,
    "MiSuscripcion": MiSuscripcion,
    "Podcast": Podcast,
    "Premios": Premios,
    "Suscripcion": Suscripcion,
    "Torneos": Torneos,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};