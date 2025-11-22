import Home from './pages/Home';
import Premios from './pages/Premios';
import Ganadores from './pages/Ganadores';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Premios": Premios,
    "Ganadores": Ganadores,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};