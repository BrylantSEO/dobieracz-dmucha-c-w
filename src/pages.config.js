import Home from './pages/Home';
import Wizard from './pages/Wizard';
import AdminDashboard from './pages/AdminDashboard';
import AdminInflatables from './pages/AdminInflatables';
import AdminQuotes from './pages/AdminQuotes';
import AdminQuoteDetails from './pages/AdminQuoteDetails';
import AdminTags from './pages/AdminTags';
import AdminBookings from './pages/AdminBookings';


export const PAGES = {
    "Home": Home,
    "Wizard": Wizard,
    "AdminDashboard": AdminDashboard,
    "AdminInflatables": AdminInflatables,
    "AdminQuotes": AdminQuotes,
    "AdminQuoteDetails": AdminQuoteDetails,
    "AdminTags": AdminTags,
    "AdminBookings": AdminBookings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};