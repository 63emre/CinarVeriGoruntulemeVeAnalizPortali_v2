'use client';

import UserManager from '@/components/admin/UserManager';
import { FcManager } from 'react-icons/fc';

export default function AdminUsersPage() {
  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FcManager className="mr-2 h-8 w-8" />
          Kullanıcı Yönetimi
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Kullanıcıları ekleyin, düzenleyin ve yönetin
        </p>
      </div>

      <UserManager />
    </div>
  );
} 