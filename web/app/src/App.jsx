import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RegistryList from './pages/RegistryList';
import ComposeList from './pages/ComposeList';
import Certs from './pages/Certs';
import Scripts from './pages/Scripts';
import DocsViewer from './pages/DocsViewer';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="registry-list" element={<RegistryList />} />
        <Route path="compose-list" element={<ComposeList />} />
        <Route path="certs" element={<Certs />} />
        <Route path="scripts" element={<Scripts />} />
        <Route path="docs" element={<DocsViewer />} />
      </Route>
    </Routes>
  );
}
