import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import ProtectedRoute from '../component/ProtectedRoute';
import CategoryList from '../pages/categories/CategoryList';
import VocabularyList from '../pages/vocabularies/VocabularyList';
import VocabularyEdit from '../pages/vocabularies/VocabularyEdit';

export default function App() {
  return (
    <Routes>
      {/* Route Public: Ai vào cũng được */}
      <Route path="/login" element={<Login />} />
      
      {/* Route Private: Phải qua ải ProtectedRoute check API Get Me */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<Home />} />
        
        {/* Sau này làm trang nào thì cứ nhét vào trong này */}
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/vocabularies" element={<VocabularyList />} />
        <Route path="/vocabularies/edit/:id" element={<VocabularyEdit />} />
        {/* <Route path="/users" element={<UserList />} /> */}
      </Route>

      {/* Vào link lung tung tự động đá về Home (Home sẽ tự đá về Login nếu chưa có token) */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}