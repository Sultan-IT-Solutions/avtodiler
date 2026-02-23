import type { RouteObject } from 'react-router-dom';
import App from './App';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { CarDetail } from './pages/CarDetail';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Brands } from './pages/Brands';
import { Service } from './pages/Service';
import { TestDrive } from './pages/TestDrive';
import { Offers } from './pages/Offers';
import { Dealers } from './pages/Dealers';
import AdminApp from './admin/AdminApp';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'car/:id', element: <CarDetail /> },
      { path: 'brands', element: <Brands /> },
      { path: 'service', element: <Service /> },
      { path: 'test-drive', element: <TestDrive /> },
      { path: 'offers', element: <Offers /> },
      { path: 'dealers', element: <Dealers /> },
      { path: 'contact', element: <Contact /> },
      { path: 'about', element: <About /> },
      { path: 'admin/*', element: <AdminApp /> },
    ],
  },
];
