import AdminAvailability from './pages/AdminAvailability';
import AdminBookings from './pages/AdminBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminImport from './pages/AdminImport';
import AdminInflatables from './pages/AdminInflatables';
import AdminQuoteDetails from './pages/AdminQuoteDetails';
import AdminQuotes from './pages/AdminQuotes';
import AdminTags from './pages/AdminTags';
import Wizard from './pages/Wizard';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminAvailability": AdminAvailability,
    "AdminBookings": AdminBookings,
    "AdminDashboard": AdminDashboard,
    "AdminImport": AdminImport,
    "AdminInflatables": AdminInflatables,
    "AdminQuoteDetails": AdminQuoteDetails,
    "AdminQuotes": AdminQuotes,
    "AdminTags": AdminTags,
    "Wizard": Wizard,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};